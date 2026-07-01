# FITNESS-RAG — Data Dictionary

Complete inventory of every categorical value in the Free Exercise DB dataset.
Each raw value is mapped to its canonical identifier used in the normalized dataset.

## Equipment

| Raw Value | Count | Canonical ID | Notes |
|-----------|-------|--------------|-------|
| `barbell` | 170 | `BARBELL` |  |
| `dumbbell` | 123 | `DUMBBELL` |  |
| `other` | 122 | `OTHER` | Investigate — see ambiguous values |
| `body only` | 111 | `BODY_WEIGHT` |  |
| `cable` | 81 | `CABLE` |  |
| `MISSING` | 77 | `NONE` | Null / empty in source |
| `machine` | 67 | `MACHINE` |  |
| `kettlebells` | 53 | `KETTLEBELL` |  |
| `bands` | 20 | `RESISTANCE_BANDS` |  |
| `medicine ball` | 17 | `MEDICINE_BALL` |  |
| `exercise ball` | 12 | `STABILITY_BALL` |  |
| `foam roll` | 11 | `FOAM_ROLLER` |  |
| `e-z curl bar` | 9 | `EZ_CURL_BAR` |  |

## Category

| Raw Value | Count | Canonical ID | Notes |
|-----------|-------|--------------|-------|
| `strength` | 581 | `STRENGTH` |  |
| `stretching` | 123 | `STRETCHING` |  |
| `plyometrics` | 61 | `PLYOMETRICS` |  |
| `powerlifting` | 38 | `POWERLIFTING` |  |
| `olympic weightlifting` | 35 | `OLYMPIC_WEIGHTLIFTING` |  |
| `strongman` | 21 | `STRONGMAN` |  |
| `cardio` | 14 | `CARDIO` |  |

## Difficulty Level

| Raw Value | Count | Canonical ID | Notes |
|-----------|-------|--------------|-------|
| `beginner` | 523 | `BEGINNER` |  |
| `intermediate` | 293 | `INTERMEDIATE` |  |
| `expert` | 57 | `EXPERT` |  |

## Mechanic

| Raw Value | Count | Canonical ID | Notes |
|-----------|-------|--------------|-------|
| `compound` | 489 | `COMPOUND` |  |
| `isolation` | 297 | `ISOLATION` |  |
| `MISSING` | 87 | `UNSPECIFIED` | Null / empty in source |

## Force Type

| Raw Value | Count | Canonical ID | Notes |
|-----------|-------|--------------|-------|
| `pull` | 371 | `PULL` |  |
| `push` | 369 | `PUSH` |  |
| `static` | 104 | `STATIC` |  |
| `MISSING` | 29 | `UNSPECIFIED` | Null / empty in source |

## Primary Muscles

| Raw Value | Count | Canonical ID | Notes |
|-----------|-------|--------------|-------|
| `quadriceps` | 148 | `QUADRICEPS` |  |
| `shoulders` | 127 | `SHOULDERS` |  |
| `abdominals` | 93 | `ABDOMINALS` |  |
| `chest` | 84 | `CHEST` |  |
| `hamstrings` | 79 | `HAMSTRINGS` |  |
| `triceps` | 71 | `TRICEPS` |  |
| `biceps` | 53 | `BICEPS` |  |
| `lats` | 38 | `LATS` |  |
| `middle back` | 34 | `MIDDLE_BACK` |  |
| `calves` | 28 | `CALVES` |  |
| `lower back` | 27 | `LOWER_BACK` |  |
| `forearms` | 25 | `FOREARMS` |  |
| `glutes` | 22 | `GLUTES` |  |
| `traps` | 15 | `TRAPS` |  |
| `adductors` | 13 | `ADDUCTORS` |  |
| `neck` | 8 | `NECK` |  |
| `abductors` | 8 | `ABDUCTORS` |  |

## Secondary Muscles

| Raw Value | Count | Canonical ID | Notes |
|-----------|-------|--------------|-------|
| `glutes` | 220 | `GLUTES` |  |
| `shoulders` | 209 | `SHOULDERS` |  |
| `hamstrings` | 201 | `HAMSTRINGS` |  |
| `calves` | 181 | `CALVES` |  |
| `triceps` | 147 | `TRICEPS` |  |
| `lower back` | 104 | `LOWER_BACK` |  |
| `forearms` | 94 | `FOREARMS` |  |
| `quadriceps` | 82 | `QUADRICEPS` |  |
| `traps` | 82 | `TRAPS` |  |
| `biceps` | 74 | `BICEPS` |  |
| `middle back` | 64 | `MIDDLE_BACK` |  |
| `chest` | 63 | `CHEST` |  |
| `abdominals` | 56 | `ABDOMINALS` |  |
| `lats` | 56 | `LATS` |  |
| `adductors` | 41 | `ADDUCTORS` |  |
| `abductors` | 35 | `ABDUCTORS` |  |
| `neck` | 1 | `NECK` |  |

