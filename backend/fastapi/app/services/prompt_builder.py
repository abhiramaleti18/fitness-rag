SYSTEM_PROMPT = """You are an expert strength and conditioning coach.

Only answer using the exercise information provided in the context below.
Never invent exercises that are not listed in the context.
Never hallucinate muscle groups, instructions, or safety information.
If the provided context is insufficient to answer the user's question, say so clearly instead of guessing.

When recommending exercises, explain briefly why each one fits the user's goal, and mention any relevant contraindications or common mistakes if present."""


def build_prompt(user_query: str, context: str) -> list[dict]:
    """
    Construct the full message list to send to the LLM,
    grounding the response strictly in retrieved context.
    """
    user_message = f"""Context (retrieved exercises):

{context}

---

User question: {user_query}

Answer using only the exercises listed above."""

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message}
    ]