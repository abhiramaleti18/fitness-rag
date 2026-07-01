
import json
import shutil
from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parents[1]

INPUT = ROOT / "data" / "processed" / "exercises_enriched.json"
REPORT_DIR = ROOT / "data" / "reports"
OUTPUT_DIR = ROOT / "data" / "processed"

REPORT_DIR.mkdir(parents=True, exist_ok=True)
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

REQUIRED_FIELDS = [
    "id","name","equipment","category","level","mechanic","force",
    "primaryMuscles","secondaryMuscles","instructions","images",
    "movementPattern","goalTags","tempo","recommendedRIR",
    "romImportance","fatigueScore","skillRequirement","stability",
    "homeGymCompatible","contraindications","coachingCues",
    "commonMistakes","alternatives","progressions","regressions"
]

EXPECTED_TYPES = {
    "id":str,"name":str,"equipment":str,"category":str,"level":str,
    "mechanic":str,"force":str,"primaryMuscles":list,
    "secondaryMuscles":list,"instructions":list,"images":list,
    "movementPattern":str,"goalTags":list,"tempo":str,
    "recommendedRIR":str,"romImportance":str,"fatigueScore":int,
    "skillRequirement":str,"stability":str,
    "homeGymCompatible":bool,"contraindications":list,
    "coachingCues":list,"commonMistakes":list,
    "alternatives":list,"progressions":list,"regressions":list
}

def load():
    if not INPUT.exists():
        raise FileNotFoundError(f"Missing: {INPUT}")
    with open(INPUT,"r",encoding="utf-8") as f:
        return json.load(f)

def main():
    data=load()

    errors=[]
    warnings=[]

    ids=[]
    names=[]

    valid=0
    unknown=0

    movement_counter=Counter()
    equipment_counter=Counter()
    category_counter=Counter()

    for ex in data:
        ok=True

        ids.append(ex.get("id"))
        names.append(ex.get("name"))

        movement_counter[ex.get("movementPattern","UNKNOWN")] += 1
        equipment_counter[ex.get("equipment","UNKNOWN")] += 1
        category_counter[ex.get("category","UNKNOWN")] += 1

        if ex.get("movementPattern")=="UNKNOWN":
            unknown+=1

        for field in REQUIRED_FIELDS:
            if field not in ex:
                errors.append(f'{ex.get("id")} missing "{field}"')
                ok=False
                continue

            val=ex[field]
            typ=EXPECTED_TYPES[field]

            if not isinstance(val,typ):
                errors.append(
                    f'{ex.get("id")} field "{field}" expected {typ.__name__}, got {type(val).__name__}'
                )
                ok=False

        for lst in [
            "coachingCues",
            "commonMistakes",
            "alternatives",
            "progressions",
            "regressions"
        ]:
            if isinstance(ex.get(lst),list) and len(ex[lst])==0:
                warnings.append(f'{ex.get("id")} has empty {lst}')

        if ok:
            valid+=1

    dup_ids=[k for k,v in Counter(ids).items() if v>1]
    dup_names=[k for k,v in Counter(names).items() if v>1]

    report={
        "totalExercises":len(data),
        "validExercises":valid,
        "invalidExercises":len(data)-valid,
        "duplicateIds":len(dup_ids),
        "duplicateNames":len(dup_names),
        "unknownMovementPatterns":unknown,
        "warnings":len(warnings),
        "movementPatternDistribution":dict(movement_counter),
        "equipmentDistribution":dict(equipment_counter),
        "categoryDistribution":dict(category_counter),
        "errors":errors[:200],
        "warningSamples":warnings[:200]
    }

    with open(REPORT_DIR/"validation_report.json","w",encoding="utf-8") as f:
        json.dump(report,f,indent=2)

    md=[]
    md.append("# Validation Report\n")
    md.append(f"Total Exercises: **{len(data)}**")
    md.append(f"Valid Exercises: **{valid}**")
    md.append(f"Invalid Exercises: **{len(data)-valid}**")
    md.append(f"Duplicate IDs: **{len(dup_ids)}**")
    md.append(f"Duplicate Names: **{len(dup_names)}**")
    md.append(f"Unknown Movement Patterns: **{unknown}**")
    md.append(f"Warnings: **{len(warnings)}**\n")

    if errors:
        md.append("## Errors")
        md.extend([f"- {e}" for e in errors[:50]])

    if warnings:
        md.append("\n## Warnings")
        md.extend([f"- {w}" for w in warnings[:50]])

    with open(REPORT_DIR/"validation_report.md","w",encoding="utf-8") as f:
        f.write("\n".join(md))

    if report["invalidExercises"]==0:
        shutil.copy2(INPUT, OUTPUT_DIR/"exercises_v1.json")
        print("Dataset frozen -> exercises_v1.json")
    else:
        print("Validation failed. Dataset NOT frozen.")

    print(json.dumps(report,indent=2))

if __name__=="__main__":
    main()
