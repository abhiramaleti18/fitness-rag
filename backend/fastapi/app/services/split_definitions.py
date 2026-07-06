# Each day is a list of "slots" — an exact exercise recipe.
# keywords help target sub-muscles (front/side/rear delt) that aren't
# separate DB fields, only distinguishable by exercise name.

def slot(muscle, pattern=None, keywords=None, count=1):
    return {"muscle": muscle, "pattern": pattern, "keywords": keywords, "count": count}


PUSH_DAY = {
    "label": "Push (Chest, Shoulders, Triceps)",
    "slots": [
        slot("CHEST", pattern="HORIZONTAL_PUSH", keywords=["incline"]),
        slot("CHEST", keywords=["fly", "cable"]),
        slot("SHOULDERS", keywords=["overhead press", "military press", "front raise"]),
        slot("SHOULDERS", keywords=["lateral raise", "side raise"]),
        slot("TRICEPS", keywords=["overhead extension", "skull"]),
        slot("TRICEPS", keywords=["rope", "pushdown", "pressdown"]),
    ],
}

PULL_DAY = {
    "label": "Pull (Back, Biceps)",
    "slots": [
        slot("LATS", pattern="HORIZONTAL_PULL", keywords=["row"]),
        slot("LATS", pattern="VERTICAL_PULL", keywords=["pulldown", "pull-up", "pullup", "chin"]),
        slot("TRAPS", keywords=["shrug"]),
        slot("SHOULDERS", keywords=["rear delt", "reverse fly", "face pull"]),
        slot("BICEPS", count=1),
        slot("BICEPS", count=1),
    ],
}

LEGS_DAY = {
    "label": "Legs (Quads, Hamstrings, Calves)",
    "slots": [
        slot("QUADRICEPS", pattern="SQUAT", count=1),
        slot("QUADRICEPS", count=1),
        slot("HAMSTRINGS", pattern="HINGE", count=1),
        slot("HAMSTRINGS", count=1),
        slot("CALVES", count=1),
        slot("LOWER_BACK", pattern="HINGE", keywords=["deadlift", "good morning"]),
    ],
}

PUSH_PULL_LEGS = [PUSH_DAY, PULL_DAY, LEGS_DAY]

UPPER_DAY = {
    "label": "Upper Body",
    "slots": [
        slot("CHEST", count=1),
        slot("CHEST", count=1),
        slot("LATS", pattern="HORIZONTAL_PULL", count=1),
        slot("LATS", pattern="VERTICAL_PULL", count=1),
        slot("SHOULDERS", count=1),
        slot("SHOULDERS", count=1),
        slot("BICEPS", count=1),
        slot("TRICEPS", count=1),
    ],
}

UPPER_LOWER = [UPPER_DAY, LEGS_DAY]

BRO_CHEST = {"label": "Chest Day", "slots": [slot("CHEST", count=4)]}
BRO_BACK = {"label": "Back Day", "slots": [slot("LATS", pattern="HORIZONTAL_PULL"), slot("LATS", pattern="VERTICAL_PULL"), slot("MIDDLE_BACK", count=1), slot("TRAPS", count=1)]}
BRO_SHOULDERS = {"label": "Shoulder Day", "slots": [slot("SHOULDERS", keywords=["overhead press"]), slot("SHOULDERS", keywords=["lateral raise"]), slot("SHOULDERS", keywords=["rear delt", "reverse fly"]), slot("SHOULDERS", count=1)]}
BRO_LEGS = {"label": "Leg Day", "slots": [slot("QUADRICEPS", count=2), slot("HAMSTRINGS", count=1), slot("CALVES", count=1)]}
BRO_ARMS = {"label": "Arm Day", "slots": [slot("BICEPS", count=2), slot("TRICEPS", count=2)]}

BRO_SPLIT = [BRO_CHEST, BRO_BACK, BRO_SHOULDERS, BRO_LEGS, BRO_ARMS]

FULL_BODY_DAY = {
    "label": "Full Body",
    "slots": [
        slot("CHEST", count=1),
        slot("LATS", count=1),
        slot("SHOULDERS", count=1),
        slot("QUADRICEPS", count=1),
        slot("HAMSTRINGS", count=1),
        slot("TRICEPS", count=1),
        slot("BICEPS", count=1),
        slot("CALVES", count=1),
    ],
}

FULL_BODY = [FULL_BODY_DAY]

DAYS_TO_SPLIT = {
    1: FULL_BODY,
    2: UPPER_LOWER,
    3: PUSH_PULL_LEGS,
    4: UPPER_LOWER + UPPER_LOWER,
    5: BRO_SPLIT,
    6: PUSH_PULL_LEGS + PUSH_PULL_LEGS,
    7: PUSH_PULL_LEGS + PUSH_PULL_LEGS + FULL_BODY,
}

SPLIT_NAME_KEYWORDS = {
    "push pull legs": PUSH_PULL_LEGS,
    "ppl": PUSH_PULL_LEGS,
    "upper lower": UPPER_LOWER,
    "upper/lower": UPPER_LOWER,
    "bro split": BRO_SPLIT,
    "full body": FULL_BODY,
}


def get_split_by_name(query: str):
    q = query.lower()
    for keyword, split in SPLIT_NAME_KEYWORDS.items():
        if keyword in q:
            return split
    return None


def get_split_by_days(days: int):
    return DAYS_TO_SPLIT.get(days, PUSH_PULL_LEGS)