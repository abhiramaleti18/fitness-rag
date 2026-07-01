"""
FITNESS-RAG
Import Dataset v1 into MongoDB Atlas

Reads:
    data/processed/exercises_v1.json

Writes:
    MongoDB Atlas -> fitness_rag.exercises
"""

import json
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, PyMongoError
from tqdm import tqdm

# --------------------------------------------------
# Paths
# --------------------------------------------------

ROOT = Path(__file__).resolve().parents[1]

DATASET = ROOT / "data" / "processed" / "exercises_v1.json"

# --------------------------------------------------
# Environment
# --------------------------------------------------

load_dotenv(ROOT / ".env")

MONGODB_URI = os.getenv("MONGODB_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME", "fitness_rag")
COLLECTION_NAME = os.getenv("EXERCISES_COLLECTION", "exercises")

# --------------------------------------------------
# Helpers
# --------------------------------------------------

def load_dataset():
    if not DATASET.exists():
        raise FileNotFoundError(f"Dataset not found:\n{DATASET}")

    with open(DATASET, "r", encoding="utf-8") as f:
        return json.load(f)


def connect():
    if not MONGODB_URI:
        raise RuntimeError("MONGODB_URI not found in .env")

    client = MongoClient(MONGODB_URI)

    # Verify connection
    client.admin.command("ping")

    return client


# --------------------------------------------------
# Main
# --------------------------------------------------

def main():

    print("=" * 60)
    print("FITNESS-RAG - MongoDB Import")
    print("=" * 60)

    try:

        print("\nConnecting to MongoDB Atlas...")

        client = connect()

        print(" Connected successfully")

        db = client[DATABASE_NAME]
        collection = db[COLLECTION_NAME]

        print("\nLoading dataset...")

        exercises = load_dataset()

        print(f" Loaded {len(exercises)} exercises")

        print("\nClearing existing collection...")

        deleted = collection.delete_many({}).deleted_count

        print(f" Removed {deleted} existing documents")

        print("\nImporting exercises...")

        documents = []

        ids = set()

        for exercise in tqdm(exercises):

            if exercise["id"] in ids:
                print(f"Duplicate id skipped: {exercise['id']}")
                continue

            ids.add(exercise["id"])

            documents.append(exercise)

        result = collection.insert_many(documents)

        print("\nVerifying import...")

        db_count = collection.count_documents({})

        print()

        print("=" * 60)
        print("IMPORT SUMMARY")
        print("=" * 60)

        print(f"Documents Inserted : {len(result.inserted_ids)}")
        print(f"Documents In DB    : {db_count}")

        if db_count != len(exercises):
            print("\nWARNING")
            print("Document count mismatch!")

        else:
            print("\n Dataset imported successfully.")

        print()

        sample = collection.find_one(
            {},
            {
                "_id": 0,
                "name": 1,
                "movementPattern": 1,
                "goalTags": 1,
                "tempo": 1,
            },
        )

        print("Sample document:\n")
        print(json.dumps(sample, indent=2))

        print("\nDone.")

    except FileNotFoundError as e:
        print(e)

    except ConnectionFailure:
        print("Failed to connect to MongoDB Atlas.")

    except PyMongoError as e:
        print("MongoDB Error:")
        print(e)

    except Exception as e:
        print("Unexpected Error:")
        print(e)

        sys.exit(1)


if __name__ == "__main__":
    main()