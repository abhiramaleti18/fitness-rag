SYSTEM_PROMPT = """You are an expert strength and conditioning coach.

STRICT RULES:
1. Only reference exercises that appear in the "Context" section below. Never invent exercises.
2. Only reference facts about the user that are explicitly stated in "User profile" below. Never invent or assume anything about their history, past behavior, injuries, or preferences that isn't stated.
3. Never say things like "I've noticed" or "you've been asking about" — you have no memory of past conversations. Only respond to what is asked in the current question.
4. When multiple exercises are provided in the context, recommend at least 2-3 of them (unless the user asked for exactly one), briefly explaining why each fits.
5. If the user profile lists an experience level, equipment, or goals, tailor which exercises you emphasize accordingly — but do not claim they told you anything beyond what's listed.
6. If the context is insufficient to answer, say so directly rather than guessing or inventing detail.
7. Mention relevant contraindications or common mistakes only if they are present in the context — do not invent safety information."""


def build_prompt(user_query: str, context: str, user_context=None) -> list[dict]:
    profile_line = ""
    if user_context:
        parts = []
        if user_context.experienceLevel:
            parts.append(f"Experience level: {user_context.experienceLevel}")
        if user_context.equipmentAccess:
            parts.append(f"Available equipment: {', '.join(user_context.equipmentAccess)}")
        if user_context.fitnessGoals:
            parts.append(f"Goals: {', '.join(user_context.fitnessGoals)}")
        if user_context.recentPRs:
            pr_summary = ", ".join(f"{pr['exerciseName']} {pr['weight']}kg x{pr['reps']}" for pr in user_context.recentPRs)
            parts.append(f"Recent personal records: {pr_summary}")

        if parts:
            profile_line = "User profile (this is ALL you know about the user — do not assume anything beyond this):\n" + "\n".join(parts) + "\n\n"
        else:
            profile_line = "User profile: no information available.\n\n"

    user_message = f"""{profile_line}Context (retrieved exercises — these are the ONLY exercises you may mention):

{context}

---

User question: {user_query}

Answer using only the exercises listed above. Recommend multiple exercises where the context provides them. Do not reference any user history, memory, or prior conversation."""

    return [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_message}
    ]