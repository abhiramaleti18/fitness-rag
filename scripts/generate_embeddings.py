"""
generate_embeddings.py
-----------------------
FITNESS-RAG — Phase 6: Embedding Pipeline  (v1.1)

Generates semantic embeddings for all exercise documents in MongoDB Atlas
using the BAAI/bge-base-en-v1.5 sentence transformer model.

Safe to run multiple times. Skips documents that already have
vector.embedding unless --force flag is provided.

Usage:
    python generate_embeddings.py
    python generate_embeddings.py --force
"""

import argparse
import os
import sys
import time
from datetime import datetime, timezone
from typing import Any

import torch

from dotenv import load_dotenv
from pymongo import MongoClient, UpdateOne
from pymongo.collection import Collection
from pymongo.errors import BulkWriteError, ConnectionFailure
from sentence_transformers import SentenceTransformer
from tqdm import tqdm

# ─────────────────────────────────────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────────────────────────────────────

MODEL_NAME       : str = "BAAI/bge-base-en-v1.5"
PIPELINE_VERSION : str = "1.1"
DIMENSION        : int = 768
BATCH_SIZE       : int = 32
UNKNOWN          : str = "Unknown"


# ─────────────────────────────────────────────────────────────────────────────
# CONNECTION
# ─────────────────────────────────────────────────────────────────────────────

def connect(uri: str, db_name: str, collection_name: str) -> Collection:
    """Connect to MongoDB Atlas and return the target collection.

    Args:
        uri: MongoDB connection string from environment.
        db_name: Name of the database.
        collection_name: Name of the exercises collection.

    Returns:
        A pymongo Collection object.

    Raises:
        SystemExit: If the connection cannot be established.
    """
    print("Connecting to MongoDB...")
    try:
        client: MongoClient = MongoClient(uri, serverSelectionTimeoutMS=8000)
        client.admin.command("ping")
        collection: Collection = client[db_name][collection_name]
        count: int = collection.count_documents({})
        print(f"  [OK] Connected.  Database: {db_name}  |  Collection: {collection_name}  |  Documents: {count}")
        return collection
    except ConnectionFailure as exc:
        print(f"  [ERROR] MongoDB connection failed: {exc}")
        sys.exit(1)


# ─────────────────────────────────────────────────────────────────────────────
# MODEL
# ─────────────────────────────────────────────────────────────────────────────

def load_model() -> SentenceTransformer:
    """Load the BAAI/bge-base-en-v1.5 sentence transformer model.

    Returns:
        A loaded SentenceTransformer instance.

    Raises:
        SystemExit: If the model cannot be loaded.
    """
    print(f"Loading embedding model  ({MODEL_NAME})...")
    try:
        model: SentenceTransformer = SentenceTransformer(MODEL_NAME)
        print(f"  [OK] Model loaded.  Dimension: {DIMENSION}")
        return model
    except Exception as exc:
        print(f"  [ERROR] Failed to load model: {exc}")
        sys.exit(1)


# ─────────────────────────────────────────────────────────────────────────────
# TEXT NORMALISATION HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _clean(value: Any) -> str:
    """Normalise a single field value to a clean string.

    Converts booleans to Yes/No, collapses whitespace, and falls back
    to UNKNOWN for None or empty values.

    Args:
        value: Raw field value of any type.

    Returns:
        Cleaned string representation.
    """
    if value is None:
        return UNKNOWN
    if isinstance(value, bool):
        return "Yes" if value else "No"
    text: str = str(value).strip()
    while "  " in text:
        text = text.replace("  ", " ")
    return text if text else UNKNOWN


def _join(values: Any, separator: str = ", ") -> str:
    """Join a list of values into a clean inline string.

    Args:
        values: A list (or any iterable) of raw values.
        separator: String used to join items.

    Returns:
        Joined string, or UNKNOWN if the list is empty or None.
    """
    if not values or not isinstance(values, list):
        return UNKNOWN
    cleaned: list[str] = [_clean(v) for v in values if v is not None]
    return separator.join(cleaned) if cleaned else UNKNOWN


def _bullet_list(values: Any) -> str:
    """Format a list as newline-separated entries.

    Args:
        values: A list of raw string values.

    Returns:
        Newline-joined string, or UNKNOWN.
    """
    if not values or not isinstance(values, list):
        return UNKNOWN
    cleaned: list[str] = [_clean(v) for v in values if v is not None]
    return "\n".join(cleaned) if cleaned else UNKNOWN


def _normalise_document(text: str) -> str:
    """Apply final whitespace normalisation to a full semantic document.

    Collapses duplicate spaces and excessive blank lines so the embedding
    input is consistently formatted regardless of which fields were missing.

    Args:
        text: Raw assembled semantic document.

    Returns:
        Cleaned document string.
    """
    while "  " in text:
        text = text.replace("  ", " ")
    while "\n\n\n" in text:
        text = text.replace("\n\n\n", "\n\n")
    return text.strip()


