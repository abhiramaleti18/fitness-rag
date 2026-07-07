# Tiered exercise priority lists, encoding real coaching judgment about
# which exercises are staples vs. accessories per movement role.
#
# Used by plan_builder._fetch_for_slot() to rank candidates: Tier 1 preferred,
# falling back to Tier 2, then Tier 3, then existing keyword/random logic
# if nothing in the tier list matches (e.g. due to equipment restrictions).
#
# Keys match the "role" identifier passed from split_definitions.py slots.
# Names are matched case-insensitively as substrings against DB exercise names,
# so approximate naming is fine (e.g. "Barbell Bench Press" matches
# "Barbell Bench Press - Medium Grip").

EXERCISE_TIERS = {

    "CHEST_HORIZONTAL_PUSH": {
        "tier1": [
            "Barbell Bench Press - Medium Grip",
            "Barbell Bench Press - Wide Grip",
            "Dumbbell Bench Press",
            "Machine Chest Press",
            "Hammer Strength Chest Press",
        ],
        "tier2": [
            "Smith Machine Bench Press",
            "One Arm Dumbbell Bench Press",
            "Push-Up",
            "Weighted Push-Up",
            "Suspended Push-Up",
        ],
        "tier3": [
            "Single Arm Cable Chest Press",
            "Cable Chest Press",
            "Standing Chest Press",
            "Floor Press",
            "Close-Grip Push-Up",
        ],
    },

    "CHEST_INCLINE_PUSH": {
        "tier1": [
            "Barbell Incline Bench Press - Medium Grip",
            "Incline Dumbbell Press",
            "Hammer Strength Incline Press",
            "Machine Incline Press",
        ],
        "tier2": [
            "Smith Machine Incline Bench Press",
            "Incline Barbell Bench Press - Wide Grip",
            "Reverse Grip Incline Bench Press",
        ],
        "tier3": [
            "Incline Push-Up",
            "Incline Cable Press",
            "Single Arm Incline Cable Press",
        ],
    },

    "CHEST_ISOLATION": {
        "tier1": [
            "Cable Crossover",
            "Pec Deck Fly",
            "Dumbbell Flyes",
        ],
        "tier2": [
            "Incline Dumbbell Flyes",
            "Low Cable Fly",
            "High Cable Fly",
        ],
        "tier3": [
            "Incline Dumbbell Flyes - With A Twist",
            "One Arm Flat Bench Dumbbell Flye",
            "Around The Worlds",
        ],
    },

    "SHOULDERS_VERTICAL_PUSH": {
        "tier1": [
            "Standing Barbell Overhead Press",
            "Seated Dumbbell Shoulder Press",
            "Military Press",
            "Arnold Press",
        ],
        "tier2": [
            "Smith Machine Shoulder Press",
            "Machine Shoulder Press",
            "Standing Dumbbell Press",
            "Bradford Press",
        ],
        "tier3": [
            "Single Arm Dumbbell Shoulder Press",
            "Alternating Dumbbell Shoulder Press",
            "Kettlebell Press",
        ],
    },

    "SHOULDERS_SIDE_DELT": {
        "tier1": [
            "Dumbbell Lateral Raise",
            "Cable Lateral Raise",
            "Machine Lateral Raise",
        ],
        "tier2": [
            "Leaning Cable Lateral Raise",
            "Seated Dumbbell Lateral Raise",
        ],
        "tier3": [
            "Incline Lateral Raise",
            "One Arm Cable Lateral Raise",
            "Partial Lateral Raise",
        ],
    },

    "SHOULDERS_REAR_DELT": {
        "tier1": [
            "Reverse Pec Deck",
            "Face Pull",
            "Bent Over Dumbbell Rear Delt Raise",
        ],
        "tier2": [
            "Cable Rear Delt Fly",
            "Reverse Cable Crossover",
        ],
        "tier3": [
            "Incline Rear Delt Raise",
            "Single Arm Rear Delt Fly",
        ],
    },

    "TRICEPS_COMPOUND": {
        "tier1": [
            "Close-Grip Barbell Bench Press",
            "Weighted Dip",
            "Parallel Bar Dip",
        ],
        "tier2": [
            "Bench Dip",
            "Smith Machine Close Grip Bench Press",
        ],
        "tier3": [
            "Assisted Dip",
            "Close Grip Push-Up",
        ],
    },

    "TRICEPS_ISOLATION": {
        "tier1": [
            "Cable Rope Pushdown",
            "EZ Bar Skull Crusher",
            "Overhead Cable Extension",
        ],
        "tier2": [
            "Single Arm Cable Pushdown",
            "Dumbbell Overhead Extension",
            "Lying Dumbbell Triceps Extension",
        ],
        "tier3": [
            "Kickback",
            "Reverse Grip Pushdown",
            "One Arm Overhead Extension",
        ],
    },

    "BACK_HORIZONTAL_PULL": {
        "tier1": [
            "Barbell Bent Over Row",
            "Chest Supported Row",
            "Seated Cable Row",
            "T-Bar Row",
        ],
        "tier2": [
            "One Arm Dumbbell Row",
            "Machine Row",
            "Landmine Row",
        ],
        "tier3": [
            "Meadows Row",
            "Inverted Row",
            "Standing Cable Row",
        ],
    },

    "BACK_VERTICAL_PULL": {
        "tier1": [
            "Pull-Up",
            "Weighted Pull-Up",
            "Lat Pulldown",
            "Neutral Grip Pull-Up",
        ],
        "tier2": [
            "Chin-Up",
            "Neutral Grip Lat Pulldown",
            "Wide Grip Lat Pulldown",
        ],
        "tier3": [
            "Straight Arm Pulldown",
            "Machine Pullover",
            "Assisted Pull-Up",
        ],
    },

    "BACK_UPPER_TRAPS": {
        "tier1": [
            "Barbell Shrug",
            "Dumbbell Shrug",
            "Trap Bar Shrug",
        ],
        "tier2": [
            "Cable Shrug",
            "Smith Machine Shrug",
        ],
        "tier3": [
            "Behind The Back Shrug",
            "One Arm Shrug",
        ],
    },

    "BICEPS_COMPOUND": {
        "tier1": [
            "Barbell Curl",
            "EZ Bar Curl",
            "Standing Dumbbell Curl",
        ],
        "tier2": [
            "Alternating Dumbbell Curl",
            "Cable Curl",
        ],
        "tier3": [
            "Drag Curl",
            "Spider Curl",
        ],
    },

    "BICEPS_ISOLATION": {
        "tier1": [
            "Incline Dumbbell Curl",
            "Preacher Curl",
            "Hammer Curl",
        ],
        "tier2": [
            "Concentration Curl",
            "Bayesian Curl",
            "Machine Preacher Curl",
        ],
        "tier3": [
            "Reverse Curl",
            "Zottman Curl",
            "High Cable Curl",
        ],
    },

    "LEGS_SQUAT": {
        "tier1": [
            "Barbell Back Squat",
            "Front Squat",
            "Hack Squat",
            "Leg Press",
            "Safety Bar Squat",
        ],
        "tier2": [
            "Goblet Squat",
            "Smith Machine Squat",
            "Bulgarian Split Squat",
            "Dumbbell Squat",
            "Belt Squat",
        ],
        "tier3": [
            "Box Squat",
            "Zercher Squat",
            "Sumo Squat",
            "Landmine Squat",
            "Bodyweight Squat",
        ],
    },

    "LEGS_HINGE": {
        "tier1": [
            "Romanian Deadlift",
            "Conventional Deadlift",
            "Stiff-Leg Deadlift",
            "Trap Bar Deadlift",
            "Barbell Hip Thrust",
        ],
        "tier2": [
            "Dumbbell Romanian Deadlift",
            "Good Morning",
            "Cable Pull Through",
            "Single Leg Romanian Deadlift",
            "Glute Bridge",
        ],
        "tier3": [
            "Kettlebell Swing",
            "Reverse Hyperextension",
            "Hyperextension",
            "Smith Machine Romanian Deadlift",
            "Single Leg Hip Thrust",
        ],
    },

    "LEGS_QUAD_ISOLATION": {
        "tier1": [
            "Leg Extension",
        ],
        "tier2": [
            "Single Leg Extension",
            "Sissy Squat",
        ],
        "tier3": [
            "Spanish Squat",
            "Terminal Knee Extension",
            "Peterson Step Up",
        ],
    },

    "LEGS_HAMSTRING_ISOLATION": {
        "tier1": [
            "Lying Leg Curl",
            "Seated Leg Curl",
            "Nordic Hamstring Curl",
        ],
        "tier2": [
            "Standing Leg Curl",
            "Stability Ball Leg Curl",
            "Single Leg Curl",
        ],
        "tier3": [
            "Gliding Leg Curl",
            "Band Leg Curl",
            "Sliding Hamstring Curl",
        ],
    },

    "LEGS_CALVES": {
        "tier1": [
            "Standing Calf Raise",
            "Seated Calf Raise",
            "Leg Press Calf Raise",
        ],
        "tier2": [
            "Donkey Calf Raise",
            "Smith Machine Calf Raise",
            "Single Leg Standing Calf Raise",
        ],
        "tier3": [
            "Bodyweight Calf Raise",
            "Jump Rope",
            "Farmer Walk On Toes",
        ],
    },

    "CORE_FLEXION": {
        "tier1": [
            "Cable Crunch",
            "Decline Sit-Up",
            "Hanging Knee Raise",
        ],
        "tier2": [
            "Hanging Leg Raise",
            "Machine Crunch",
            "Stability Ball Crunch",
            "Reverse Crunch",
        ],
        "tier3": [
            "Crunch",
            "Bicycle Crunch",
            "Toe Touch",
            "V-Up",
            "Jackknife Sit-Up",
        ],
    },

    "CORE_STABILITY": {
        "tier1": [
            "Ab Wheel Rollout",
            "Plank",
            "Pallof Press",
        ],
        "tier2": [
            "Side Plank",
            "Dead Bug",
            "Body Saw",
            "Stability Ball Rollout",
        ],
        "tier3": [
            "Bird Dog",
            "Bear Crawl Hold",
            "Hollow Body Hold",
            "Suitcase Carry",
            "Copenhagen Plank",
        ],
    },

}
# Fallback "fundamental" list — used only when a role has no full tier list yet
# (e.g. Legs, Core, before those are curated). Matches broad compound staples
# across any muscle group, so untiered roles still prefer real basics over
# obscure variations.

FUNDAMENTAL_KEYWORDS = [
    "barbell squat", "back squat", "front squat",
    "deadlift", "romanian deadlift", "stiff-legged deadlift",
    "leg press", "lunge",
    "calf raise",
    "plank", "crunch", "sit-up", "sit up",
    "barbell row", "bent over row",
    "pull-up", "pullup", "pull up",
    "lat pulldown",
    "bench press",
    "overhead press", "military press",
    "dumbbell curl", "barbell curl",
    "dip",
]


def is_fundamental(exercise_name: str) -> bool:
    name = exercise_name.lower()
    return any(kw in name for kw in FUNDAMENTAL_KEYWORDS)

def get_tiers_for_role(role: str) -> dict | None:
    """Returns the tier dict for a given role, or None if not yet defined."""
    return EXERCISE_TIERS.get(role)