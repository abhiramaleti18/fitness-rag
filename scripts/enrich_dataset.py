
"""
enrich_dataset.py

Reads:
- data/processed/exercises.json
- knowledge/exercise_metadata/*.json

Writes:
- data/processed/exercises_enriched.json
- data/reports/enrichment_report.json
"""

from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]

INPUT = ROOT / "data" / "processed" / "exercises.json"
META = ROOT / "knowledge" / "exercise_metadata"
OUT = ROOT / "data" / "processed"
REPORT = ROOT / "data" / "reports"

OUT.mkdir(parents=True, exist_ok=True)
REPORT.mkdir(parents=True, exist_ok=True)

FILES = {
    "movement_patterns":"movement_patterns.json",
    "goal_tags":"goal_tags.json",
    "tempo":"tempo.json",
    "rir":"rir.json",
    "rom":"rom_importance.json",
    "fatigue":"fatigue_scores.json",
    "skill":"skill_requirements.json",
    "stability":"stability.json",
    "home":"home_gym.json",
    "contra":"contraindications.json",
    "cues":"coaching_cues.json",
    "mistakes":"common_mistakes.json",
    "alternatives":"alternatives.json",
    "progressions":"progressions.json",
    "regressions":"regressions.json"
}

def load_json(path):
    with open(path,"r",encoding="utf-8") as f:
        return json.load(f)

def infer_pattern(ex):
    mech = ex.get("mechanic","")
    force = ex.get("force","")
    pm = [m.upper() for m in ex.get("primaryMuscles",[])]

    if "CHEST" in pm:
        return "HORIZONTAL_PUSH"
    if "LATS" in pm:
        return "VERTICAL_PULL"
    if "MIDDLE_BACK" in pm:
        return "HORIZONTAL_PULL"
    if "QUADRICEPS" in pm:
        return "SQUAT"
    if "HAMSTRINGS" in pm or "GLUTES" in pm:
        return "HINGE"
    if "BICEPS" in pm:
        return "ELBOW_FLEXION"
    if "TRICEPS" in pm:
        return "ELBOW_EXTENSION"
    if "CALVES" in pm:
        return "CALF"
    if "ABDOMINALS" in pm:
        return "CORE_FLEXION"
    if "SHOULDERS" in pm:
        if force == "PUSH":
            return "VERTICAL_PUSH"
        return "SHOULDER_ABDUCTION"
    return "UNKNOWN"

def main():
    print("="*60)
    print("FITNESS-RAG DATASET ENRICHMENT")
    print("="*60)

    exercises = load_json(INPUT)
    meta = {k:load_json(META/v) for k,v in FILES.items()}

    enriched=[]
    unknown=0

    for ex in exercises:
        doc = dict(ex)

        pattern = infer_pattern(ex)
        doc["movementPattern"]=pattern

        if pattern == "UNKNOWN":
            unknown += 1

            doc["movementPatternDescription"] = ""
            doc["goalTags"] = []
            doc["tempo"] = "UNKNOWN"
            doc["tempoDescription"] = ""
            doc["recommendedRIR"] = "UNKNOWN"
            doc["rirDescription"] = ""
            doc["romImportance"] = "UNKNOWN"
            doc["romDescription"] = ""
            doc["fatigueScore"] = 0
            doc["fatigueDescription"] = ""
            doc["skillRequirement"] = "UNKNOWN"
            doc["skillDescription"] = ""
            doc["stability"] = "UNKNOWN"
            doc["stabilityDescription"] = ""
            doc["homeGymCompatible"] = False
            doc["homeGymNotes"] = ""
            doc["contraindications"] = []
            doc["coachingCues"] = []
            doc["commonMistakes"] = []
            doc["alternatives"] = []
            doc["progressions"] = []
            doc["regressions"] = []

            enriched.append(doc)
            continue

        mp = meta["movement_patterns"].get(pattern,{})
        goal = meta["goal_tags"].get(pattern, [])
        tempo = meta["tempo"].get(pattern, {})
        rir = meta["rir"].get(pattern, {})
        rom = meta["rom"].get(pattern, {})
        fatigue = meta["fatigue"].get(pattern, {})
        skill = meta["skill"].get(pattern, {})
        stability = meta["stability"].get(pattern, {})
        home = meta["home"].get(pattern, {})
        contra = meta["contra"].get(pattern, {})
        cues = meta["cues"].get(pattern, [])
        mistakes = meta["mistakes"].get(pattern, [])
        alternatives = meta["alternatives"].get(pattern, [])
        progressions = meta["progressions"].get(pattern, [])
        regressions = meta["regressions"].get(pattern, [])
        doc["movementPatternDescription"] = mp.get("description", "")

        doc["goalTags"] = goal

        doc["tempo"] = tempo.get("tempo", "UNKNOWN")
        doc["tempoDescription"] = tempo.get("description", "")

        doc["recommendedRIR"] = rir.get("rir", "UNKNOWN")
        doc["rirDescription"] = rir.get("description", "")

        doc["romImportance"] = rom.get("importance", "UNKNOWN")
        doc["romDescription"] = rom.get("description", "")

        doc["fatigueScore"] = fatigue.get("score", 0)
        doc["fatigueDescription"] = fatigue.get("description", "")

        doc["skillRequirement"] = skill.get("level", "UNKNOWN")
        doc["skillDescription"] = skill.get("description", "")

        doc["stability"] = stability.get("level", "UNKNOWN")
        doc["stabilityDescription"] = stability.get("description", "")

        doc["homeGymCompatible"] = home.get("compatible", False)
        doc["homeGymNotes"] = home.get("notes", "")

        doc["contraindications"] = contra.get("flags", [])

        doc["coachingCues"] = cues
        doc["commonMistakes"] = mistakes
        doc["alternatives"] = alternatives
        doc["progressions"] = progressions
        doc["regressions"] = regressions

        enriched.append(doc)

    with open(OUT/"exercises_enriched.json","w",encoding="utf-8") as f:
        json.dump(enriched,f,indent=2,ensure_ascii=False)

    report = {
        "totalExercises":len(exercises),
        "enriched":len(exercises)-unknown,
        "unknownMovementPatterns":unknown,
        "coverage":round(((len(exercises)-unknown)/len(exercises))*100,2)
    }

    with open(REPORT/"enrichment_report.json","w",encoding="utf-8") as f:
        json.dump(report,f,indent=2)

    print(json.dumps(report,indent=2))
    print("\n[OK] data/processed/exercises_enriched.json")
    print("[OK] data/reports/enrichment_report.json")

if __name__=="__main__":
    try:
        main()
    except Exception as e:
        print("[ERROR]",e)
        sys.exit(1)
