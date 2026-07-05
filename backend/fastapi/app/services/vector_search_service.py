from sentence_transformers import SentenceTransformer
from app.core.database import exercises_collection
from app.core.config import settings

# Load embedding model once at startup (expensive to reload per request)
_model = SentenceTransformer(settings.EMBEDDING_MODEL)


def generate_query_embedding(query: str) -> list[float]:
    """Convert a user's natural language query into a 768-dim embedding vector."""
    embedding = _model.encode(query, normalize_embeddings=True)
    return embedding.tolist()


def vector_search(query: str, top_k: int = None, equipment_filter: list[str] = None) -> list[dict]:
    if top_k is None:
        top_k = settings.TOP_K

    query_vector = generate_query_embedding(query)

    # Over-fetch so post-filtering by equipment still leaves enough results
    fetch_limit = top_k * 6 if equipment_filter else top_k

    pipeline = [
        {
            "$vectorSearch": {
                "index": settings.VECTOR_INDEX_NAME,
                "path": settings.VECTOR_PATH,
                "queryVector": query_vector,
                "numCandidates": fetch_limit * 10,
                "limit": fetch_limit
            }
        },
        {
            "$project": {
                "_id": 0, "id": 1, "name": 1, "category": 1, "equipment": 1, "level": 1,
                "movementPattern": 1, "primaryMuscles": 1, "secondaryMuscles": 1, "goalTags": 1,
                "instructions": 1, "coachingCues": 1, "commonMistakes": 1, "contraindications": 1,
                "homeGymCompatible": 1, "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]

    results = list(exercises_collection.aggregate(pipeline))

    if equipment_filter:
        allowed = {e.upper() for e in equipment_filter}
        results = [r for r in results if r.get("equipment", "").upper() in allowed]

    return results[:top_k]