CONSTRAINTS = {
    "SHOULDER_PAIN": {
        "avoidExercises": [
            "Behind Neck Press", "Behind Neck Pulldown", "Upright Row",
            "Deep Weighted Dip", "Heavy Dumbbell Fly", "Wide Grip Bench Press"
        ],
        "preferExercises": [
            "Neutral Grip Dumbbell Press", "Machine Chest Press", "Landmine Press",
            "Cable Chest Press", "Machine Shoulder Press", "Face Pull"
        ],
        "warmupFocus": [
            "Band External Rotation", "Band Pull Apart", "PVC Pass Through",
            "Wall Slides", "Scapular Push-Up"
        ],
        "coachingNotes": [
            "Train through pain-free ranges of motion.",
            "Prioritize shoulder stability before increasing load.",
            "Neutral grips are generally better tolerated."
        ]
    },
    "LOWER_BACK_PAIN": {
        "avoidExercises": [
            "Conventional Deadlift", "Good Morning", "Heavy Barbell Row", "Heavy Back Squat"
        ],
        "preferExercises": [
            "Leg Press", "Chest Supported Row", "Goblet Squat",
            "Machine Row", "Hip Thrust", "Cable Pull Through"
        ],
        "warmupFocus": ["Cat Camel", "Bird Dog", "Dead Bug", "Glute Bridge", "Hip Mobility"],
        "coachingNotes": [
            "Maintain a neutral spine.",
            "Avoid excessive lumbar extension.",
            "Prioritize core bracing."
        ]
    },
    "KNEE_PAIN": {
        "avoidExercises": ["Deep Hack Squat", "Heavy Walking Lunge", "Heavy Leg Extension"],
        "preferExercises": ["Romanian Deadlift", "Hip Thrust", "Box Squat", "Reverse Lunge", "Step Up"],
        "warmupFocus": ["Terminal Knee Extension", "Glute Activation", "Ankle Mobility", "Bodyweight Squat"],
        "coachingNotes": [
            "Control the lowering phase.",
            "Avoid painful ranges.",
            "Strengthen surrounding musculature."
        ]
    },
    "ELBOW_PAIN": {
        "avoidExercises": ["Heavy Skull Crusher", "Heavy EZ Bar Curl", "Heavy Close Grip Bench Press"],
        "preferExercises": ["Cable Curl", "Hammer Curl", "Rope Pushdown", "Machine Curl"],
        "warmupFocus": ["Light Band Curl", "Band Pushdown", "Forearm Mobility"],
        "coachingNotes": ["Avoid locking the elbows aggressively.", "Use controlled tempo."]
    },
    "WRIST_PAIN": {
        "avoidExercises": ["Straight Bar Curl", "Heavy Front Squat", "Push-Up"],
        "preferExercises": ["EZ Bar Curl", "Neutral Grip Dumbbell Press", "Machine Press", "Cable Attachments"],
        "warmupFocus": ["Wrist Circles", "Forearm Stretch", "Light Grip Work"],
        "coachingNotes": ["Use neutral grips whenever possible.", "Consider wrist wraps for heavy lifts."]
    },
    "LIMITED_OVERHEAD_MOBILITY": {
        "avoidExercises": ["Barbell Overhead Press", "Behind Neck Press"],
        "preferExercises": ["Landmine Press", "Machine Shoulder Press", "High Incline Press"],
        "warmupFocus": ["Thoracic Extension", "PVC Pass Through", "Wall Slides"],
        "coachingNotes": ["Improve thoracic mobility first.", "Progressively restore overhead range."]
    },
}

# Detects which constraint keys apply based on plain-language query text
CONSTRAINT_TRIGGERS = {
    "SHOULDER_PAIN": ["shoulder pain", "shoulder injury", "hurt shoulder", "bad shoulder"],
    "LOWER_BACK_PAIN": ["lower back pain", "back pain", "hurt back", "bad back", "back injury"],
    "KNEE_PAIN": ["knee pain", "bad knee", "hurt knee", "knee injury"],
    "ELBOW_PAIN": ["elbow pain", "tennis elbow", "hurt elbow"],
    "WRIST_PAIN": ["wrist pain", "hurt wrist", "bad wrist"],
    "LIMITED_OVERHEAD_MOBILITY": ["can't go overhead", "limited overhead", "shoulder mobility", "can't reach overhead"],
}


def detect_constraints_from_text(text: str) -> list[str]:
    q = text.lower()
    found = []
    for key, phrases in CONSTRAINT_TRIGGERS.items():
        if any(p in q for p in phrases):
            found.append(key)
    return found


def get_constraint(key: str) -> dict | None:
    return CONSTRAINTS.get(key)