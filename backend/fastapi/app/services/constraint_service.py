from app.services.constraints_data import get_constraint, detect_constraints_from_text


def get_active_constraints(query: str, user_injuries: list[str] = None) -> list[str]:
    """Combines constraints mentioned in the query with the user's saved injury profile."""
    detected = detect_constraints_from_text(query)
    profile_constraints = [inj.upper().replace(" ", "_") for inj in (user_injuries or [])]
    return list(set(detected + profile_constraints))


def get_avoid_list(constraint_keys: list[str]) -> set[str]:
    """All exercise names that should never be recommended given the active constraints."""
    avoid = set()
    for key in constraint_keys:
        c = get_constraint(key)
        if c:
            avoid.update(name.lower() for name in c.get("avoidExercises", []))
    return avoid


def get_prefer_list(constraint_keys: list[str]) -> set[str]:
    """Exercise names to prioritize given the active constraints."""
    prefer = set()
    for key in constraint_keys:
        c = get_constraint(key)
        if c:
            prefer.update(name.lower() for name in c.get("preferExercises", []))
    return prefer


def get_coaching_notes(constraint_keys: list[str]) -> list[str]:
    notes = []
    for key in constraint_keys:
        c = get_constraint(key)
        if c:
            notes.extend(c.get("coachingNotes", []))
    return notes


def exercise_conflicts_with_constraints(exercise_name: str, avoid_list: set[str]) -> bool:
    name = exercise_name.lower()
    return any(avoid_term in name for avoid_term in avoid_list)