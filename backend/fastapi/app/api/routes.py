from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.vector_search_service import vector_search
from app.services.context_builder import build_context
from app.services.prompt_builder import build_prompt
from app.services.llm_provider import get_completion
from app.services.response_formatter import format_response
from app.core.database import exercises_collection
from app.core.config import settings

router = APIRouter()


class SearchRequest(BaseModel):
    query: str
    top_k: int | None = None


class RecommendRequest(BaseModel):
    query: str
    top_k: int | None = None


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
        results = vector_search(request.query, top_k=request.top_k)
        context = build_context(results)
        messages = build_prompt(request.query, context)
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