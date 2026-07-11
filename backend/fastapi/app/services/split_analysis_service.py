# Deterministic, grounded analysis of a user-built workout split — computes
# real numbers from the exercise database (muscle coverage, movement pattern
# balance) BEFORE anything touches the LLM. The LLM only narrates these
# pre-computed facts; it never has to estimate coverage itself.

from app.core.database import exercises_collection

ALL_TRACKED_MUSCLES = [
    "CHEST", "BACK", "LATS", "MIDDLE_BACK", "LOWER_BACK", "SHOULDERS",
    "TRICEPS", "BICEPS", "FOREARMS", "QUADRICEPS", "HAMSTRINGS", "GLUTES",
    "CALVES", "ABDOMINALS", "TRAPS", "ADDUCTORS", "ABDUCTORS"
]


def _find_exercise(name: str) -> dict | None:
    if not name:
        return None
    return exercises_collection.find_one(
        {"name": {"$regex": f"^{name.strip()}$", "$options": "i"}},
        {"_id": 0}
    )


def compute_muscle_coverage(days: list[dict]) -> dict:
    """Primary muscle hits count as 1, secondary as 0.5 — so a muscle that's
    always secondary (rarely the main driver) doesn't look equally covered
    to one that's directly trained."""
    coverage: dict[str, float] = {}
    for day in days:
        for ex in day.get("exercises", []):
            doc = _find_exercise(ex.get("exerciseName", ""))
            if not doc:
                continue
            for m in doc.get("primaryMuscles", []):
                coverage[m] = coverage.get(m, 0) + 1
            for m in doc.get("secondaryMuscles", []):
                coverage[m] = coverage.get(m, 0) + 0.5
    return {k: round(v, 1) for k, v in coverage.items()}


def compute_movement_pattern_balance(days: list[dict]) -> dict:
    balance: dict[str, int] = {}
    for day in days:
        for ex in day.get("exercises", []):
            doc = _find_exercise(ex.get("exerciseName", ""))
            if not doc:
                continue
            pattern = doc.get("movementPattern", "UNKNOWN")
            balance[pattern] = balance.get(pattern, 0) + 1
    return balance


def build_analysis_summary(muscle_coverage: dict, pattern_balance: dict, total_exercises: int, num_days: int) -> str:
    """Plain-text, fact-only summary — this is what actually gets sent to the
    LLM. Same principle as context_builder.py: compute the truth first, let
    the model only narrate it."""
    lines = [f"Split overview: {num_days} day(s), {total_exercises} total exercises found in the exercise database."]

    lines.append("\nMuscle coverage (weighted hits — primary counts as 1, secondary as 0.5):")
    for m, v in sorted(muscle_coverage.items(), key=lambda x: -x[1]):
        lines.append(f"- {m}: {v}")

    untouched = [m for m in ALL_TRACKED_MUSCLES if m not in muscle_coverage]
    if untouched:
        lines.append(f"\nMuscle groups with ZERO direct or indirect coverage in this split: {', '.join(untouched)}")

    lines.append("\nMovement pattern balance (count of exercises per pattern):")
    for p, v in sorted(pattern_balance.items(), key=lambda x: -x[1]):
        lines.append(f"- {p}: {v}")

    return "\n".join(lines)


def analyze_split(days: list[dict]) -> dict:
    muscle_coverage = compute_muscle_coverage(days)
    pattern_balance = compute_movement_pattern_balance(days)
    total_exercises = sum(len(d.get("exercises", [])) for d in days)
    summary = build_analysis_summary(muscle_coverage, pattern_balance, total_exercises, len(days))

    return {
        "muscleCoverage": muscle_coverage,
        "movementPatternBalance": pattern_balance,
        "summary": summary
    }