import asyncio
import logging
from typing import List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from schemas.models import MatchResult, MatchResponse
from services.extractor import extract_text_from_file
from services.ai_service import ai_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/demo", tags=["Demo"])

@router.post("/match-single", response_model=MatchResult)
async def demo_match_single(
    job_text: str = Form(...),
    file: UploadFile = File(...)
):
    """
    Public unauthenticated endpoint for the Job Seeker Demo.
    Parses the JD and a single resume in-memory and returns the match result.
    """
    if not job_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description cannot be empty."
        )
    
    try:
        file_bytes = await file.read()
        raw_text = extract_text_from_file(file.filename or "resume.pdf", file_bytes)
        
        # Concurrently parse JD and Resume
        job_task = ai_service.parse_job_description(job_text, title="Demo Job")
        resume_task = ai_service.parse_resume(raw_text, filename=file.filename)
        
        job, resume = await asyncio.gather(job_task, resume_task)
        
        # Match
        match_result = await ai_service.match_resume_to_job(job, resume, weights=job.scoring_weights)
        return match_result
    except Exception as e:
        logger.error(f"Demo match-single failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )

@router.post("/match-multiple", response_model=MatchResponse)
async def demo_match_multiple(
    job_text: str = Form(...),
    files: List[UploadFile] = File(...)
):
    """
    Public unauthenticated endpoint for the HR Demo.
    Parses the JD and up to 3 candidate resumes and returns ranked match results.
    """
    if not job_text.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Job description cannot be empty."
        )
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one resume is required."
        )
    
    # Cap to max 3 files for free demo
    eval_files = files[:3]
    
    try:
        job = await ai_service.parse_job_description(job_text, title="Demo Position")
        
        # Extract and parse resumes
        resumes = []
        for file in eval_files:
            file_bytes = await file.read()
            raw_text = extract_text_from_file(file.filename or "resume.pdf", file_bytes)
            resume = await ai_service.parse_resume(raw_text, filename=file.filename)
            resumes.append(resume)
        
        # Concurrent matching
        match_tasks = [
            ai_service.match_resume_to_job(job, resume, weights=job.scoring_weights)
            for resume in resumes
        ]
        results = await asyncio.gather(*match_tasks, return_exceptions=True)
        
        valid_results = []
        for i, r in enumerate(results):
            if isinstance(r, Exception):
                logger.error(f"Failed to evaluate {resumes[i].name}: {r}")
            else:
                valid_results.append(r)
                
        valid_results.sort(key=lambda x: x.score, reverse=True)
        
        return MatchResponse(
            job_id=job.id,
            job_title=job.title,
            total_evaluated=len(valid_results),
            results=valid_results
        )
    except Exception as e:
        logger.error(f"Demo match-multiple failed: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Evaluation failed: {str(e)}"
        )
