"""
migrate_expert_to_advanced.py
One-time data fix: relabels any exercise documents with level "EXPERT"
(or "expert") to "ADVANCED", so the app only ever shows Beginner /
Intermediate / Advanced.

Run once from the backend/fastapi directory (same env as the app, so
MONGO_URI / MONGO_DB_NAME are already configured):

    python migrate_expert_to_advanced.py
"""

from app.core.database import exercises_collection

def main():
    # Handle both cases in case any documents were inserted inconsistently
    result = exercises_collection.update_many(
        {"level": {"$in": ["EXPERT", "expert"]}},
        {"$set": {"level": "ADVANCED"}}
    )
    print(f"Matched {result.matched_count} documents, modified {result.modified_count}.")

    remaining = exercises_collection.count_documents({"level": {"$in": ["EXPERT", "expert"]}})
    print(f"Remaining EXPERT-level documents: {remaining}")

if __name__ == "__main__":
    main()