# ─────────────────────────────────────────────────────────────────────────────
# SEMANTIC DOCUMENT BUILDER
# ─────────────────────────────────────────────────────────────────────────────

def build_embedding_text(doc: dict) -> str:
    """Construct the rich semantic document used as embedding input.

    Every field is normalised. Missing fields default to UNKNOWN.
    Booleans convert to Yes/No. Lists are joined appropriately.
    Enriched description fields are included alongside their scalar values
    to provide richer semantic context for retrieval.

    Args:
        doc: A raw MongoDB exercise document.

    Returns:
        A clean multi-line string ready for the embedding model.
    """
    # ── Core fields ──────────────────────────────────────────────────────────
    name     : str = _clean(doc.get("name"))
    category : str = _clean(doc.get("category"))
    level    : str = _clean(doc.get("level"))
    equipment: str = _clean(doc.get("equipment"))

    # ── Movement Pattern ─────────────────────────────────────────────────────
    movement_pattern      : str = _clean(doc.get("movementPattern"))
    movement_pattern_desc : str = _clean(
        doc.get("movementPatternDescription") or
        doc.get("movementPattern_description")
    )

    # ── Muscles ──────────────────────────────────────────────────────────────
    primary_muscles  : str = _join(doc.get("primaryMuscles"))
    secondary_muscles: str = _join(doc.get("secondaryMuscles"))

    # ── Goals ────────────────────────────────────────────────────────────────
    goal_tags: str = _join(doc.get("goalTags"))

    # ── Instructions ─────────────────────────────────────────────────────────
    instructions: str = _bullet_list(doc.get("instructions"))

    # ── Tempo ────────────────────────────────────────────────────────────────
    tempo: str = _clean(doc.get("tempo"))

    # ── ROM ──────────────────────────────────────────────────────────────────
    rom      : str = _clean(doc.get("romImportance") or doc.get("rom"))
    rom_desc : str = _clean(doc.get("romDescription") or doc.get("rom_description"))

    # ── Fatigue ──────────────────────────────────────────────────────────────
    fatigue      : str = _clean(doc.get("fatigueScore") or doc.get("fatigue"))
    fatigue_desc : str = _clean(doc.get("fatigueDescription") or doc.get("fatigue_description"))

    # ── Skill ────────────────────────────────────────────────────────────────
    skill      : str = _clean(doc.get("skillRequirement") or doc.get("skill"))
    skill_desc : str = _clean(doc.get("skillDescription") or doc.get("skill_description"))

    # ── Home Gym ─────────────────────────────────────────────────────────────
    home_gym      : str = _clean(doc.get("homeGymCompatible"))
    home_gym_notes: str = _clean(doc.get("homeGymNotes") or doc.get("homeGym_notes"))

    # ── Coaching / Safety ────────────────────────────────────────────────────
    coaching_cues    : str = _bullet_list(doc.get("coachingCues"))
    common_mistakes  : str = _bullet_list(doc.get("commonMistakes"))
    contraindications: str = _bullet_list(doc.get("contraindications"))

    # ── Alternatives / Progressions ──────────────────────────────────────────
    alternatives: str = _join(doc.get("alternatives"))
    progressions: str = _join(doc.get("progressions"))
    regressions : str = _join(doc.get("regressions"))

    text: str = (
        f"Exercise Name:\n{name}\n\n"

        f"Category:\n{category}\n\n"

        f"Movement Pattern:\n{movement_pattern}\n\n"
        f"Movement Pattern Description:\n{movement_pattern_desc}\n\n"

        f"Difficulty:\n{level}\n\n"

        f"Equipment:\n{equipment}\n\n"

        f"Primary Muscles:\n{primary_muscles}\n\n"

        f"Secondary Muscles:\n{secondary_muscles}\n\n"

        f"Training Goals:\n{goal_tags}\n\n"

        f"Instructions:\n{instructions}\n\n"

        f"Tempo:\n{tempo}\n\n"

        f"Range Of Motion:\n{rom}\n\n"
        f"ROM Description:\n{rom_desc}\n\n"

        f"Fatigue:\n{fatigue}\n\n"
        f"Fatigue Description:\n{fatigue_desc}\n\n"

        f"Skill Requirement:\n{skill}\n\n"
        f"Skill Description:\n{skill_desc}\n\n"

        f"Home Gym Compatible:\n{home_gym}\n\n"
        f"Home Gym Notes:\n{home_gym_notes}\n\n"

        f"Coaching Cues:\n{coaching_cues}\n\n"

        f"Common Mistakes:\n{common_mistakes}\n\n"

        f"Contraindications:\n{contraindications}\n\n"

        f"Alternatives:\n{alternatives}\n\n"

        f"Progressions:\n{progressions}\n\n"

        f"Regressions:\n{regressions}"
    )

    return _normalise_document(text)


