"""
test_vector_search.py
----------------------
FITNESS-RAG — Phase 7: Vector Search Test

Accepts a natural language query, generates a normalized embedding using
BAAI/bge-base-en-v1.5, queries MongoDB Atlas Vector Search, and displays
the most semantically relevant exercises.

Usage:
    python scripts/test_vector_search.py
    python scripts/test_vector_search.py --query "beginner dumbbell chest exercise"
    python scripts/test_vector_search.py --query "glute exercise at home" --limit 5
"""

import argparse
import os
import sys
import time
from typing import Any

import torch
from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.collection import Collection
from pymongo.errors import ConnectionFailure, OperationFailure
from sentence_transformers import SentenceTransformer

# ─────────────────────────────────────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────────────────────────────────────

MODEL_NAME   : str = "BAAI/bge-base-en-v1.5"
INDEX_NAME   : str = "exercise_vector_index"
DIVIDER      : str = "=" * 44
SEPARATOR    : str = "-" * 44
DEFAULT_LIMIT: int = 10


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
        print(f"  [OK] Connected — {db_name}.{collection_name} ({count} documents)\n")
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
    print(f"Loading embedding model ({MODEL_NAME})...")
    try:
        model: SentenceTransformer = SentenceTransformer(MODEL_NAME)
        print("  [OK] Model ready\n")
        return model
    except Exception as exc:
        print(f"  [ERROR] Failed to load model: {exc}")
        sys.exit(1)


# ─────────────────────────────────────────────────────────────────────────────
# EMBEDDING
# ─────────────────────────────────────────────────────────────────────────────

def generate_query_embedding(model: SentenceTransformer, query: str) -> list[float]:
    """Generate a single normalized embedding for the search query.

    Inference is wrapped in torch.no_grad() to reduce memory usage
    and skip unnecessary gradient computation.

    Args:
        model: Loaded SentenceTransformer model.
        query: Natural language search query from the user.

    Returns:
        Normalized embedding vector as a list of floats.

    Raises:
        SystemExit: If embedding generation fails.
    """
    try:
        with torch.no_grad():
            vector = model.encode(
                query,
                normalize_embeddings=True,
                show_progress_bar=False,
            )
        return vector.tolist()
    except Exception as exc:
        print(f"  [ERROR] Embedding generation failed: {exc}")
        sys.exit(1)


# ─────────────────────────────────────────────────────────────────────────────
# SEARCH
# ─────────────────────────────────────────────────────────────────────────────

def search(
    collection: Collection,
    embedding : list[float],
    limit     : int,
) -> list[dict[str, Any]]:
    """Run an Atlas Vector Search aggregation and return ranked results.

    Uses the $vectorSearch aggregation stage with numCandidates set to
    10× the requested limit (minimum 100) for a good recall/latency balance.
    Results are pre-sorted by Atlas; no client-side sorting is applied.

    Args:
        collection: Target MongoDB collection with vector.embedding fields.
        embedding: Normalized query embedding vector.
        limit: Maximum number of results to return.

    Returns:
        List of result documents with name, category, movement pattern,
        equipment, level, goal tags, and similarity score.

    Raises:
        SystemExit: If the vector search index is missing or the query fails.
    """
    num_candidates: int = max(100, limit * 10)

    pipeline: list[dict] = [
        {
            "$vectorSearch": {
                "index"        : INDEX_NAME,
                "path"         : "vector.embedding",
                "queryVector"  : embedding,
                "numCandidates": num_candidates,
                "limit"        : limit,
            }
        },
        {
            "$project": {
                "_id"           : 0,
                "name"          : 1,
                "category"      : 1,
                "movementPattern": 1,
                "equipment"     : 1,
                "level"         : 1,
                "goalTags"      : 1,
                "score"         : {"$meta": "vectorSearchScore"},
            }
        },
    ]

    try:
        results: list[dict] = list(collection.aggregate(pipeline))
        return results
    except OperationFailure as exc:
        if "index" in str(exc).lower() or "vectorSearch" in str(exc):
            print(f"\n  [ERROR] Atlas Vector Search index not found or not ready.")
            print(f"  Make sure the index '{INDEX_NAME}' exists on the 'vector.embedding' path.")
            print(f"  Details: {exc}")
        else:
            print(f"\n  [ERROR] Search query failed: {exc}")
        sys.exit(1)
    except Exception as exc:
        print(f"\n  [ERROR] Unexpected search error: {exc}")
        sys.exit(1)


# ─────────────────────────────────────────────────────────────────────────────
# DISPLAY
# ─────────────────────────────────────────────────────────────────────────────

