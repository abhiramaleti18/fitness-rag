def build_context(exercises: list[dict]) -> str:
    """
    Convert retrieved exercise documents into compact, LLM-friendly context.
    Avoids sending raw MongoDB documents directly to the model.
    """
    if not exercises:
        return "No relevant exercises found in the knowledge base."

    blocks = []

    for ex in exercises:
        primary = ", ".join(ex.get("primaryMuscles", []))
        secondary = ", ".join(ex.get("secondaryMuscles", []))
        contraindications = ", ".join(ex.get("contraindications", [])) or "None listed"
        cues = "; ".join(ex.get("coachingCues", [])[:3])  # cap to top 3 for brevity
        mistakes = "; ".join(ex.get("commonMistakes", [])[:2])

        block = f"""Exercise: {ex.get('name')}
Category: {ex.get('category')} | Equipment: {ex.get('equipment')} | Difficulty: {ex.get('level')}
Movement Pattern: {ex.get('movementPattern')}
Primary Muscles: {primary}
Secondary Muscles: {secondary}
Coaching Cues: {cues}
Common Mistakes: {mistakes}
Contraindications: {contraindications}
Home Gym Compatible: {ex.get('homeGymCompatible')}"""

        blocks.append(block)

    return "\n\n---\n\n".join(blocks)