# ─────────────────────────────────────────────────────────────────────────────
# BATCH EMBEDDING GENERATION
# ─────────────────────────────────────────────────────────────────────────────

def generate_embeddings(
    model : SentenceTransformer,
    texts : list[str],
) -> list[list[float]]:
    """Generate normalised embeddings for a batch of texts in one forward pass.

    Args:
        model: Loaded SentenceTransformer model.
        texts: List of clean semantic document strings.

    Returns:
        List of embedding vectors (each a list of floats).
    """
    with torch.no_grad():
        vectors = model.encode(
            texts,
            batch_size=BATCH_SIZE,
            normalize_embeddings=True,
            convert_to_numpy=True,
            show_progress_bar=False,
        )
    return [v.tolist() for v in vectors]


# ─────────────────────────────────────────────────────────────────────────────
# BULK WRITE
# ─────────────────────────────────────────────────────────────────────────────

def bulk_update(
    collection : Collection,
    operations : list[UpdateOne],
    batch_num  : int,
    total_batches: int,
) -> int:
    """Execute a batch of UpdateOne operations via bulk_write.

    Args:
        collection: Target MongoDB collection.
        operations: List of UpdateOne operations to execute.
        batch_num: Current batch number (1-indexed) for logging.
        total_batches: Total number of batches for logging.

    Returns:
        Number of documents successfully modified.
    """
    if not operations:
        return 0
    print(f"  Batch {batch_num} / {total_batches} — Writing {len(operations)} vectors...")
    try:
        result = collection.bulk_write(operations, ordered=False)
        return result.modified_count
    except BulkWriteError as exc:
        print(f"  [WARN] Bulk write partial failure in batch {batch_num}: "
              f"{exc.details.get('writeErrors', [])}")
        return exc.details.get("nModified", 0)


# ─────────────────────────────────────────────────────────────────────────────
# FINAL VALIDATION
# ─────────────────────────────────────────────────────────────────────────────

def validate_completion(collection: Collection, expected: int) -> None:
    """Verify that the number of embedded documents matches the total.

    Queries MongoDB for documents that now have vector.embedding and
    prints a warning if there is a mismatch.

    Args:
        collection: Target MongoDB collection.
        expected: Total number of documents that should be embedded.
    """
    print("Validating completion...")
    actual: int = collection.count_documents({"vector.embedding": {"$exists": True}})
    if actual == expected:
        print(f"  [OK] All {expected} documents have embeddings.")
    else:
        print(f"\n  [WARNING] Embedding count mismatch!")
        print(f"  Expected : {expected}")
        print(f"  Actual   : {actual}")
        print(f"  Missing  : {expected - actual}")
        print("  Re-run the script to embed remaining documents.\n")


# ─────────────────────────────────────────────────────────────────────────────
# SUMMARY
# ─────────────────────────────────────────────────────────────────────────────

