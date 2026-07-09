import json
from app.core.config import ROOT_DIR

KNOWLEDGE_DIR = ROOT_DIR / "knowledge"


def _load(name: str) -> dict:
    with open(KNOWLEDGE_DIR / name) as f:
        return json.load(f)


REP_RANGES = _load("rep_ranges.json")
SET_RANGES = _load("set_ranges.json")
REST_PERIODS = _load("rest_periods.json")

GOAL_MAP = {
    "muscle gain": "HYPERTROPHY",
    "hypertrophy": "HYPERTROPHY",
    "strength": "STRENGTH",
    "fat loss": "WEIGHT_LOSS",
    "weight loss": "WEIGHT_LOSS",
    "endurance": "ENDURANCE",
    "mobility": "GENERAL_FITNESS",
    "general fitness": "GENERAL_FITNESS",
}


def normalize_goal(goal: str | None) -> str:
    """Maps a single user-facing goal string (e.g. 'muscle gain') to the
    knowledge base's goal keys (e.g. 'HYPERTROPHY'). Defaults to GENERAL_FITNESS."""
    if not goal:
        return "GENERAL_FITNESS"
    return GOAL_MAP.get(goal.strip().lower(), "GENERAL_FITNESS")


def normalize_level(level: str | None) -> str:
    if not level:
        return "INTERMEDIATE"
    lvl = level.strip().upper()
    return lvl if lvl in ("BEGINNER", "INTERMEDIATE", "ADVANCED") else "INTERMEDIATE"


def get_movement_category(exercise: dict) -> str:
    """Maps an exercise's own fields to the category keys used in the
    rep/set/rest knowledge base: compound, isolation, core, calves, carry, explosive."""
    pattern = (exercise.get("movementPattern") or "").upper()
    mechanic = (exercise.get("mechanic") or "").upper()
    category = (exercise.get("category") or "").upper()

    if pattern == "CALF":
        return "calves"
    if "CORE" in pattern:
        return "core"
    if category in ("OLYMPIC_WEIGHTLIFTING", "PLYOMETRICS"):
        return "explosive"
    if category == "STRONGMAN" or "CARRY" in pattern:
        return "carry"
    if mechanic == "ISOLATION":
        return "isolation"
    return "compound"  # COMPOUND or UNSPECIFIED defaults here


def _get_set_entry(category: str, level: str, goal: str) -> dict:
    level_block = SET_RANGES.get(category, {}).get(level, {})
    if category == "compound":
        return level_block.get(goal, {})
    return level_block  # non-compound categories aren't split by goal, only level


def _get_rest(category: str, goal: str) -> str:
    goal_block = REST_PERIODS.get("goals", {}).get(goal, {})
    if category in goal_block:
        return goal_block[category]
    if category == "calves":
        return goal_block.get("isolation", "45-60 sec")
    return goal_block.get("compound", "60-90 sec")


def get_prescription(exercise: dict, goal: str = None, level: str = None) -> dict:
    """Returns deterministic, knowledge-base-grounded sets/reps/rest for an
    exercise, tuned to the user's goal and experience level."""
    norm_goal = normalize_goal(goal)
    norm_level = normalize_level(level)
    category = get_movement_category(exercise)

    rep_entry = REP_RANGES.get(category, {}).get(norm_goal, {})
    set_entry = _get_set_entry(category, norm_level, norm_goal)
    rest = _get_rest(category, norm_goal)

    return {
        "sets": set_entry.get("recommended", "3"),
        "reps": rep_entry.get("recommended", "8-12"),
        "rest": rest,
        "movementCategory": category,
        "goal": norm_goal,
        "level": norm_level,
        "notes": rep_entry.get("notes", "")
    }