---

## Ambiguous Value Investigation

### Equipment: `other` (122 exercises)

| Exercise | Category | Primary Muscles |
|----------|----------|-----------------|
| Ab Roller | strength | abdominals |
| Anterior Tibialis-SMR | stretching | calves |
| Atlas Stone Trainer | strongman | lower back |
| Atlas Stones | strongman | lower back |
| Axle Deadlift | strongman | lower back |
| Backward Drag | strongman | quadriceps |
| Balance Board | strength | calves |
| Band Assisted Pull-Up | strength | lats |
| Battling Ropes | strength | shoulders |
| Bear Crawl Sled Drags | strongman | quadriceps |
| Behind Head Chest Stretch | stretching | chest |
| Bench Sprint | plyometrics | quadriceps |
| Bicycling | cardio | quadriceps |
| Bodyweight Mid Row | strength | middle back |
| Box Jump (Multiple Response) | plyometrics | hamstrings |
| Box Skip | plyometrics | hamstrings |
| Car Deadlift | strongman | quadriceps |
| Chain Handle Extension | powerlifting | triceps |
| Chain Press | powerlifting | chest |
| Chair Leg Extended Stretch | stretching | hamstrings |
| Chair Upper Body Stretch | stretching | shoulders |
| Chest And Front Of Shoulder Stretch | stretching | chest |
| Circus Bell | strongman | shoulders |
| Conan's Wheel | strongman | quadriceps |
| Crucifix | strongman | shoulders |
| Depth Jump Leap | plyometrics | quadriceps |
| Dips - Chest Version | strength | chest |
| Donkey Calf Raises | strength | calves |
| Drop Push | plyometrics | chest |
| Farmer's Walk | strongman | forearms |
| Foot-SMR | stretching | calves |
| Forward Drag with Press | strongman | chest |
| Front Box Jump | plyometrics | hamstrings |
| Front Cone Hops (or hurdle hops) | plyometrics | quadriceps |
| Front Plate Raise | strength | shoulders |
| Gironda Sternum Chins | strength | lats |
| Heavy Bag Thrust | plyometrics | chest |
| Hurdle Hops | plyometrics | hamstrings |
| Hyperextensions (Back Extensions) | strength | lower back |
| IT Band and Glute Stretch | stretching | abductors |
| Incline Push-Up Depth Jump | plyometrics | chest |
| Intermediate Groin Stretch | stretching | hamstrings |
| Intermediate Hip Flexor and Quad Stretch | stretching | quadriceps |
| Inverted Row with Straps | strength | middle back |
| Keg Load | strongman | lower back |
| Kipping Muscle Up | strength | lats |
| Knee/Hip Raise On Parallel Bars | strength | abdominals |
| Lateral Box Jump | plyometrics | adductors |
| Lateral Cone Hops | plyometrics | adductors |
| Linear Depth Jump | plyometrics | quadriceps |
| Log Lift | strongman | shoulders |
| London Bridges | strength | lats |
| Lying Bent Leg Groin | stretching | adductors |
| Lying Face Down Plate Neck Resistance | strength | neck |
| Lying Face Up Plate Neck Resistance | strength | neck |
| Lying Hamstring | stretching | hamstrings |
| Mixed Grip Chin | strength | middle back |
| Muscle Up | strength | lats |
| Neck-SMR | stretching | neck |
| On-Your-Back Quad Stretch | stretching | quadriceps |
| One Arm Chin-Up | strength | middle back |
| One Handed Hang | stretching | lats |
| Otis-Up | strength | abdominals |
| Overhead Lat | stretching | lats |
| Parallel Bar Dip | strength | triceps |
| Peroneals Stretch | stretching | calves |
| Plate Pinch | strength | forearms |
| Plate Twist | strength | abdominals |
| Platform Hamstring Slides | strength | hamstrings |
| Posterior Tibialis Stretch | stretching | calves |
| Power Stairs | strongman | hamstrings |
| Prowler Sprint | cardio | hamstrings |
| Quad Stretch | stretching | quadriceps |
| Quick Leap | plyometrics | quadriceps |
| Reverse Plate Curls | strength | biceps |
| Rickshaw Carry | strongman | forearms |
| Rickshaw Deadlift | strongman | quadriceps |
| Ring Dips | strength | triceps |
| Rocky Pull-Ups/Pulldowns | strength | lats |
| Rope Climb | strength | lats |
| Rope Jumping | cardio | quadriceps |
| Round The World Shoulder Stretch | stretching | shoulders |
| Sandbag Load | strongman | quadriceps |
| Seated Band Hamstring Curl | strength | hamstrings |
| Seated Hamstring and Calf Stretch | stretching | hamstrings |
| Seated Head Harness Neck Resistance | strength | neck |
| Side Hop-Sprint | plyometrics | quadriceps |
| Side To Side Chins | strength | lats |
| Side to Side Box Shuffle | plyometrics | quadriceps |
| Single-Cone Sprint Drill | plyometrics | quadriceps |
| Single-Leg High Box Squat | strength | quadriceps |
| Single-Leg Hop Progression | plyometrics | quadriceps |
| Single-Leg Lateral Hop | plyometrics | quadriceps |
| Single-Leg Stride Jump | plyometrics | quadriceps |
| Single Leg Push-off | plyometrics | quadriceps |
| Skating | cardio | quadriceps |
| Sled Drag - Harness | strongman | quadriceps |
| Sled Overhead Backward Walk | strength | shoulders |
| Sled Overhead Triceps Extension | strength | triceps |
| Sled Push | strongman | quadriceps |
| Sled Reverse Flye | strength | shoulders |
| Sled Row | strength | middle back |
| Sledgehammer Swings | plyometrics | abdominals |
| Standing Biceps Stretch | stretching | biceps |
| Standing Elevated Quad Stretch | stretching | quadriceps |
| Standing Hamstring and Calf Stretch | stretching | hamstrings |
| Standing Olympic Plate Hand Squeeze | strength | forearms |
| Stride Jump Crossover | plyometrics | quadriceps |
| Suspended Fallout | strength | abdominals |
| Suspended Push-Up | strength | chest |
| Suspended Reverse Crunch | strength | abdominals |
| Suspended Row | strength | middle back |
| Suspended Split Squat | strength | quadriceps |
| Svend Press | strength | chest |
| Tire Flip | strongman | quadriceps |
| Trap Bar Deadlift | strength | quadriceps |
| Weighted Bench Dip | strength | triceps |
| Weighted Pull Ups | strength | lats |
| Weighted Sit-Ups - With Bands | strength | abdominals |
| Weighted Squat | strength | quadriceps |
| Wrist Roller | strength | forearms |
| Yoke Walk | strongman | quadriceps |

