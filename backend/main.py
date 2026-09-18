import uvicorn
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database.connection import init_db
from routers import auth, jobs, resumes, match, demo

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle manager."""
    # Startup
    logger.info("Initializing database...")
    await init_db()
    logger.info("Database initialized successfully.")
    
    if not settings.groq_api_key:
        logger.warning("GROQ_API_KEY is not set! AI features will not work.")
    else:
        logger.info(f"Groq AI Service initialized with model: {settings.groq_model}")
    
    yield
    
    # Shutdown
    logger.info("Application shutting down.")

app = FastAPI(
    title="Resumify - AI Resume Parser & Job Matcher API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api")
app.include_router(jobs.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(match.router, prefix="/api")
app.include_router(demo.router, prefix="/api")

@app.get("/api/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "groq_configured": bool(settings.groq_api_key),
        "model": settings.groq_model,
        "database": "postgresql" if "postgres" in settings.database_url else "sqlite"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
