import csv
import io
from fastapi import APIRouter, HTTPException, Response, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.repository import MatchResultRepository, JobRepository
from database.models import UserDB
from schemas.models import MatchEvaluationRequest, MatchResponse, MatchResult, CandidateMatchDetails
from services.matcher import match_service
from auth.dependencies import get_current_user

router = APIRouter(prefix="/match", tags=["Matching & Ranking"])

@router.post("/evaluate", response_model=MatchResponse)
async def evaluate_candidates(
    payload: MatchEvaluationRequest,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Compares candidate resumes against a Job Description.
    Returns ranked candidates from highest match score (100%) to lowest.
    """
    try:
        response = await match_service.evaluate_candidates(
            db=db,
            job_id=payload.job_id,
            user_id=current_user.id,
            resume_ids=payload.resume_ids
        )
        return response
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Candidate evaluation failed: {str(e)}"
        )

@router.get("/{job_id}", response_model=MatchResponse)
async def get_match_results(
    job_id: str,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Fetches previously calculated match rankings for a given job."""
    job = await JobRepository.get(db, job_id, current_user.id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    results_db = await MatchResultRepository.get_by_job(db, job_id, current_user.id)
    
    match_results = []
    for r in results_db:
        details = CandidateMatchDetails(
            candidate_name=r.candidate_name,
            matching_skills=r.matching_skills or [],
            missing_skills=r.missing_skills or [],
            experience_met=r.experience_met,
            candidate_experience_years=r.candidate_experience_years,
            required_experience_years=r.required_experience_years,
            verdict=r.verdict
        )
        match_results.append(MatchResult(
            resume_id=r.resume_id,
            candidate_name=r.candidate_name,
            score=r.score,
            details=details
        ))
        
    return MatchResponse(
        job_id=job_id,
        job_title=job.title or job.role,
        total_evaluated=len(match_results),
        results=match_results
    )

@router.get("/{job_id}/export")
async def export_match_csv(
    job_id: str,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Generates and downloads a CSV spreadsheet report of candidate rankings."""
    job = await JobRepository.get(db, job_id, current_user.id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    results_db = await MatchResultRepository.get_by_job(db, job_id, current_user.id)
    if not results_db:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No evaluation results found for this job. Run /match/evaluate first."
        )

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Rank", "Candidate Name", "Match Score (pts)", "Experience Met",
        "Candidate Experience (Yrs)", "Matching Skills", "Missing Skills", "AI Verdict"
    ])

    for rank, r in enumerate(results_db, start=1):
        writer.writerow([
            rank,
            r.candidate_name,
            f"{r.score:.1f}",
            "Yes" if r.experience_met else "No",
            r.candidate_experience_years or "N/A",
            ", ".join(r.matching_skills or []),
            ", ".join(r.missing_skills or []),
            r.verdict
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=candidates_{job_id}.csv"
        }
    )
