"""
normalize.py
Fitness-RAG ETL Phase 2 - Dataset Normalization

Reads:
    data/raw/free-exercise-db/exercises.json

Writes:
    data/processed/exercises_normalized.json
    data/processed/normalization_report.json
    data/processed/unknown_values.json
"""

from pathlib import Path
import json
from collections import defaultdict

ROOT = Path(__file__).resolve().parents[1]

INPUT = ROOT / "data" / "raw" / "free-exercise-db" / "dist" / "exercises.json"

print(f"Loading dataset from: {INPUT}")
print(f"Exists: {INPUT.exists()}")

OUT_DIR = ROOT / "data" / "processed"
OUT_DIR.mkdir(parents=True, exist_ok=True)

OUTPUT = OUT_DIR / "exercises_normalized.json"
REPORT = OUT_DIR / "normalization_report.json"
UNKNOWN = OUT_DIR / "unknown_values.json"

EQUIPMENT = {
    "barbell":"BARBELL",
    "dumbbell":"DUMBBELL",
    "cable":"CABLE",
    "machine":"MACHINE",
    "body only":"BODY_WEIGHT",
    "exercise ball":"STABILITY_BALL",
    "medicine ball":"MEDICINE_BALL",
    "foam roll":"FOAM_ROLLER",
    "kettlebells":"KETTLEBELL",
    "bands":"RESISTANCE_BANDS",
    "e-z curl bar":"EZ_CURL_BAR",
    "other":"OTHER",
}

CATEGORY = {
    "strength":"STRENGTH",
    "stretching":"STRETCHING",
    "plyometrics":"PLYOMETRICS",
    "cardio":"CARDIO",
    "powerlifting":"POWERLIFTING",
    "strongman":"STRONGMAN",
    "olympic weightlifting":"OLYMPIC_WEIGHTLIFTING",
}

LEVEL = {
    "beginner":"BEGINNER",
    "intermediate":"INTERMEDIATE",
    "expert":"ADVANCED",
}

MECHANIC = {
    "compound":"COMPOUND",
    "isolation":"ISOLATION",
}

FORCE = {
    "push":"PUSH",
    "pull":"PULL",
    "static":"STATIC",
}

MUSCLES = {
    "abdominals":"ABDOMINALS",
    "abductors":"ABDUCTORS",
    "adductors":"ADDUCTORS",
    "biceps":"BICEPS",
    "calves":"CALVES",
    "chest":"CHEST",
    "forearms":"FOREARMS",
    "glutes":"GLUTES",
    "hamstrings":"HAMSTRINGS",
    "lats":"LATS",
    "lower back":"LOWER_BACK",
    "middle back":"MIDDLE_BACK",
    "neck":"NECK",
    "quadriceps":"QUADRICEPS",
    "shoulders":"SHOULDERS",
    "traps":"TRAPS",
    "triceps":"TRICEPS",
}

unknown_values = defaultdict(set)
stats = defaultdict(int)

def clean(v):
    if v is None:
        return None
    if isinstance(v, str):
        v = v.strip()
        return v if v else None
    return v

def map_value(value, mapping, field, none_value):
    value = clean(value)
    if value is None:
        return none_value
    key = value.lower()
    if key in mapping:
        return mapping[key]
    unknown_values[field].add(value)
    return "UNKNOWN"

def normalize_equipment(raw, category, mechanic):
    raw = clean(raw)
    if raw is None:
        c = clean(category)
        m = clean(mechanic)
        if c and c.lower() in {"strength","powerlifting","plyometrics"} and m:
            return "BODY_WEIGHT"
        return "NONE"
    key = raw.lower()
    if key in EQUIPMENT:
        return EQUIPMENT[key]
    unknown_values["equipment"].add(raw)
    return "UNKNOWN"

def normalize_list(values):
    result=[]
    if not values:
        return result
    for item in values:
        result.append(map_value(item,MUSCLES,"muscles","NONE"))
    return result

def main():
    print("="*55)
    print(" FITNESS-RAG NORMALIZATION")
    print("="*55)

    with open(INPUT,"r",encoding="utf-8") as f:
        exercises=json.load(f)

    print(f"Loaded {len(exercises)} exercises")

    normalized=[]

    for ex in exercises:
        stats["processed"]+=1

        raw_equipment=ex.get("equipment")
        raw_category=ex.get("category")
        raw_level=ex.get("level")
        raw_mechanic=ex.get("mechanic")
        raw_force=ex.get("force")
        raw_primary=ex.get("primaryMuscles",[])
        raw_secondary=ex.get("secondaryMuscles",[])

        obj={
            "id":clean(ex.get("id")),
            "name":clean(ex.get("name")),
            "equipment":normalize_equipment(raw_equipment,raw_category,raw_mechanic),
            "category":map_value(raw_category,CATEGORY,"category","NONE"),
            "level":map_value(raw_level,LEVEL,"level","NONE"),
            "mechanic":map_value(raw_mechanic,MECHANIC,"mechanic","UNSPECIFIED"),
            "force":map_value(raw_force,FORCE,"force","UNSPECIFIED"),
            "primaryMuscles":normalize_list(raw_primary),
            "secondaryMuscles":normalize_list(raw_secondary),
            "instructions":ex.get("instructions",[]),
            "images":ex.get("images",[]),
            "_raw":{
                "equipment":raw_equipment,
                "category":raw_category,
                "level":raw_level,
                "mechanic":raw_mechanic,
                "force":raw_force,
                "primaryMuscles":raw_primary,
                "secondaryMuscles":raw_secondary
            }
        }
        normalized.append(obj)

    with open(OUTPUT,"w",encoding="utf-8") as f:
        json.dump(normalized,f,indent=2,ensure_ascii=False)

    report={
        "totalExercises":len(normalized),
        "normalizedExercises":len(normalized),
        "unknownFields":sum(len(v) for v in unknown_values.values())
    }

    with open(REPORT,"w",encoding="utf-8") as f:
        json.dump(report,f,indent=2)

    unknown_dump={k:sorted(list(v)) for k,v in unknown_values.items()}
    with open(UNKNOWN,"w",encoding="utf-8") as f:
        json.dump(unknown_dump,f,indent=2)

    print("Normalization complete.")
    print(f"Saved -> {OUTPUT}")
    print(f"Saved -> {REPORT}")
    print(f"Saved -> {UNKNOWN}")

if __name__=="__main__":
    main()