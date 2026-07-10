# Home-workout-specific tier lists (bodyweight only). Mirrors the structure
# of exercise_tiers.EXERCISE_TIERS but tuned for equipment-free training.
# Two variants: one assumes no equipment at all, the other assumes a
# pull-up bar is available (unlocks vertical pulling and hanging core work).
#
# Keys match the same "role" identifiers used in split_definitions.py so
# these can be swapped in for EXERCISE_TIERS when the plan is home-only.

HOME_TIERS_NO_BAR = {
    "CHEST_HORIZONTAL_PUSH": {
        "tier1": ["Standard Push-Up", "Deficit Push-Up", "Diamond Push-Up"],
        "tier2": ["Decline Push-Up", "Archer Push-Up", "Wide Grip Push-Up"],
        "tier3": ["Incline Push-Up", "Knee Push-Up", "Hindu Push-Up"],
    },
    "CHEST_INCLINE_PUSH": {
        "tier1": ["Decline Push-Up"],
        "tier2": ["Pike Push-Up", "Feet Elevated Archer Push-Up"],
        "tier3": ["Incline Pike Push-Up"],
    },
    "CHEST_ISOLATION": {
        "tier1": ["Sliding Chest Fly", "Ring Fly"],
        "tier2": ["Push-Up Hold", "Push-Up Pulses"],
        "tier3": ["Isometric Chest Squeeze"],
    },
    "SHOULDERS_VERTICAL_PUSH": {
        "tier1": ["Pike Push-Up", "Elevated Pike Push-Up"],
        "tier2": ["Wall Handstand Push-Up", "Box Pike Push-Up"],
        "tier3": ["Wall Walk", "Handstand Hold"],
    },
    "SHOULDERS_SIDE_DELT": {
        "tier1": ["Pike Lean Lateral Raise"],
        "tier2": ["Side Plank Shoulder Raise"],
        "tier3": ["Isometric Lateral Hold"],
    },
    "SHOULDERS_REAR_DELT": {
        "tier1": ["Reverse Snow Angels", "Prone Y Raise"],
        "tier2": ["Superman Pull"],
        "tier3": ["Reverse Plank"],
    },
    "TRICEPS_COMPOUND": {
        "tier1": ["Diamond Push-Up"],
        "tier2": ["Close Grip Push-Up"],
        "tier3": ["Bench Dip"],
    },
    "TRICEPS_ISOLATION": {
        "tier1": ["Bodyweight Triceps Extension"],
        "tier2": ["Wall Triceps Extension"],
        "tier3": ["Isometric Lockout Hold"],
    },
    "BACK_HORIZONTAL_PULL": {
        "tier1": ["Towel Row"],
        "tier2": ["Bed Sheet Row"],
        "tier3": ["Superman Row"],
    },
    "BACK_VERTICAL_PULL": {
        # No bodyweight substitute exists without equipment — left empty
        # on purpose so the caller falls back to a horizontal pull instead
        # of surfacing a pull-up-bar exercise.
        "tier1": [],
        "tier2": [],
        "tier3": [],
    },
    "BACK_UPPER_TRAPS": {
        "tier1": ["Reverse Snow Angel"],
        "tier2": ["Superman Hold"],
        "tier3": ["Y Raise Hold"],
    },
    "BICEPS_COMPOUND": {
        "tier1": ["Towel Curl"],
        "tier2": ["Isometric Towel Curl"],
        "tier3": ["Door Frame Curl"],
    },
    "BICEPS_ISOLATION": {
        "tier1": ["Towel Curl"],
        "tier2": ["Isometric Towel Curl"],
        "tier3": ["Door Frame Curl"],
    },
    "LEGS_SQUAT": {
        "tier1": ["Bulgarian Split Squat", "Pistol Squat"],
        "tier2": ["Bodyweight Squat", "Split Squat"],
        "tier3": ["Box Squat"],
    },
    "LEGS_HINGE": {
        "tier1": ["Single Leg Romanian Deadlift"],
        "tier2": ["Hip Hinge"],
        "tier3": ["Good Morning"],
    },
    "LEGS_QUAD_ISOLATION": {
        "tier1": ["Sissy Squat"],
        "tier2": ["Spanish Squat"],
        "tier3": ["Wall Sit"],
    },
    "LEGS_HAMSTRING_ISOLATION": {
        "tier1": ["Nordic Curl"],
        "tier2": ["Sliding Hamstring Curl"],
        "tier3": ["Glute Bridge Walkout"],
    },
    "LEGS_CALVES": {
        "tier1": ["Single Leg Calf Raise"],
        "tier2": ["Standing Calf Raise"],
        "tier3": ["Seated Calf Raise"],
    },
    "CORE_FLEXION": {
        "tier1": [],  # Hanging Leg Raise requires a bar — excluded here
        "tier2": ["Reverse Crunch", "Dead Bug"],
        "tier3": ["Crunch"],
    },
    "CORE_STABILITY": {
        "tier1": ["Plank", "Side Plank"],
        "tier2": ["Body Saw", "Copenhagen Plank"],
        "tier3": ["Bird Dog", "Bear Crawl Hold"],
    },
}

HOME_TIERS_WITH_BAR = {
    **HOME_TIERS_NO_BAR,
    "BACK_VERTICAL_PULL": {
        "tier1": ["Pull-Up", "Chin-Up"],
        "tier2": ["Neutral Grip Pull-Up", "Commando Pull-Up"],
        "tier3": ["Jumping Pull-Up", "Band Assisted Pull-Up"],
    },
    "BACK_UPPER_TRAPS": {
        "tier1": ["Scapular Pull-Up"],
        "tier2": ["Dead Hang Shrug"],
        "tier3": ["Reverse Snow Angel"],
    },
    "BICEPS_COMPOUND": {
        "tier1": ["Chin-Up"],
        "tier2": ["Commando Pull-Up"],
        "tier3": ["Towel Curl"],
    },
    "CORE_FLEXION": {
        "tier1": ["Hanging Leg Raise", "Toes To Bar"],
        "tier2": ["Hanging Knee Raise", "Reverse Crunch"],
        "tier3": ["Crunch"],
    },
    "CORE_STABILITY": {
        "tier1": ["Hanging L-Sit", "Side Plank"],
        "tier2": ["Plank", "Body Saw", "Copenhagen Plank"],
        "tier3": ["Bird Dog", "Bear Crawl Hold"],
    },
}


def get_home_tiers(has_pull_up_bar: bool) -> dict:
    return HOME_TIERS_WITH_BAR if has_pull_up_bar else HOME_TIERS_NO_BAR