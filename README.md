# 📄 Resumify — AI Resume Parser & Intelligent Job Matcher

[![Live Demo](https://img.shields.io/badge/Live%20Demo-resumify--eosin.vercel.app-7c3aed?style=for-the-badge&logo=vercel&logoColor=white)](https://resumify-eosin.vercel.app/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React%2018-TypeScript-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Groq AI](https://img.shields.io/badge/Groq%20LPU-Ultra--Fast%20Inference-f55036?style=for-the-badge&logo=groq&logoColor=white)](https://groq.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

> **Resumify** is a production-ready, full-stack AI platform that automates resume screening and candidate evaluation. Powered by Groq's high-speed inference engine, it extracts structured profiles from multi-format resumes (PDF, DOCX) and scores candidates against job descriptions with deep skill gap analysis, experience verification, and side-by-side comparisons.

🔗 **Production Web App:** [https://resumify-eosin.vercel.app/](https://resumify-eosin.vercel.app/)

---

## 🌟 Key Features

* **⚡ Ultra-Fast AI Parsing**: Powered by Groq LLMs (`openai/gpt-oss-20b`, `llama-3.3-70b-versatile`) with semaphore-managed concurrency control and automatic model fallback.
* **📂 Multi-Format Resume Upload**: Supports drag-and-drop ingestion of **PDF** and **DOCX** files with in-memory parsing (no unnecessary disk writes).
* **🎯 Comprehensive Fit Analysis**:
  * **Weighted Match Score (0–100%)** combining required skills, preferred bonuses, and experience alignment.
  * **Skills Breakdown**: Explicit identification of matching skills vs. critical skill gaps.
  * **Experience Met**: Automatically compares candidate years of experience against minimum job requirements.
  * **AI Executive Verdict**: Clear, contextual summary explaining why the candidate is or isn't a fit.
* **👥 Side-by-Side Candidate Comparison**: Select 2 or more candidates to compare metrics in an interactive modal table.
* **🔍 Search & Filter**: Filter candidates dynamically by name, specific skill tags, or minimum score thresholds (e.g. 80+, 60+).
* **📥 CSV Export**: One-click export of evaluated and ranked candidates for external recruitment workflows.
* **🚀 Instant Public Demos**:
  * **Job Seeker Demo**: Upload your resume and compare against any job description without signing up.
  * **HR Demo**: Upload batches of resumes to evaluate an entire hiring pipeline in seconds.
* **🔐 Secure Authentication**: JWT-based user authentication (`bcrypt`, `python-jose`) with role-based access for recruiter dashboards.
* **🗄️ Flexible Dual Database Architecture**: Runs on local **SQLite** (`aiosqlite`) for zero-setup local dev, and **Supabase PostgreSQL** (`asyncpg`) with connection pooling for production.

---

## 🏗️ System Architecture

```
                                  ┌─────────────────────────────┐
                                  │       Vercel (Edge)         │
                                  │   React 18 + Vite + TS      │
                                  │      Tailwind CSS v4        │
                                  └──────────────┬──────────────┘
                                                 │
                                                 │ HTTPS / REST (JSON)
                                                 ▼
                                  ┌─────────────────────────────┐
                                  │       Render (Cloud)        │
                                  │      FastAPI (Python)       │
                                  │  uvicorn async web service  │
                                  └──────┬───────────────┬──────┘
                                         │               │
                     Async Semaphore API │               │ Asyncpg Pooler
                                         ▼               ▼
                       ┌───────────────────┐   ┌───────────────────┐
                       │      Groq AI      │   │     Supabase      │
                       │  LPU Acceleration │   │    PostgreSQL     │
                       └───────────────────┘   └───────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
* **Core:** React 18, TypeScript, Vite
* **Styling:** Tailwind CSS v4, custom dark-mesh glassmorphic design system
* **Icons:** Lucide React
* **HTTP Client:** Axios (with request interceptors for JWT)
* **Routing:** React Router DOM v7 (with Vercel SPA rewrites)
* **Deployment:** [Vercel](https://vercel.com/)

### Backend
* **Framework:** FastAPI (Python 3.11+)
* **Server:** Uvicorn ASGI
* **ORM:** SQLAlchemy 2.0 (Full `asyncio` extension)
* **Drivers:** `asyncpg` (PostgreSQL / Supabase) & `aiosqlite` (SQLite)
* **Text Extraction:** `pypdf`, `python-docx`
* **Validation:** Pydantic v2
* **Security:** `passlib`, `bcrypt`, `python-jose`
* **Deployment:** [Render](https://render.com/)

### AI & Data
* **Inference Engine:** [Groq Cloud](https://groq.com/) (LLaMA 3.3 / GPT-OSS models)
* **Database:** [Supabase](https://supabase.com/) Managed PostgreSQL

---

## 📁 Repository Structure

```text
Resumify/
├── backend/                  # FastAPI Application
│   ├── auth/                 # JWT security, password hashing, dependencies
│   ├── database/             # SQLAlchemy connection & models (users, jobs, resumes, match)
│   ├── routers/              # API endpoints (auth, jobs, resumes, match, demo)
│   ├── schemas/              # Pydantic v2 request & response schemas
│   ├── services/             # Groq AI service, text extractors, matching engine
│   ├── config.py             # App configuration & environment loader
│   ├── main.py               # FastAPI entrypoint, lifespan, CORS & router registration
│   ├── requirements.txt      # Python dependencies
│   └── run.bat               # Windows local backend startup script
├── frontend/                 # React + Vite Frontend
│   ├── src/
│   │   ├── api/              # Axios client & typed API SDK
│   │   ├── components/       # UI components (Uploader, CandidateCard, Modals, Navbar, Footer)
│   │   ├── context/          # React AuthContext
│   │   ├── pages/            # LandingPage, Dashboard, LoginPage, RegisterPage, Demos
│   │   └── types/            # TypeScript interfaces
│   ├── package.json          # Node dependencies & build scripts
│   ├── vercel.json           # SPA rewrites configuration for Vercel
│   └── vite.config.ts        # Vite build configuration
├── run-all.bat               # Single script to launch backend & frontend locally
└── README.md
```

---

## ⚡ Quickstart (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/jai2826/Resumify.git
cd Resumify
```

### 2. Backend Setup
```bash
cd backend

# Create & activate a virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env   # Or create .env with variables listed below

# Start the development server
uvicorn main:app --reload --port 8000
```
API Documentation will be live at: [http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend will be running at: [http://localhost:5173](http://localhost:5173)

---

## 🔐 Environment Variables

### Backend (`backend/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `GROQ_API_KEY` | Groq Cloud API Key | `gsk_...` |
| `GROQ_MODEL` | Default LLM model | `openai/gpt-oss-20b` or `llama-3.3-70b-versatile` |
| `DATABASE_URL` | DB Connection URL | `sqlite+aiosqlite:///./resumify.db` or Supabase URI |
| `JWT_SECRET_KEY` | Secret key for signing tokens | High-entropy random string |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry duration | `60` |
| `CORS_ORIGINS` | Allowed frontend origins | `http://localhost:5173,https://resumify-eosin.vercel.app` |
| `MAX_CONCURRENT_REQUESTS` | Concurrency limit for Groq AI | `3` |

### Frontend (`frontend/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Root URL for the backend API | `http://localhost:8000/api` (Local)<br>`https://<your-backend>.onrender.com/api` (Production) |

---

## 🌐 API Reference Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Healthcheck and active database status |
| `POST` | `/api/demo/match-single` | Public | Instant 1:1 resume & job match evaluation |
| `POST` | `/api/demo/match-multiple`| Public | Batch resume match against job text |
| `POST` | `/api/auth/register` | Public | Register new recruiter / user account |
| `POST` | `/api/auth/login` | Public | Login and obtain JWT bearer token |
| `GET` | `/api/auth/me` | Authenticated | Fetch current user profile |
| `POST` | `/api/jobs/` | Authenticated | Create a structured Job Description |
| `GET` | `/api/jobs/` | Authenticated | List all jobs for the authenticated user |
| `POST` | `/api/resumes/upload` | Authenticated | Multi-file resume upload and AI parsing |
| `GET` | `/api/resumes/` | Authenticated | List candidate profiles |
| `POST` | `/api/match/evaluate` | Authenticated | Run AI fit evaluation for a job & candidates |
| `GET` | `/api/match/{job_id}/export`| Authenticated | Download ranked candidate evaluation CSV |

---

## 🚢 Deployment Guide

### Deploying Backend to Render
1. Create a **New Web Service** connected to your repository.
2. Set **Root Directory** to `backend`.
3. Set **Runtime** to `Python 3`.
4. **Build Command:** `pip install -r requirements.txt`
5. **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Supply the environment variables (`GROQ_API_KEY`, `DATABASE_URL`, `CORS_ORIGINS`, etc.).

### Deploying Frontend to Vercel
1. Create a **New Project** connected to your repository.
2. Set **Root Directory** to `frontend`.
3. Set **Framework Preset** to `Vite`.
4. Add environment variable:
   * `VITE_API_BASE_URL`: `https://<your-render-service>.onrender.com/api`
5. Click **Deploy**. (The included `vercel.json` ensures full SPA client-side routing support).

---

## 📄 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute it for personal or commercial projects.
