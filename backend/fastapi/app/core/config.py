import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[4]
load_dotenv(dotenv_path=ROOT_DIR / ".env")

class Settings:
    MONGO_URI: str = os.getenv("MONGODB_URI")
    MONGO_DB_NAME: str = os.getenv("MONGO_DB_NAME", "fitness_rag")
    NVIDIA_API_KEY: str = os.getenv("NVIDIA_API_KEY")
    NVIDIA_BASE_URL: str = "https://integrate.api.nvidia.com/v1"
    LLM_MODEL: str = "meta/llama-3.1-8b-instruct"
    EMBEDDING_MODEL: str = "BAAI/bge-base-en-v1.5"
    VECTOR_INDEX_NAME: str = "exercise_vector_index"
    VECTOR_PATH: str = "vector.embedding"
    TOP_K: int = 5

settings = Settings()