### Equipment: Missing / None (77 exercises)

**Recommendation:** Exercises in the `strength`, `powerlifting`, or `plyometrics`
categories with no equipment listed likely use only bodyweight → map to `BODY_WEIGHT`.
Review the table below to confirm before normalization.

| Exercise | Category | Mechanic | Primary Muscles |
|----------|----------|----------|-----------------|
| Adductor/Groin | stretching | — | adductors |
| Alternate Leg Diagonal Bound | plyometrics | compound | quadriceps |
| Ankle Circles | stretching | isolation | calves |
| Ankle On The Knee | stretching | — | glutes |
| Arm Circles | stretching | isolation | shoulders |
| Bodyweight Walking Lunge | strength | compound | quadriceps |
| Calf Stretch Elbows Against Wall | stretching | isolation | calves |
| Calf Stretch Hands Against Wall | stretching | isolation | calves |
| Carioca Quick Step | plyometrics | — | adductors |
| Cat Stretch | stretching | — | lower back |
| Chair Lower Back Stretch | stretching | isolation | lats |
| Child's Pose | stretching | — | lower back |
| Chin To Chest Stretch | stretching | — | neck |
| Crossover Reverse Lunge | stretching | — | lower back |
| Dancer's Stretch | stretching | — | lower back |
| Decline Push-Up | strength | compound | chest |
| Dynamic Back Stretch | stretching | — | lats |
| Dynamic Chest Stretch | stretching | — | chest |
| Elbow Circles | stretching | isolation | shoulders |
| Elbows Back | stretching | isolation | chest |
| Floor Glute-Ham Raise | strength | isolation | hamstrings |
| Frog Hops | stretching | compound | quadriceps |
| Groin and Back Stretch | stretching | compound | adductors |
| Hamstring Stretch | stretching | isolation | hamstrings |
| Hug Knees To Chest | stretching | — | lower back |
| Inverted Row | strength | compound | middle back |
| Iron Crosses (stretch) | stretching | compound | quadriceps |
| Knee Across The Body | stretching | — | glutes |
| Kneeling Arm Drill | plyometrics | — | shoulders |
| Kneeling Forearm Stretch | stretching | isolation | forearms |
| Kneeling Hip Flexor | stretching | isolation | quadriceps |
| Leg-Up Hamstring Stretch | stretching | isolation | hamstrings |
| Linear 3-Part Start Technique | plyometrics | compound | hamstrings |
| Linear Acceleration Wall Drill | plyometrics | compound | hamstrings |
| Looking At Ceiling | stretching | isolation | quadriceps |
| Middle Back Stretch | stretching | isolation | middle back |
| Mountain Climbers | plyometrics | compound | quadriceps |
| Moving Claw Series | plyometrics | compound | hamstrings |
| On Your Side Quad Stretch | stretching | isolation | quadriceps |
| One Arm Against Wall | stretching | isolation | lats |
| ... | (37 more) | | |

---

## Unmapped Muscle Check

✓ All muscle values have canonical mappings.