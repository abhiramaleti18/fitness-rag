from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.vector_search_service import vector_search
from app.services.context_builder import build_context
from app.services.prompt_builder import build_prompt
from app.services.llm_provider import get_completion
from app.services.response_formatter import format_response
from app.core.database import exercises_collection
from app.core.config import settings
from app.services.query_classifier import is_plan_request, extract_days, extract_equipment
from app.services.query_classifier import extract_excluded_categories
from app.services.plan_builder import build_plan
from app.services.query_classifier import (
    is_plan_request, extract_days, extract_equipment,
    is_query_too_vague, extract_excluded_categories, map_user_equipment_to_filter,
    extract_has_pull_up_bar, user_has_pull_up_bar
)
from app.services.constraint_service import get_active_constraints, get_avoid_list, get_prefer_list, get_coaching_notes
from app.services.split_analysis_service import analyze_split
from app.services.split_analysis_prompt import build_split_analysis_prompt

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    top_k: int | None = None


class UserContext(BaseModel):
    experienceLevel: str | None = None
    equipmentAccess: list[str] | None = None
    fitnessGoals: list[str] | None = None
    weight: float | None = None
    recentPRs: list[dict] | None = None
    injuries: list[str] | None = None


class RecommendRequest(BaseModel):
    query: str
    top_k: int | None = None
    userContext: UserContext | None = None


class PlanRequest(BaseModel):
    query: str
    userContext: UserContext | None = None


class SplitExercise(BaseModel):
    exerciseName: str


class SplitDay(BaseModel):
    dayNumber: int
    focus: str | None = None
    exercises: list[SplitExercise]


class AnalyzeSplitRequest(BaseModel):
    days: list[SplitDay]

DEFAULT_EXCLUDED_CATEGORIES = ["STRETCHING", "CARDIO", "PLYOMETRICS"]


@router.get("/health")
def health_check():
    try:
        exercises_collection.count_documents({})
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    return {
        "status": "ok",
        "mongodb": db_status,
        "embedding_model": settings.EMBEDDING_MODEL,
        "llm_model": settings.LLM_MODEL
    }


@router.post("/search")
def search(request: SearchRequest):
    try:
        results = vector_search(request.query, top_k=request.top_k)
        return {"results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recommend")
def recommend(request: RecommendRequest):
    try:
        if is_query_too_vague(request.query):
            return {
                "answer": "Could you be a bit more specific? For example, tell me a muscle group (like chest, back, or legs), a goal (like building strength or muscle), or a particular exercise you want to know about.",
                "recommendedExercises": [],
                "sources": [],
                "needsClarification": True
            }

        excluded = list(DEFAULT_EXCLUDED_CATEGORIES) + extract_excluded_categories(request.query)
        # Always exclude Olympic lifts from general recommendations unless explicitly requested
        if "olympic" not in request.query.lower():
            excluded.append("OLYMPIC_WEIGHTLIFTING")

        equipment_filter = None
        if request.userContext and request.userContext.equipmentAccess:
            equipment_filter = map_user_equipment_to_filter(request.userContext.equipmentAccess)

        primary_goal = request.userContext.fitnessGoals[0] if (request.userContext and request.userContext.fitnessGoals) else None
        level = request.userContext.experienceLevel if request.userContext else None

        results = vector_search(request.query, top_k=request.top_k, exclude_categories=excluded, equipment_filter=equipment_filter)
        context = build_context(results, goal=primary_goal, level=level)
        messages = build_prompt(request.query, context, request.userContext)
        answer = get_completion(messages)
        return format_response(answer, results)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/exercise/{exercise_id}")
def get_exercise(exercise_id: str):
    exercise = exercises_collection.find_one({"id": exercise_id}, {"_id": 0})
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise

@router.get("/exercises")
def list_exercises(category: str | None = None, equipment: str | None = None, level: str | None = None, name: str | None = None, limit: int = 30, skip: int = 0):
    query = {}
    if category:
        query["category"] = {"$regex": f"^{category}$", "$options": "i"}
    if equipment:
        query["equipment"] = {"$regex": f"^{equipment}$", "$options": "i"}
    if level:
        query["level"] = {"$regex": f"^{level}$", "$options": "i"}
    if name:
        query["name"] = {"$regex": name, "$options": "i"}

    cursor = exercises_collection.find(query, {"_id": 0}).skip(skip).limit(limit)
    results = list(cursor)
    total = exercises_collection.count_documents(query)

    return {"results": results, "total": total, "limit": limit, "skip": skip}   

@router.post("/plan")
def plan(request: PlanRequest):
    try:
        days = extract_days(request.query)
        equipment_filter = extract_equipment(request.query)
        excluded_categories = extract_excluded_categories(request.query)

        if not equipment_filter and request.userContext and request.userContext.equipmentAccess:
            equipment_filter = map_user_equipment_to_filter(request.userContext.equipmentAccess)

        level = request.userContext.experienceLevel if request.userContext else None

        has_pull_up_bar = extract_has_pull_up_bar(request.query) or user_has_pull_up_bar(
            request.userContext.equipmentAccess if request.userContext else None
        )

        user_injuries = getattr(request.userContext, "injuries", None) if request.userContext else None
        active_constraints = get_active_constraints(request.query, user_injuries)
        avoid_list = get_avoid_list(active_constraints)
        prefer_list = get_prefer_list(active_constraints)
        coaching_notes = get_coaching_notes(active_constraints)

        primary_goal = request.userContext.fitnessGoals[0] if (request.userContext and request.userContext.fitnessGoals) else None

        plan_days = build_plan(request.query, days, equipment_filter, level, excluded_categories, avoid_list, prefer_list, goal=primary_goal, has_pull_up_bar=has_pull_up_bar)

        return {
            "days": len(plan_days),
            "equipmentFilter": equipment_filter,
            "excludedCategories": excluded_categories,
            "activeConstraints": active_constraints,
            "coachingNotes": coaching_notes,
            "plan": plan_days
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-split")
def analyze_split_endpoint(request: AnalyzeSplitRequest):
    try:
        days = [d.dict() for d in request.days]
        analysis = analyze_split(days)

        messages = build_split_analysis_prompt(analysis["summary"])
        report_text = get_completion(messages)

        return {
            "muscleCoverage": analysis["muscleCoverage"],
            "movementPatternBalance": analysis["movementPatternBalance"],
            "report": report_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))