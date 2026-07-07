from app.core.database import exercises_collection

print("--- Bench Press matches ---")
for d in exercises_collection.find({"name": {"$regex": "bench press", "$options": "i"}}, {"_id": 0, "name": 1, "level": 1}):
    print(d["name"], "-", d.get("level"))

print("\n--- Pull-up matches ---")
for d in exercises_collection.find({"name": {"$regex": "pull", "$options": "i"}}, {"_id": 0, "name": 1, "level": 1}):
    print(d["name"], "-", d.get("level"))