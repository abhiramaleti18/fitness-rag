# Fitness RAG

An AI-powered fitness planning platform that combines a structured exercise knowledge base, scientific training guidelines, and Retrieval-Augmented Generation (RAG) to deliver safe, explainable, and personalized workout recommendations, plans, and split analysis.

The system is not just an exercise database — it's a knowledge-driven engine that reasons over exercises, muscles, constraints, and user context to generate coaching-quality output.

## Architecture

The project is split into three services plus a shared data/knowledge layer:

```
fitness-rag/
├── frontend/        React (Vite) single-page app
├── backend/
│   ├── express/     Node.js API gateway — auth, users, logs, splits
│   └── fastapi/     Python AI engine — vector search, RAG, plan generation
├── knowledge/        Curated JSON knowledge base (rules, constraints, progressions...)
├── data/              Processed exercise datasets and reports
├── docs/              Knowledge model & exercise ontology documentation
└── scripts/          Data pipeline: normalization, enrichment, embeddings, validation
```

**Request flow:** `Frontend (React)` → `Express Gateway (auth, users, persistence)` → `FastAPI AI Engine (vector search + LLM)` → `MongoDB Atlas (exercises, vector index, users, logs)`

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Recharts, Framer Motion, Axios |
| API Gateway | Node.js, Express 5, Mongoose, JWT auth, Helmet, Morgan |
| AI Engine | FastAPI, Python, MongoDB Atlas Vector Search |
| Embeddings | `BAAI/bge-base-en-v1.5` |
| LLM | NVIDIA NIM (`meta/llama-3.1-8b-instruct`) via NVIDIA API |
| Database | MongoDB Atlas |

## Features

- **Semantic exercise search** — vector search over an embedded exercise corpus rather than keyword matching
- **Personalized recommendations** — filtered by equipment access, experience level, fitness goals, and injuries/constraints
- **AI-generated workout plans** — day-by-day plans built from user queries (e.g. "4-day split, home gym, no pull-up bar")
- **Mobility & stretch retrieval** — dedicated search over a mobility/warm-up knowledge base
- **Split analysis** — evaluates muscle group coverage and movement-pattern balance for a user-built split, with an LLM-generated report
- **Workout logging & progress tracking** — personal records, consistency tracking, and progressive-overload suggestions
- **JWT-based authentication** — register/login/profile flows via the Express gateway

## API Overview

### Express Gateway (`/api`)

| Route | Description |
|---|---|
| `POST /api/auth/register`, `/login`, `GET /api/auth/me` | Authentication |
| `POST /api/ai/search`, `/recommend`, `/plan` | Proxies to the FastAPI AI engine |
| `GET /api/ai/exercises`, `/exercise/:id` | Exercise catalog |
| `PUT /api/profile`, `POST /api/profile/records` | User profile & PRs |
| `GET/POST/PUT/DELETE /api/logs` | Workout logs, progress, consistency |
| `GET/POST/PUT/DELETE /api/splits` | Custom workout splits |

### FastAPI AI Engine (`/api`)

| Route | Description |
|---|---|
| `GET /api/health` | Service + DB health check |
| `POST /api/search` | Raw vector search over exercises |
| `POST /api/recommend` | RAG-based recommendation with LLM answer |
| `POST /api/plan` | Full multi-day workout plan generation |
| `POST /api/analyze-split` | Muscle coverage / balance analysis of a split |
| `GET /api/exercises`, `/exercise/{id}` | Exercise catalog queries |

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- Python 3.10+
- MongoDB Atlas cluster with a Vector Search index configured
- An NVIDIA API key (for LLM completions via NVIDIA NIM)

### 1. Environment variables

Create a `.env` file at the project root (shared by both backend services):

```env
# MongoDB
MONGODB_URI=your_mongodb_atlas_uri
MONGO_DB_NAME=fitness_rag
EXPRESS_MONGO_URI=your_mongodb_atlas_uri

# NVIDIA LLM
NVIDIA_API_KEY=your_nvidia_api_key

# Express
PORT=4000
JWT_SECRET=your_jwt_secret

# CORS
FRONTEND_ORIGIN=http://localhost:5173
```

### 2. Data & knowledge pipeline (one-time setup)

From `scripts/`:

```bash
pip install -r requirements.txt   # if present, otherwise install deps used by the scripts
python normalize.py               # normalize raw exercise data
python enrich_dataset.py          # enrich with knowledge base tags
python validate_dataset.py        # validate the processed dataset
python import_to_mongodb.py       # load into MongoDB Atlas
python generate_embeddings.py     # generate vector embeddings for search
```

### 3. FastAPI AI engine

```bash
cd backend/fastapi
pip install -r requirements.txt   # if present
uvicorn app.main:app --reload --port 8000
```

### 4. Express gateway

```bash
cd backend/express
npm install
npm run dev
```

### 5. Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`, proxying through the Express gateway (`:4000`) to the FastAPI AI engine (`:8000`).

## Knowledge Base

The `knowledge/` directory contains curated, hand-maintained JSON files that ground the RAG pipeline in scientific and practical training knowledge, including:

- `muscles.json`, `movement_patterns.json` — exercise taxonomy
- `progression.json`, `regressions.json` — exercise scaling
- `rep_ranges.json`, `set_ranges.json`, `rest_periods.json` — programming parameters
- `training_goals.json`, `coaching_rules.json` — goal-driven coaching logic
- `constraints.json`, `contraindications.json` — injury/limitation handling
- `warmups/`, `mobility/` — warm-up and stretching library

See `docs/knowledge_model.md` and `docs/exercise_ontology.md` for the full conceptual model.

## Project Status

This is an actively evolving project. Contributions and issues are welcome.

## License

No license specified yet.
