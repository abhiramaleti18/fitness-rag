import random
import re
from app.core.database import exercises_collection
from app.services.exercise_annotator import annotate_exercise
from app.services.exercise_tiers import get_tiers_for_role, is_fundamental

STRENGTH_CATEGORIES = ["STRENGTH", "POWERLIFTING", "OLYMPIC_WEIGHTLIFTING"]

LEVEL_ORDER = ["beginner", "intermediate", "expert"]


def _allowed_levels(user_level: str) -> list[str] | None:
    """A user can do their own level and everything easier — never excludes foundational/easier lifts."""
    if not user_level or user_level.lower() not in LEVEL_ORDER:
        return None
    max_index = LEVEL_ORDER.index(user_level.lower())
    return [lvl.upper() for lvl in LEVEL_ORDER[:max_index + 1]]


def _fetch_for_slot(slot_def: dict, equipment_filter, level, exclude_names: set, excluded_categories: list[str] = None) -> dict | None:
    allowed_categories = [c for c in STRENGTH_CATEGORIES if not excluded_categories or c not in excluded_categories]

    query = {
        "primaryMuscles": slot_def["muscle"],
        "category": {"$in": allowed_categories}
    }
    if slot_def.get("pattern"):
        query["movementPattern"] = slot_def["pattern"]
    if equipment_filter:
        query["equipment"] = {"$in": [e.upper() for e in equipment_filter]}

    allowed_levels = _allowed_levels(level)
    if allowed_levels:
        query["level"] = {"$in": allowed_levels}

    candidates = list(exercises_collection.find(query, {"_id": 0}))
    candidates = [c for c in candidates if c["name"] not in exclude_names]

    if not candidates:
        return None

    # --- Tier-based ranking (real coaching priority) ---
    role = slot_def.get("role")
    tiers = get_tiers_for_role(role) if role else None

    if tiers:
        for tier_key in ["tier1", "tier2", "tier3"]:
            tier_names = tiers.get(tier_key, [])
            tier_matches = [
                c for c in candidates
                if any(tn.lower() in c["name"].lower() or c["name"].lower() in tn.lower() for tn in tier_names)
            ]
            if tier_matches:
                random.shuffle(tier_matches)
                return tier_matches[0]
        # No tier match found at all — fall through to fundamental/keyword/random below

    # --- Fundamental fallback (roles with no hand-curated tier list yet) ---
    if not tiers:
        fundamental_matches = [c for c in candidates if is_fundamental(c["name"])]
        print(f"DEBUG FUNDAMENTAL: role={role}, candidates={len(candidates)}, fundamental_matches={[c['name'] for c in fundamental_matches]}")
        if fundamental_matches:
            random.shuffle(fundamental_matches)
            return fundamental_matches[0]

    # --- Existing keyword matching (fallback) ---
    keywords = slot_def.get("keywords")
    if keywords:
        keyword_matches = [
            c for c in candidates
            if any(re.search(kw, c["name"], re.IGNORECASE) for kw in keywords)
        ]
        if keyword_matches:
            candidates = keyword_matches

    random.shuffle(candidates)
    return candidates[0]


def _build_day(day_def: dict, equipment_filter: list[str] = None, level: str = None, excluded_categories: list[str] = None) -> dict:
    selected = []
    seen_names = set()

    print(f"DEBUG DAY: {day_def['label']} | excluded_categories={excluded_categories}")

    for slot_def in day_def["slots"]:
        count = slot_def.get("count", 1)
        for _ in range(count):
            exercise = _fetch_for_slot(slot_def, equipment_filter, level, seen_names, excluded_categories)
            if exercise:
                print(f"DEBUG SLOT: {slot_def['muscle']} -> {exercise['name']} (category={exercise.get('category')})")
                selected.append(annotate_exercise(exercise))
                seen_names.add(exercise["name"])

    return {
        "day": None,
        "focus": day_def["label"],
        "exercises": selected
    }


def build_plan(query: str, days: int, equipment_filter: list[str] = None, level: str = None, excluded_categories: list[str] = None) -> list[dict]:
    from app.services.split_definitions import get_split_by_name, get_split_by_days

    split = get_split_by_name(query) or get_split_by_days(days)
    day_defs = split[:days] if len(split) >= days else split

    plan = []
    for i, day_def in enumerate(day_defs):
        day_result = _build_day(day_def, equipment_filter, level, excluded_categories)
        day_result["day"] = i + 1
        plan.append(day_result)

    return plan