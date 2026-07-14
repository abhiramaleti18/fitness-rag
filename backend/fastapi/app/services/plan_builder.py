import random
import re
from app.core.database import exercises_collection
from app.services.exercise_annotator import annotate_exercise
from app.services.exercise_tiers import get_tiers_for_role, is_fundamental
from app.services.home_exercise_tiers import get_home_tiers
from app.services.mobility_service import get_stretches_for_muscles

STRENGTH_CATEGORIES = ["STRENGTH", "POWERLIFTING", "OLYMPIC_WEIGHTLIFTING"]

LEVEL_ORDER = ["beginner", "intermediate", "advanced"]

HOME_EQUIPMENT_SET = {"BODY_WEIGHT", "NONE"}


def _is_home_workout(equipment_filter: list[str] | None) -> bool:
    """True only when the equipment filter is bodyweight-only — not for
    dumbbell/barbell/etc. requests, and not for unrestricted full-gym plans."""
    if not equipment_filter:
        return False
    return set(e.upper() for e in equipment_filter) <= HOME_EQUIPMENT_SET   

def _allowed_levels(user_level: str) -> list[str] | None:
    """A user can do their own level and everything easier — never excludes foundational/easier lifts."""
    if not user_level or user_level.lower() not in LEVEL_ORDER:
        return None
    max_index = LEVEL_ORDER.index(user_level.lower())
    return [lvl.upper() for lvl in LEVEL_ORDER[:max_index + 1]]


def _fetch_for_slot(slot_def: dict, equipment_filter, level, exclude_names: set, excluded_categories: list[str] = None, avoid_list: set = None, prefer_list: set = None, has_pull_up_bar: bool = False) -> dict | None:
    allowed_categories = [c for c in STRENGTH_CATEGORIES if not excluded_categories or c not in excluded_categories]
    home_workout = _is_home_workout(equipment_filter)

    query = {
        "primaryMuscles": slot_def["muscle"],
        "category": {"$in": allowed_categories}
    }
    if slot_def.get("pattern"):
        query["movementPattern"] = slot_def["pattern"]
    if equipment_filter:
        query["equipment"] = {"$in": [e.upper() for e in equipment_filter]}
    if home_workout:
        query["homeGymCompatible"] = True

    allowed_levels = _allowed_levels(level)
    if allowed_levels:
        query["level"] = {"$in": allowed_levels}

    candidates = list(exercises_collection.find(query, {"_id": 0}))
    candidates = [c for c in candidates if c["name"] not in exclude_names]

    # --- Constraint filtering: remove anything that conflicts with stated injuries ---
    if avoid_list:
        candidates = [c for c in candidates if not any(term in c["name"].lower() for term in avoid_list)]

    if not candidates:
        return None

    # --- Constraint preference: boost preferred substitutes to the front ---
    if prefer_list:
        preferred = [c for c in candidates if any(term in c["name"].lower() for term in prefer_list)]
        if preferred:
            random.shuffle(preferred)
            return preferred[0]

    # --- Tier-based ranking (real coaching priority) ---
    role = slot_def.get("role")
    if home_workout:
        tiers = get_home_tiers(has_pull_up_bar).get(role) if role else None
    else:
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

    if not tiers:
        fundamental_matches = [c for c in candidates if is_fundamental(c["name"])]
        if fundamental_matches:
            random.shuffle(fundamental_matches)
            return fundamental_matches[0]

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


def _get_warmup(day_def: dict, equipment_filter: list[str] = None, has_pull_up_bar: bool = False, count: int = 2) -> list[dict]:
    """Pulls warm-up stretches for the day's target muscles from the curated
    mobility knowledge base (real coaching data — hold times, coaching cues,
    contraindications), falling back to the exercise DB's generic STRETCHING
    category only if a muscle has no match in the mobility library."""
    muscles = list({slot_def["muscle"] for slot_def in day_def["slots"]})

    stretches = get_stretches_for_muscles(muscles, before_workout=True, has_pull_up_bar=has_pull_up_bar, limit=count)

    if stretches:
        return [
            {
                "name": s["name"],
                "targetMuscle": s["targets"][0] if s.get("targets") else None,
                "instructions": s.get("coachingCues", []),
                "holdTime": s.get("hold") or (f"{s.get('reps')} reps" if s.get("reps") else "As prescribed")
            }
            for s in stretches
        ]

    # Fallback for muscles with no mobility-library match yet (e.g. abdominals,
    # biceps only map loosely) — reuse the old DB-based lookup.
    home_workout = _is_home_workout(equipment_filter)
    query = {"category": "STRETCHING", "primaryMuscles": {"$in": muscles}}
    if home_workout:
        query["homeGymCompatible"] = True

    candidates = list(exercises_collection.find(query, {"_id": 0}))
    random.shuffle(candidates)

    picks = []
    seen = set()
    for c in candidates:
        if c["name"] in seen:
            continue
        picks.append({
            "name": c["name"],
            "targetMuscle": c["primaryMuscles"][0] if c.get("primaryMuscles") else None,
            "instructions": c.get("instructions", []),
            "holdTime": "20-30 seconds per side"
        })
        seen.add(c["name"])
        if len(picks) >= count:
            break

    return picks


def _build_day(day_def: dict, equipment_filter: list[str] = None, level: str = None, excluded_categories: list[str] = None, avoid_list: set = None, prefer_list: set = None, goal: str = None, has_pull_up_bar: bool = False) -> dict:
    selected = []
    seen_names = set()

    for slot_def in day_def["slots"]:
        count = slot_def.get("count", 1)
        for _ in range(count):
            exercise = _fetch_for_slot(slot_def, equipment_filter, level, seen_names, excluded_categories, avoid_list, prefer_list, has_pull_up_bar)
            if exercise:
                selected.append(annotate_exercise(exercise, goal=goal, level=level))
                seen_names.add(exercise["name"])

    return {
        "day": None,
        "focus": day_def["label"],
        "warmup": _get_warmup(day_def, equipment_filter, has_pull_up_bar),
        "exercises": selected
    }


def build_plan(query: str, days: int, equipment_filter: list[str] = None, level: str = None, excluded_categories: list[str] = None, avoid_list: set = None, prefer_list: set = None, goal: str = None, has_pull_up_bar: bool = False) -> list[dict]:
    from app.services.split_definitions import get_split_by_name, get_split_by_days

    split = get_split_by_name(query) or get_split_by_days(days)
    day_defs = split[:days] if len(split) >= days else split

    plan = []
    for i, day_def in enumerate(day_defs):
        day_result = _build_day(day_def, equipment_filter, level, excluded_categories, avoid_list, prefer_list, goal, has_pull_up_bar)
        day_result["day"] = i + 1
        plan.append(day_result)

    return plan