def print_summary(
    total_in_db   : int,
    already_done  : int,
    newly_embedded: int,
    skipped_errors: int,
    elapsed       : float,
) -> None:
    """Print the final embedding run summary to stdout.

    Args:
        total_in_db: Total documents in the collection.
        already_done: Documents skipped because embedding existed.
        newly_embedded: Documents successfully embedded this run.
        skipped_errors: Documents skipped due to processing errors.
        elapsed: Total elapsed time in seconds.
    """
    docs_per_sec   : float = newly_embedded / elapsed if elapsed > 0 else 0.0
    avg_latency_ms : float = (elapsed / newly_embedded * 1000) if newly_embedded > 0 else 0.0

    print("\n" + "=" * 44)
    print("  Embedding Summary")
    print("=" * 44)
    print(f"  Documents in database  : {total_in_db}")
    print(f"  Already embedded       : {already_done}")
    print(f"  New embeddings         : {newly_embedded}")
    print(f"  Skipped (errors)       : {skipped_errors}")
    print(f"  Elapsed time           : {elapsed:.2f}s")
    print(f"  Average docs/sec       : {docs_per_sec:.2f}")
    print(f"  Average latency        : {avg_latency_ms:.1f} ms/doc")
    print("=" * 44 + "\n")


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    """Entry point for the embedding generation pipeline.

    Parses CLI arguments, connects to MongoDB, loads the embedding model,
    iterates over documents in batches, generates embeddings in batch,
    and writes results back via bulk_write.
    """
    # ── CLI ──────────────────────────────────────────────────────────────────
    parser = argparse.ArgumentParser(
        description="FITNESS-RAG: Generate and store exercise embeddings."
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Regenerate embeddings even for documents that already have them.",
    )
    args  = parser.parse_args()
    force : bool = args.force

    # ── ENV ──────────────────────────────────────────────────────────────────
    load_dotenv()
    mongodb_uri     : str = os.getenv("MONGODB_URI", "")
    database_name   : str = os.getenv("DATABASE_NAME", "fitness_rag")
    collection_name : str = os.getenv("EXERCISES_COLLECTION", "exercises")

    if not mongodb_uri:
        print("[ERROR] MONGODB_URI is not set in .env")
        sys.exit(1)

    # ── SETUP ─────────────────────────────────────────────────────────────────
    start_time: float = time.time()
    print("\n" + "=" * 44)
    print("  FITNESS-RAG — Embedding Pipeline")
    print("=" * 44)
    print(f"  Model    : {MODEL_NAME}")
    print(f"  Version  : {PIPELINE_VERSION}")
    print(f"  Force    : {'Yes — regenerating all' if force else 'No — skipping existing'}")
    print(f"  Batch    : {BATCH_SIZE}")
    print(f"  Start    : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    collection : Collection          = connect(mongodb_uri, database_name, collection_name)
    model      : SentenceTransformer = load_model()

    # ── FETCH ─────────────────────────────────────────────────────────────────
    print("Fetching documents...")

    # Guard against partially-written documents (Priority 3):
    # A document may have the vector field but be missing the embedding array
    # if a previous run was interrupted mid-batch.
    if force:
        query_filter: dict = {}
    else:
        query_filter = {
            "$or": [
                {"vector": {"$exists": False}},
                {"vector.embedding": {"$exists": False}},
            ]
        }

    documents     : list[dict] = list(collection.find(query_filter))
    total_in_db   : int        = collection.count_documents({})
    already_done  : int        = total_in_db - len(documents)
    newly_embedded: int        = 0
    skipped_errors: int        = 0

    print(f"  Total in DB      : {total_in_db}")
    print(f"  Already embedded : {already_done}")
    print(f"  To process       : {len(documents)}\n")

    if not documents:
        print("  Nothing to do. All documents already embedded.")
        print("  Use --force to regenerate.\n")
        validate_completion(collection, total_in_db)
        print_summary(total_in_db, already_done, 0, 0, time.time() - start_time)
        return

    # ── BATCH PROCESSING ─────────────────────────────────────────────────────
    print("Generating embeddings...")

    total_batches : int = (len(documents) + BATCH_SIZE - 1) // BATCH_SIZE
    batch_num     : int = 0
    created_at    : str = (
        datetime.now(timezone.utc)
        .replace(microsecond=0)
        .isoformat()
    )

    for batch_start in tqdm(
        range(0, len(documents), BATCH_SIZE),
        total=total_batches,
        unit="batch",
        ncols=80,
    ):
        batch_num += 1
        batch_docs: list[dict] = documents[batch_start : batch_start + BATCH_SIZE]

        # ── Build semantic texts for this batch ──────────────────────────────
        texts      : list[str]  = []
        valid_docs : list[dict] = []

        for doc in batch_docs:
            try:
                texts.append(build_embedding_text(doc))
                valid_docs.append(doc)
            except Exception as exc:
                name: str = doc.get("name", str(doc.get("_id", "unknown")))
                print(f"\n  [WARN] Skipping '{name}' (text build): {exc}")
                skipped_errors += 1

        if not texts:
            continue

        # ── Generate all embeddings in one forward pass ───────────────────────
        try:
            vectors: list[list[float]] = generate_embeddings(model, texts)
        except Exception as exc:
            print(f"\n  [WARN] Batch {batch_num} embedding failed: {exc}")
            skipped_errors += len(texts)
            continue

        # ── Build bulk operations ─────────────────────────────────────────────
        operations: list[UpdateOne] = []
        for doc, text, vector in zip(valid_docs, texts, vectors):
            operations.append(
                UpdateOne(
                    {"_id": doc["_id"]},
                    {
                        "$set": {
                            "vector": {
                                "model"          : MODEL_NAME,
                                "pipelineVersion": PIPELINE_VERSION,
                                "dimension"      : DIMENSION,
                                "createdAt"      : created_at,
                                "text"           : text,
                                "embedding"      : vector,
                            }
                        }
                    },
                )
            )

        written        = bulk_update(collection, operations, batch_num, total_batches)
        newly_embedded += written

    # ── FINAL VALIDATION ──────────────────────────────────────────────────────
    elapsed: float = time.time() - start_time
    print(f"\n  End: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    validate_completion(collection, total_in_db)
    print_summary(total_in_db, already_done, newly_embedded, skipped_errors, elapsed)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n  [INTERRUPTED] Run cancelled. Partial results may have been written.")
        sys.exit(0)