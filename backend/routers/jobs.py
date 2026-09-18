from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.repository import JobRepository
from database.models import UserDB
from schemas.models import JobCreateRequest, JobD
from services.ai_service import ai_service
from auth.dependencies import get_current_user

router = APIRouter(prefix="/jobs", tags=["Jobs"])

@router.post("/", response_model=JobD, status_code=status.HTTP_201_CREATED)
async def create_job_description(
    payload: JobCreateRequest,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Parses raw job description text via Groq LLM and saves it to DB."""
    if not payload.raw_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description text cannot be empty."
        )
    try:
        job = await ai_service.parse_job_description(payload.raw_text, title=payload.title)
        job_data = job.model_dump()
        job_data["user_id"] = current_user.id
        
        job_db = await JobRepository.create(db, job_data)
        job.id = job_db.id
        return job
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse job description: {str(e)}"
        )

@router.get("/", response_model=List[JobD])
async def list_jobs(
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Returns all created job descriptions for the current user."""
    jobs_db = await JobRepository.list_by_user(db, current_user.id)
    jobs = []
    for j in jobs_db:
        jobs.append(JobD(
            id=j.id,
            title=j.title,
            role=j.role,
            required_skills=j.required_skills or [],
            preferred_skills=j.preferred_skills or [],
            minimum_experience=j.minimum_experience,
            education_requirements=j.education_requirements or [],
            responsibilities=j.responsibilities or [],
            created_at=j.created_at,
            scoring_weights=j.scoring_weights
        ))
    return jobs

@router.get("/{job_id}", response_model=JobD)
async def get_job(
    job_id: str,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetches a specific job description by ID if owned by current user."""
    j = await JobRepository.get(db, job_id, current_user.id)
    if not j:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID '{job_id}' not found."
        )
    return JobD(
        id=j.id,
        title=j.title,
        role=j.role,
        required_skills=j.required_skills or [],
        preferred_skills=j.preferred_skills or [],
        minimum_experience=j.minimum_experience,
        education_requirements=j.education_requirements or [],
        responsibilities=j.responsibilities or [],
        created_at=j.created_at,
        scoring_weights=j.scoring_weights
    )
