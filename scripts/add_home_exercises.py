"""
add_home_exercises.py
----------------------
Inserts the new home-workout bodyweight exercises into MongoDB WITHOUT
touching or deleting any existing documents (unlike import_to_mongodb.py,
which wipes the whole collection).

Place this file in your `scripts/` folder, and place `home_exercises_v1.json`
in `data/processed/` alongside `exercises_v1.json`.

Usage:
    python scripts/add_home_exercises.py
"""

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, PyMongoError

ROOT = Path(__file__).resolve().parents[1]
DATASET = ROOT / "data" / "processed" / "home_exercises_v1.json"

load_dotenv(ROOT / ".env")

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "fitness_rag")
COLLECTION_NAME = os.getenv("EXERCISES_COLLECTION", "exercises")


def main():
    if not DATASET.exists():
        print(f"[ERROR] Dataset not found: {DATASET}")
        sys.exit(1)

    if not MONGODB_URI:
        print("[ERROR] MONGODB_URI not found in .env")
        sys.exit(1)

    with open(DATASET, "r", encoding="utf-8") as f:
        new_exercises = json.load(f)

    print(f"Loaded {len(new_exercises)} new home exercises.")

    try:
        client = MongoClient(MONGODB_URI)
        client.admin.command("ping")
        collection = client[DATABASE_NAME][COLLECTION_NAME]
        print("Connected to MongoDB Atlas.")
    except ConnectionFailure as exc:
        print(f"[ERROR] Connection failed: {exc}")
        sys.exit(1)

    existing_ids = set(collection.distinct("id"))
    to_insert = [e for e in new_exercises if e["id"] not in existing_ids]
    skipped = len(new_exercises) - len(to_insert)

    if not to_insert:
        print("Nothing to insert — all exercises already exist in the DB.")
        return

    try:
        result = collection.insert_many(to_insert)
        print(f"Inserted {len(result.inserted_ids)} new exercises.")
        if skipped:
            print(f"Skipped {skipped} that already existed (matched by id).")
    except PyMongoError as exc:
        print(f"[ERROR] Insert failed: {exc}")
        sys.exit(1)

    print(f"\nTotal documents in collection now: {collection.count_documents({})}")
    print("Next step: run `python scripts/generate_embeddings.py` to embed the new documents.")


if __name__ == "__main__":
    main()