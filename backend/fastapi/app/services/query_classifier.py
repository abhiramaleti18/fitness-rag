import re

PLAN_KEYWORDS = ["plan", "schedule", "program", "routine", "days a week", "week workout", "split"]

MUSCLE_KEYWORDS = [
    "chest", "back", "shoulder", "delt", "tricep", "bicep", "arm", "leg", "quad",
    "hamstring", "glute", "calf", "core", "ab", "lat", "trap", "forearm"
]

GOAL_KEYWORDS = [
    "strength", "hypertrophy", "muscle", "endurance", "fat loss", "tone", "bulk", "cut"
]

def is_plan_request(query: str) -> bool:
    q = query.lower()
    return any(kw in q for kw in PLAN_KEYWORDS)

def extract_days(query: str) -> int:
    """Look for a number of days mentioned (e.g. '5 days a week'). Defaults to 3."""
    match = re.search(r'(\d+)\s*day', query.lower())
    if match:
        days = int(match.group(1))
        return max(1, min(days, 7))
    return 3

def extract_equipment(query: str) -> list[str] | None:
    """Detect equipment constraints mentioned in plain language."""
    q = query.lower()
    if any(phrase in q for phrase in ["no equipment", "bodyweight", "body weight", "at home", "without equipment", "no gym"]):
        return ["BODY_WEIGHT", "NONE"]
    if "dumbbell" in q:
        return ["DUMBBELL"]
    if "barbell" in q:
        return ["BARBELL"]
    if "kettlebell" in q:
        return ["KETTLEBELL"]
    if "resistance band" in q:
        return ["RESISTANCE_BANDS"]
    return None

def is_query_too_vague(query: str) -> bool:
    """
    Detects queries with no concrete muscle group, exercise name, or goal —
    these produce unreliable retrieval since there's nothing specific to match against.
    """
    q = query.lower()
    has_muscle = any(kw in q for kw in MUSCLE_KEYWORDS)
    has_goal = any(kw in q for kw in GOAL_KEYWORDS)
    is_short_generic = len(q.split()) <= 6 and not has_muscle and not has_goal

    return is_short_generic and not has_muscle and not has_goal