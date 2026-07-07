# Each day is a list of "slots" — an exact exercise recipe.
# keywords help target sub-muscles (front/side/rear delt) that aren't
# separate DB fields, only distinguishable by exercise name.

def slot(muscle, pattern=None, keywords=None, count=1, role=None):
    return {"muscle": muscle, "pattern": pattern, "keywords": keywords, "count": count, "role": role}


PUSH_DAY = {
    "label": "Push (Chest, Shoulders, Triceps)",
    "slots": [
        slot("CHEST", pattern="HORIZONTAL_PUSH", keywords=["incline"], role="CHEST_INCLINE_PUSH"),
        slot("CHEST", keywords=["fly", "cable"], role="CHEST_ISOLATION"),
        slot("SHOULDERS", keywords=["overhead press", "military press", "front raise"], role="SHOULDERS_VERTICAL_PUSH"),
        slot("SHOULDERS", keywords=["lateral raise", "side raise"], role="SHOULDERS_SIDE_DELT"),
        slot("TRICEPS", keywords=["overhead extension", "skull"], role="TRICEPS_ISOLATION"),
        slot("TRICEPS", keywords=["rope", "pushdown", "pressdown"], role="TRICEPS_ISOLATION"),
    ],
}

PULL_DAY = {
    "label": "Pull (Back, Biceps)",
    "slots": [
        slot("LATS", pattern="HORIZONTAL_PULL", keywords=["row"], role="BACK_HORIZONTAL_PULL"),
        slot("LATS", pattern="VERTICAL_PULL", keywords=["pulldown", "pull-up", "pullup", "chin"], role="BACK_VERTICAL_PULL"),
        slot("TRAPS", keywords=["shrug"], role="BACK_UPPER_TRAPS"),
        slot("SHOULDERS", keywords=["rear delt", "reverse fly", "face pull"], role="SHOULDERS_REAR_DELT"),
        slot("BICEPS", count=1, role="BICEPS_COMPOUND"),
        slot("BICEPS", count=1, role="BICEPS_ISOLATION"),
    ],
}

LEGS_DAY = {
    "label": "Legs (Quads, Hamstrings, Calves)",
    "slots": [
        slot("QUADRICEPS", pattern="SQUAT", role="LEGS_SQUAT"),
        slot("QUADRICEPS", role="LEGS_QUAD_ISOLATION"),
        slot("HAMSTRINGS", pattern="HINGE", role="LEGS_HINGE"),
        slot("HAMSTRINGS", role="LEGS_HAMSTRING_ISOLATION"),
        slot("CALVES", role="LEGS_CALVES"),
        slot("LOWER_BACK", pattern="HINGE", keywords=["deadlift", "good morning"], role="LEGS_HINGE"),
    ],
}

PUSH_PULL_LEGS = [PUSH_DAY, PULL_DAY, LEGS_DAY]

UPPER_DAY = {
    "label": "Upper Body",
    "slots": [
        slot("CHEST", role="CHEST_HORIZONTAL_PUSH"),
        slot("CHEST", role="CHEST_INCLINE_PUSH"),
        slot("LATS", pattern="HORIZONTAL_PULL", role="BACK_HORIZONTAL_PULL"),
        slot("LATS", pattern="VERTICAL_PULL", role="BACK_VERTICAL_PULL"),
        slot("SHOULDERS", role="SHOULDERS_VERTICAL_PUSH"),
        slot("SHOULDERS", role="SHOULDERS_SIDE_DELT"),
        slot("BICEPS", role="BICEPS_COMPOUND"),
        slot("TRICEPS", role="TRICEPS_ISOLATION"),
    ],
}

UPPER_LOWER = [UPPER_DAY, LEGS_DAY]

BRO_CHEST = {"label": "Chest Day", "slots": [
    slot("CHEST", role="CHEST_HORIZONTAL_PUSH"),
    slot("CHEST", role="CHEST_INCLINE_PUSH"),
    slot("CHEST", role="CHEST_ISOLATION"),
    slot("CHEST", role="CHEST_ISOLATION"),
]}

BRO_BACK = {"label": "Back Day", "slots": [
    slot("LATS", pattern="HORIZONTAL_PULL", role="BACK_HORIZONTAL_PULL"),
    slot("LATS", pattern="VERTICAL_PULL", role="BACK_VERTICAL_PULL"),
    slot("MIDDLE_BACK", role="BACK_HORIZONTAL_PULL"),
    slot("TRAPS", role="BACK_UPPER_TRAPS"),
]}

BRO_SHOULDERS = {"label": "Shoulder Day", "slots": [
    slot("SHOULDERS", role="SHOULDERS_VERTICAL_PUSH"),
    slot("SHOULDERS", role="SHOULDERS_SIDE_DELT"),
    slot("SHOULDERS", role="SHOULDERS_REAR_DELT"),
    slot("SHOULDERS", role="SHOULDERS_SIDE_DELT"),
]}

BRO_LEGS = {"label": "Leg Day", "slots": [
    slot("QUADRICEPS", pattern="SQUAT", role="LEGS_SQUAT"),
    slot("QUADRICEPS", role="LEGS_QUAD_ISOLATION"),
    slot("HAMSTRINGS", pattern="HINGE", role="LEGS_HINGE"),
    slot("CALVES", role="LEGS_CALVES"),
]}

BRO_ARMS = {"label": "Arm Day", "slots": [
    slot("BICEPS", role="BICEPS_COMPOUND"),
    slot("BICEPS", role="BICEPS_ISOLATION"),
    slot("TRICEPS", role="TRICEPS_COMPOUND"),
    slot("TRICEPS", role="TRICEPS_ISOLATION"),
]}

BRO_SPLIT = [BRO_CHEST, BRO_BACK, BRO_SHOULDERS, BRO_LEGS, BRO_ARMS]

FULL_BODY_DAY = {
    "label": "Full Body",
    "slots": [
        slot("CHEST", role="CHEST_HORIZONTAL_PUSH"),
        slot("LATS", role="BACK_HORIZONTAL_PULL"),
        slot("SHOULDERS", role="SHOULDERS_VERTICAL_PUSH"),
        slot("QUADRICEPS", role="LEGS_SQUAT"),
        slot("HAMSTRINGS", role="LEGS_HINGE"),
        slot("TRICEPS", role="TRICEPS_ISOLATION"),
        slot("BICEPS", role="BICEPS_COMPOUND"),
        slot("CALVES", role="LEGS_CALVES"),
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