# Fitness-RAG
# Exercise Ontology Specification (v1.0)

---

# Purpose

This document defines the complete semantic structure of an enriched exercise.

The raw exercise dataset only contains descriptive information such as muscles, equipment, and instructions.

The ontology extends each exercise with coaching knowledge, biomechanical metadata, safety information, and AI retrieval metadata.

This document serves as the specification for `enrich_dataset.py`.

No field should be added unless it is defined here.

---

# Design Principles

Every exercise should answer four questions.

1. What is it?
2. How is it performed?
3. When should it be recommended?
4. When should it NOT be recommended?

The ontology is designed to answer those questions.

---

# Complete Exercise Schema

```json
{
    "id": "",
    "name": "",

    "equipment": "",
    "category": "",

    "primaryMuscles": [],
    "secondaryMuscles": [],

    "movementPattern": "",
    "movementPlane": "",

    "compound": true,

    "difficultyScore": 1,

    "fatigueScore": 1,

    "skillRequirement": "",

    "stability": "",

    "homeGymCompatible": true,

    "goalTags": [],

    "recommendedTempo": "",

    "recommendedRIR": "",

    "romImportance": "",

    "jointActions": [],

    "contraindications": [],

    "coachingCues": [],

    "commonMistakes": [],

    "alternatives": [],

    "progressions": [],

    "regressions": [],

    "retrievalTags": []
}
```

---

# Field Definitions

## Movement Pattern

Describes the dominant movement.

Allowed values:

```
HORIZONTAL_PUSH

VERTICAL_PUSH

HORIZONTAL_PULL

VERTICAL_PULL

SQUAT

HINGE

LUNGE

CARRY

CORE_FLEXION

CORE_EXTENSION

ANTI_EXTENSION

ANTI_ROTATION

ROTATION

MOBILITY
```

Every exercise must have exactly one primary movement pattern.

---

## Movement Plane

Allowed values

```
SAGITTAL

FRONTAL

TRANSVERSE

MULTIPLANAR
```

---

## Compound

Boolean

```
true

false
```

Compound exercises involve multiple joints.

---

## Difficulty Score

Represents learning difficulty.

Scale

```
1 Very Easy

2 Easy

3 Moderate

4 Difficult

5 Advanced
```

---

## Fatigue Score

Represents systemic fatigue.

Scale

```
1 Minimal

2 Low

3 Moderate

4 High

5 Very High
```

Example

```
Biceps Curl

↓

1
```

```
Deadlift

↓

5
```

---

## Skill Requirement

Allowed values

```
BEGINNER

INTERMEDIATE

ADVANCED

EXPERT
```

---

## Stability Requirement

Allowed values

```
VERY_HIGH

HIGH

MODERATE

LOW

VERY_LOW
```

Machine exercises generally have higher stability.

Free weights generally require more stabilization.

---

## Home Gym Compatible

Boolean

Represents whether the average home gym can perform the exercise.

---

## Goal Tags

Multiple values allowed.

```
HYPERTROPHY

STRENGTH

POWER

ENDURANCE

GENERAL_FITNESS

MOBILITY

REHABILITATION
```

---

## Recommended Tempo

Stored using four-number notation.

Example

```
3-1-1-0

↓

3 sec eccentric

1 sec pause

1 sec concentric

0 sec pause
```

---

## Recommended RIR

Examples

```
0-1

1-3

2-4
```

---

## ROM Importance

Allowed values

```
LOW

MEDIUM

HIGH

CRITICAL
```

Represents how important full range of motion is for this exercise.

---

## Joint Actions

Examples

Bench Press

```
Shoulder Horizontal Adduction

Elbow Extension
```

Squat

```
Hip Extension

Knee Extension
```

---

## Contraindications

Examples

```
SHOULDER_PAIN

LOW_BACK_PAIN

ACL_RECOVERY

ELBOW_PAIN
```

These are not diagnoses.

They are retrieval flags.

---

## Coaching Cues

Short coaching instructions.

Examples

```
Brace the core

Retract the scapula

Control the eccentric

Maintain neutral spine

Drive through the heels

Keep elbows tucked
```

---

## Common Mistakes

Examples

```
Half ROM

Using momentum

Poor posture

Locking knees

Rounded back

Bouncing the weight
```

---

## Alternatives

Exercises targeting similar muscles with similar movement patterns.

Example

Bench Press

↓

```
Machine Chest Press

Push Up

Dumbbell Bench Press
```

---

## Progressions

Harder variations.

Example

Push Up

↓

```
Weighted Push Up

Ring Push Up
```

---

## Regressions

Simpler variations.

Example

Pull Up

↓

```
Assisted Pull Up

Lat Pulldown
```

---

## Retrieval Tags

Keywords used by RAG.

Examples

```
Chest

Press

Horizontal Push

Compound

Strength

Hypertrophy
```

---

# Relationships

Each exercise relates to:

- Equipment
- Muscles
- Movement Pattern
- Goal Tags
- Alternatives
- Contraindications

These relationships improve retrieval quality.

---

# Enrichment Rules

The enrichment pipeline must follow these rules.

1. Never overwrite normalized fields.
2. Every new field must be deterministic or manually curated.
3. Unknown values should be marked as `UNKNOWN`.
4. Preserve original dataset values.
5. Every exercise must contain all ontology fields.
6. Arrays should never be null.
7. Empty arrays are preferred over missing fields.

---

# Usage in RAG

The ontology supports:

- Hybrid retrieval
- Exercise recommendation
- Exercise substitution
- Injury-aware filtering
- Goal-based programming
- Coaching explanations
- Personalized workout generation

---

# Future Extensions

The ontology can later support:

- Estimated session time
- Muscle activation score
- Equipment availability score
- Difficulty progression graph
- Video demonstrations
- Exercise popularity
- AI confidence score

These are intentionally excluded from Version 1.

---

# Version

Current Version

```
1.0
```

This specification is considered stable.

All enrichment scripts should follow this document.