def print_results(query: str, results: list[dict[str, Any]]) -> None:
    """Print vector search results to stdout in a readable format.

    Each result is displayed with its rank, similarity score, and key
    metadata fields. Results are printed in the order returned by Atlas
    (highest similarity first).

    Args:
        query: The original natural language query string.
        results: List of result documents from the search pipeline.
    """
    print(DIVIDER)
    print("  FITNESS-RAG VECTOR SEARCH")
    print(DIVIDER)
    print()
    print("  Query")
    print(f"  {query}")
    print()
    print(DIVIDER)
    print("  Top Matches")
    print(DIVIDER)

    if not results:
        print("\n  No results found for this query.")
        print("  Try a different search term.\n")
        return

    for rank, result in enumerate(results, start=1):
        name            : str   = result.get("name", "Unknown")
        category        : str   = result.get("category", "Unknown")
        movement_pattern: str   = result.get("movementPattern", "Unknown")
        equipment       : str   = result.get("equipment", "Unknown")
        level           : str   = result.get("level", "Unknown")
        score           : float = result.get("score", 0.0)

        goal_tags_raw: Any = result.get("goalTags", [])
        if isinstance(goal_tags_raw, list) and goal_tags_raw:
            goals: str = "\n    ".join(str(g) for g in goal_tags_raw)
        else:
            goals = "Unknown"

        print()
        print(f"  {rank}.")
        print()
        print(f"  Name:")
        print(f"  {name}")
        print()
        print(f"  Similarity:")
        print(f"  {score:.4f}")
        print()
        print(f"  Category:")
        print(f"  {category}")
        print()
        print(f"  Movement Pattern:")
        print(f"  {movement_pattern}")
        print()
        print(f"  Equipment:")
        print(f"  {equipment}")
        print()
        print(f"  Difficulty:")
        print(f"  {level}")
        print()
        print(f"  Goals:")
        print(f"  {goals}")
        print()
        print(SEPARATOR)


def print_summary(
    query  : str,
    count  : int,
    elapsed: float,
) -> None:
    """Print the search run summary.

    Args:
        query: The original search query.
        count: Number of results returned.
        elapsed: Total elapsed time in seconds.
    """
    print()
    print(DIVIDER)
    print("  Search Complete")
    print(DIVIDER)
    print(f"  Query          : {query}")
    print(f"  Results        : {count}")
    print(f"  Elapsed time   : {elapsed:.3f}s")
    print(f"  Avg search time: {elapsed:.3f}s")
    print(DIVIDER)
    print()


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    """Entry point for the vector search test script.

    Parses CLI arguments or prompts interactively for a query, generates
    an embedding, runs Atlas Vector Search, and displays ranked results.
    """
    # ── CLI ──────────────────────────────────────────────────────────────────
    parser = argparse.ArgumentParser(
        description="FITNESS-RAG: Test Atlas Vector Search with a natural language query."
    )
    parser.add_argument(
        "--query",
        type=str,
        default=None,
        help="Natural language search query (prompted interactively if omitted).",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=DEFAULT_LIMIT,
        help=f"Number of results to return (default: {DEFAULT_LIMIT}).",
    )
    args = parser.parse_args()

    # ── ENV ──────────────────────────────────────────────────────────────────
    load_dotenv()
    mongodb_uri     : str = os.getenv("MONGODB_URI", "")
    database_name   : str = os.getenv("DATABASE_NAME", "fitness_rag")
    collection_name : str = os.getenv("EXERCISES_COLLECTION", "exercises")

    if not mongodb_uri:
        print("[ERROR] MONGODB_URI is not set in .env")
        sys.exit(1)

    # ── QUERY INPUT ───────────────────────────────────────────────────────────
    query: str = args.query or ""
    if not query:
        print()
        try:
            query = input("Enter search query: ").strip()
        except (EOFError, KeyboardInterrupt):
            print("\n  [CANCELLED]")
            sys.exit(0)

    if not query:
        print("[ERROR] Query cannot be empty.")
        sys.exit(1)

    limit: int = max(1, args.limit)

    # ── SETUP ─────────────────────────────────────────────────────────────────
    print()
    collection : Collection          = connect(mongodb_uri, database_name, collection_name)
    model      : SentenceTransformer = load_model()

    # ── SEARCH ────────────────────────────────────────────────────────────────
    start_time: float = time.time()

    embedding : list[float]        = generate_query_embedding(model, query)
    results   : list[dict[str, Any]] = search(collection, embedding, limit)

    elapsed: float = time.time() - start_time

    # ── OUTPUT ────────────────────────────────────────────────────────────────
    print_results(query, results)
    print_summary(query, len(results), elapsed)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n  [INTERRUPTED] Search cancelled.")
        sys.exit(0)