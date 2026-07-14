import re

PLAN_KEYWORDS = ["plan", "schedule", "program", "routine", "days a week", "week workout", "split"]

MUSCLE_KEYWORDS = [
    "chest", "back", "shoulder", "delt", "tricep", "bicep", "arm", "leg", "quad",
    "hamstring", "glute", "calf", "core", "ab", "lat", "trap", "forearm"
]

GOAL_KEYWORDS = [
    "strength", "hypertrophy", "muscle", "endurance", "fat loss", "tone", "bulk", "cut"
]

EQUIPMENT_MAP = {
    "BODYWEIGHT": ["BODY_WEIGHT", "NONE"],
    "DUMBBELLS": ["DUMBBELL"],
    "BARBELL": ["BARBELL"],
    "RESISTANCE BANDS": ["RESISTANCE_BANDS"],
    "FULL GYM": None,  # None means "no restriction" — full gym access implies everything is available
}

MOBILITY_KEYWORDS = [
    "stretch", "stretches", "stretching", "mobility", "flexibility", "flexible",
    "warm up", "warm-up", "cool down", "cool-down", "loosen", "tight", "tightness"
]


def is_mobility_query(query: str) -> bool:
    q = query.lower()
    return any(kw in q for kw in MOBILITY_KEYWORDS)

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

def extract_excluded_categories(query: str) -> list[str]:
    q = query.lower()
    excluded = []
    if any(phrase in q for phrase in ["no olympic", "no olympic lifts", "without olympic", "avoid olympic"]):
        excluded.append("OLYMPIC_WEIGHTLIFTING")
    if any(phrase in q for phrase in ["no powerlifting", "avoid powerlifting"]):
        excluded.append("POWERLIFTING")
    return excluded

def extract_has_pull_up_bar(query: str) -> bool:
    """Detects an explicit mention of pull-up bar access in the query text."""
    q = query.lower()
    return any(phrase in q for phrase in ["pull-up bar", "pull up bar", "pullup bar", "with a bar"])


def user_has_pull_up_bar(equipment_access: list[str] | None) -> bool:
    """Detects pull-up bar access from the user's saved equipment profile."""
    if not equipment_access:
        return False
    normalized = [e.strip().lower() for e in equipment_access]
    return any("pull-up bar" in e or "pull up bar" in e or "pullup bar" in e for e in normalized)

def map_user_equipment_to_filter(equipment_access: list[str]) -> list[str] | None:
    """
    Converts a user's equipmentAccess profile list into a DB-matching filter.
    If the user has 'full gym' access (or no specific list), no filtering is applied.
    """
    if not equipment_access:
        return None

    normalized = [e.strip().upper() for e in equipment_access]

    if "FULL GYM" in normalized:
        return None  # unrestricted — they have access to everything

    allowed = set()
    for item in normalized:
        mapped = EQUIPMENT_MAP.get(item)
        if mapped:
            allowed.update(mapped)

    return list(allowed) if allowed else None