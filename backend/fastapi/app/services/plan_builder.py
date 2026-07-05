from app.services.vector_search_service import vector_search

# Common day splits by number of training days
SPLITS = {
    1: ["full body"],
    2: ["upper body", "lower body"],
    3: ["push", "pull", "legs"],
    4: ["upper body", "lower body", "push", "pull"],
    5: ["chest", "back", "legs", "shoulders", "arms"],
    6: ["push", "pull", "legs", "push", "pull", "legs"],
    7: ["push", "pull", "legs", "upper body", "lower body", "full body", "active recovery"],
}

EXERCISES_PER_DAY = 5


def build_plan(days: int, equipment_filter: list[str] = None) -> list[dict]:
    split = SPLITS.get(days, SPLITS[3])
    plan = []

    for i, focus in enumerate(split):
        query = f"{focus} exercises"
        results = vector_search(query, top_k=EXERCISES_PER_DAY, equipment_filter=equipment_filter)

        plan.append({
            "day": i + 1,
            "focus": focus.title(),
            "exercises": results
        })

    return plan