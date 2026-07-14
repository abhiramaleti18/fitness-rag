# Loads the curated stretch/mobility knowledge base (knowledge/mobility/stretches/*.json)
# and exposes grounded lookups by muscle group and free-text search. This is the
# same "compute the truth first, let the LLM only narrate it" pattern used
# throughout the rest of the app (prescription_service, split_analysis_service).

import json
from app.core.config import ROOT_DIR

STRETCHES_DIR = ROOT_DIR / "knowledge" / "mobility" / "stretches"

PRIORITY_ORDER = {"VERY_HIGH": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}


def _load_all() -> dict:
    library = {}
    for path in STRETCHES_DIR.glob("*.json"):
        with open(path) as f:
            data = json.load(f)
        region = data["region"]
        library.setdefault(region, []).extend(data["stretches"])
    return library


STRETCH_LIBRARY = _load_all()

# Maps the muscle-group names used in the exercises collection (primaryMuscles)
# to the region keys used in the stretch library. Several exercise-DB muscles
# have no dedicated stretch region yet (e.g. biceps, abdominals) — those fall
# back to the closest related region rather than being silently dropped.
MUSCLE_TO_REGION = {
    "CHEST": ["CHEST"],
    "BACK": ["LATS"],
    "LATS": ["LATS"],
    "MIDDLE_BACK": ["LATS", "THORACIC_SPINE"],
    "LOWER_BACK": ["HIPS"],
    "SHOULDERS": ["SHOULDERS"],
    "TRICEPS": ["SHOULDERS"],
    "BICEPS": ["SHOULDERS"],
    "FOREARMS": ["WRISTS"],
    "QUADRICEPS": ["QUADRICEPS"],
    "HAMSTRINGS": ["HAMSTRINGS"],
    "GLUTES": ["HIPS"],
    "CALVES": ["CALVES"],
    "ABDOMINALS": ["THORACIC_SPINE"],
    "TRAPS": ["NECK"],
    "ADDUCTORS": ["ADDUCTORS"],
    "ABDUCTORS": ["HIPS"],
}


def get_regions_for_muscles(muscles: list[str]) -> list[str]:
    regions = []
    for m in muscles:
        for r in MUSCLE_TO_REGION.get(m.upper(), []):
            if r not in regions:
                regions.append(r)
    return regions


def _passes_equipment_check(stretch: dict, has_pull_up_bar: bool) -> bool:
    equipment = stretch.get("equipment", [])
    if "Pull-Up Bar" in equipment and not has_pull_up_bar:
        return False
    return True


def get_stretches_for_regions(regions: list[str], before_workout: bool = None, has_pull_up_bar: bool = True) -> list[dict]:
    results = []
    for r in regions:
        for s in STRETCH_LIBRARY.get(r, []):
            if before_workout is not None:
                key = "beforeWorkout" if before_workout else "afterWorkout"
                if not s.get(key):
                    continue
            if not _passes_equipment_check(s, has_pull_up_bar):
                continue
            results.append(s)
    results.sort(key=lambda s: PRIORITY_ORDER.get(s.get("priority", "MEDIUM"), 2))
    return results


def get_stretches_for_muscles(muscles: list[str], before_workout: bool = None, has_pull_up_bar: bool = True, limit: int = None) -> list[dict]:
    regions = get_regions_for_muscles(muscles)
    stretches = get_stretches_for_regions(regions, before_workout=before_workout, has_pull_up_bar=has_pull_up_bar)
    if limit:
        return stretches[:limit]
    return stretches


def search_stretches_by_keyword(query: str, limit: int = 6) -> list[dict]:
    """Free-text search across name/helpsWith/mobilityGoals/targets — powers
    the /recommend mobility path for queries like 'shoulder mobility routine'
    or 'stretches for tight hips'."""
    q_words = query.lower().split()
    matches = []
    for region_stretches in STRETCH_LIBRARY.values():
        for s in region_stretches:
            haystack = " ".join([
                s.get("name", ""),
                " ".join(s.get("helpsWith", [])),
                " ".join(s.get("mobilityGoals", [])),
                " ".join(s.get("targets", [])),
            ]).lower()
            if any(word in haystack for word in q_words):
                matches.append(s)

    # de-dupe by name (some stretches appear validly across regions, e.g. Prayer Stretch)
    seen = set()
    deduped = []
    for s in matches:
        if s["name"] not in seen:
            deduped.append(s)
            seen.add(s["name"])

    deduped.sort(key=lambda s: PRIORITY_ORDER.get(s.get("priority", "MEDIUM"), 2))
    return deduped[:limit]