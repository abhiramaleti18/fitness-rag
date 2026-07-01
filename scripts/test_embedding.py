from sentence_transformers import SentenceTransformer

print("Loading model...")

model = SentenceTransformer("BAAI/bge-base-en-v1.5")

print("Model loaded!")

embedding = model.encode(
    "Barbell Bench Press is a chest exercise.",
    normalize_embeddings=True
)

print(f"Embedding dimension: {len(embedding)}")