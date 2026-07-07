# Assigns sets/reps and a plain-language "how this works" explanation
# based on the exercise's own movementPattern and category — deterministic,
# not LLM-generated, so it can never vary or invent something wrong.

REP_SCHEMES = {
    # Compound, multi-joint movements — lower reps, more sets, strength focus
    "compound": {"sets": "4", "reps": "5-8", "rest": "90-120 sec"},
    # Isolation, single-joint movements — higher reps, hypertrophy focus
    "isolation": {"sets": "3", "reps": "10-15", "rest": "45-60 sec"},
}

COMPOUND_PATTERNS = {
    "HORIZONTAL_PUSH", "HORIZONTAL_PULL", "VERTICAL_PUSH", "VERTICAL_PULL",
    "SQUAT", "HINGE"
}

MOVEMENT_EXPLANATIONS = {
    "HORIZONTAL_PUSH": "A pressing movement performed forward from the chest — builds pushing strength and primarily stimulates the chest, front shoulders, and triceps through a straight-line pressing motion.",
    "HORIZONTAL_PULL": "A pulling movement performed toward the torso — targets the mid-back and lats by drawing the elbows backward, building pulling strength and posture.",
    "VERTICAL_PUSH": "A pressing movement performed overhead — builds shoulder strength and stability by pushing weight vertically away from the body.",
    "VERTICAL_PULL": "A pulling movement performed from overhead down to the torso — the primary way to build lat width and back thickness.",
    "SQUAT": "A knee-dominant compound movement — loads the quads, glutes, and core through a deep bend at the hips and knees, one of the most effective builders of lower-body strength.",
    "HINGE": "A hip-dominant movement where the torso pivots forward at the hips — targets the hamstrings, glutes, and lower back through controlled loading of the posterior chain.",
    "ELBOW_FLEXION": "An isolation movement that bends the elbow under load — directly targets the biceps with minimal involvement from other muscle groups.",
    "ELBOW_EXTENSION": "An isolation movement that straightens the elbow against resistance — directly targets the triceps.",
    "SHOULDER_ABDUCTION": "A movement that raises the arm away from the body — isolates the side deltoid to build shoulder width.",
    "CORE_FLEXION": "A movement that flexes the spine forward — targets the abdominals through controlled trunk flexion.",
    "CALF": "A movement that raises the heel against resistance — isolates the calf muscles through ankle extension.",
}


def annotate_exercise(exercise: dict) -> dict:
    """Attach deterministic sets/reps/rest and a plain-language explanation to an exercise dict."""
    pattern = exercise.get("movementPattern", "UNKNOWN")
    is_compound = pattern in COMPOUND_PATTERNS
    scheme = REP_SCHEMES["compound"] if is_compound else REP_SCHEMES["isolation"]

    exercise["prescription"] = {
        "sets": scheme["sets"],
        "reps": scheme["reps"],
        "rest": scheme["rest"]
    }
    exercise["howItWorks"] = MOVEMENT_EXPLANATIONS.get(
        pattern,
        f"Targets the {', '.join(exercise.get('primaryMuscles', [])).lower().replace('_', ' ')} through a controlled resistance movement."
    )

    return exercise