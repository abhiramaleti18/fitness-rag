from sentence_transformers import SentenceTransformer
from app.core.database import exercises_collection
from app.core.config import settings

# Load embedding model once at startup (expensive to reload per request)
_model = SentenceTransformer(settings.EMBEDDING_MODEL)


def generate_query_embedding(query: str) -> list[float]:
    """Convert a user's natural language query into a 768-dim embedding vector."""
    embedding = _model.encode(query, normalize_embeddings=True)
    return embedding.tolist()


def vector_search(query: str, top_k: int = None) -> list[dict]:
    """Run MongoDB Atlas Vector Search and return top K matching exercises."""
    if top_k is None:
        top_k = settings.TOP_K

    query_vector = generate_query_embedding(query)

    pipeline = [
        {
            "$vectorSearch": {
                "index": settings.VECTOR_INDEX_NAME,
                "path": settings.VECTOR_PATH,
                "queryVector": query_vector,
                "numCandidates": top_k * 10,
                "limit": top_k
            }
        },
        {
            "$project": {
                "_id": 0,
                "id": 1,
                "name": 1,
                "category": 1,
                "equipment": 1,
                "level": 1,
                "movementPattern": 1,
                "primaryMuscles": 1,
                "secondaryMuscles": 1,
                "goalTags": 1,
                "instructions": 1,
                "coachingCues": 1,
                "commonMistakes": 1,
                "contraindications": 1,
                "homeGymCompatible": 1,
                "score": {"$meta": "vectorSearchScore"}
            }
        }
    ]

    results = list(exercises_collection.aggregate(pipeline))
    return results