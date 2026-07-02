def format_response(answer: str, retrieved_exercises: list[dict]) -> dict:
    """
    Structure the final RAG response for the frontend.
    Keeps raw LLM text separate from structured exercise data.
    """
    sources = [
        {
            "id": ex.get("id"),
            "name": ex.get("name"),
            "score": round(ex.get("score", 0), 4)
        }
        for ex in retrieved_exercises
    ]

    return {
        "answer": answer,
        "recommendedExercises": retrieved_exercises,
        "sources": sources
    }