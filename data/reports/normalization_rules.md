# FITNESS-RAG — Normalization Rules

This document is the specification for `normalize.py`.
Every transformation is listed here. The script must implement exactly these rules.

---

## Rule Format

```
Field: <field_name>
Raw   → Canonical
Notes: <any special logic>
```

---

## Equipment

- "barbell" → `BARBELL`
- "dumbbell" → `DUMBBELL`
- "cable" → `CABLE`
- "machine" → `MACHINE`
- "body only" → `BODY_WEIGHT`
- "exercise ball" → `STABILITY_BALL`
- "medicine ball" → `MEDICINE_BALL`
- "foam roll" → `FOAM_ROLLER`
- "kettlebells" → `KETTLEBELL`
- "bands" → `RESISTANCE_BANDS`
- "e-z curl bar" → `EZ_CURL_BAR`
- "other" → `OTHER`
- null / empty → `NONE`
- null / empty → `NONE`

**Special rule — missing equipment:**
If `equipment` is null/empty:
- AND `category` is `strength`, `powerlifting`, or `plyometrics`
- AND `mechanic` is not null
→ Set equipment to `BODY_WEIGHT`

If the above conditions are NOT met → Set to `NONE`

---

## Category

- "strength" → `STRENGTH`
- "stretching" → `STRETCHING`
- "plyometrics" → `PLYOMETRICS`
- "cardio" → `CARDIO`
- "powerlifting" → `POWERLIFTING`
- "strongman" → `STRONGMAN`
- "olympic weightlifting" → `OLYMPIC_WEIGHTLIFTING`

---

## Difficulty Level

- "beginner" → `BEGINNER`
- "intermediate" → `INTERMEDIATE`
- "expert" → `EXPERT`

---

## Mechanic

- "compound" → `COMPOUND`
- "isolation" → `ISOLATION`
- null / empty → `UNSPECIFIED`
- null / empty → `UNSPECIFIED`

---

## Force Type

- "push" → `PUSH`
- "pull" → `PULL`
- "static" → `STATIC`
- null / empty → `UNSPECIFIED`
- null / empty → `UNSPECIFIED`

---

## Muscles (Primary and Secondary)

- "abdominals" → `ABDOMINALS`
- "abductors" → `ABDUCTORS`
- "adductors" → `ADDUCTORS`
- "biceps" → `BICEPS`
- "calves" → `CALVES`
- "chest" → `CHEST`
- "forearms" → `FOREARMS`
- "glutes" → `GLUTES`
- "hamstrings" → `HAMSTRINGS`
- "lats" → `LATS`
- "lower back" → `LOWER_BACK`
- "middle back" → `MIDDLE_BACK`
- "neck" → `NECK`
- "quadriceps" → `QUADRICEPS`
- "shoulders" → `SHOULDERS`
- "traps" → `TRAPS`
- "triceps" → `TRICEPS`

---

## General Rules (apply to all fields)

1. Strip leading/trailing whitespace from all string values before mapping.
2. Convert to lowercase before lookup to handle case inconsistencies.
3. If a value is not found in the map, log a warning and set to `UNKNOWN`.
4. Original raw values must be preserved in a `_raw` sub-object for traceability.

---

## Output Schema (normalized exercise document)

```json
{
  "id"              : "string  — original id, unchanged",
  "name"            : "string  — original name, stripped",
  "equipment"       : "CANONICAL_ID",
  "category"        : "CANONICAL_ID",
  "level"           : "CANONICAL_ID",
  "mechanic"        : "CANONICAL_ID",
  "force"           : "CANONICAL_ID",
  "primaryMuscles"  : ["CANONICAL_ID", ...],
  "secondaryMuscles": ["CANONICAL_ID", ...],
  "instructions"    : ["string", ...],
  "images"          : ["relative/path.jpg", ...],
  "_raw": {
    "equipment"       : "original raw value",
    "category"        : "original raw value",
    "level"           : "original raw value",
    "mechanic"        : "original raw value",
    "force"           : "original raw value",
    "primaryMuscles"  : ["original", ...],
    "secondaryMuscles": ["original", ...]
  }
}
```

---

## What Normalization Does NOT Do

- Does not modify instructions text.
- Does not add enrichment fields (movementPattern, injuryFlags, etc.) — that is Phase 3.
- Does not generate embeddings.
- Does not touch image files.
- Does not write to MongoDB.

Normalization output: `data/processed/exercises_normalized.json`