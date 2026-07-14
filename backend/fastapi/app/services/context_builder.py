from app.services.prescription_service import get_prescription


def build_context(exercises: list[dict], goal: str = None, level: str = None) -> str:
    """
    Convert retrieved exercise documents into compact, LLM-friendly context.
    Avoids sending raw MongoDB documents directly to the model.
    Includes knowledge-base-grounded sets/reps/rest so the model states
    real numbers instead of inventing them.
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

        prescription = get_prescription(ex, goal=goal, level=level)

        block = f"""Exercise: {ex.get('name')}
Category: {ex.get('category')} | Equipment: {ex.get('equipment')} | Difficulty: {ex.get('level')}
Movement Pattern: {ex.get('movementPattern')}
Primary Muscles: {primary}
Secondary Muscles: {secondary}
Recommended Sets: {prescription['sets']} | Recommended Reps: {prescription['reps']} | Rest Between Sets: {prescription['rest']}
Coaching Cues: {cues}
Common Mistakes: {mistakes}
Contraindications: {contraindications}
Home Gym Compatible: {ex.get('homeGymCompatible')}"""

        blocks.append(block)

    return "\n\n---\n\n".join(blocks)

def build_mobility_context(stretches: list[dict]) -> str:
    """Same grounding principle as build_context, applied to stretches:
    convert the curated stretch data into compact facts for the LLM to
    narrate, rather than letting it invent hold times or cues."""
    if not stretches:
        return "No relevant stretches found in the knowledge base."

    blocks = []
    for s in stretches:
        duration = s.get("hold") or (f"{s.get('reps')} reps, {s.get('sets')} sets" if s.get("reps") else "Not specified")
        cues = "; ".join(s.get("coachingCues", [])[:3])
        mistakes = "; ".join(s.get("commonMistakes", [])[:2])
        contraindications = ", ".join(s.get("contraindications", [])) or "None listed"
        equipment = ", ".join(s.get("equipment", [])) or "None"

        block = f"""Stretch: {s.get('name')}
Category: {s.get('category')} | Difficulty: {s.get('difficulty')}
Targets: {', '.join(s.get('targets', []))}
Duration/Volume: {duration}
Helps With: {', '.join(s.get('helpsWith', []))}
Coaching Cues: {cues}
Common Mistakes: {mistakes}
Contraindications: {contraindications}
Equipment: {equipment}"""
        blocks.append(block)

    return "\n\n---\n\n".join(blocks)