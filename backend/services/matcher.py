import asyncio
import logging
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from schemas.models import JobD, Resume, MatchResult, MatchResponse, CandidateMatchDetails
from database.repository import JobRepository, ResumeRepository, MatchResultRepository
from database.models import JobDB, ResumeDB
from services.ai_service import ai_service

logger = logging.getLogger(__name__)

class MatchService:
    """Orchestrates candidate evaluation against job descriptions using the AI service and database."""
    
    @staticmethod
    def _job_db_to_schema(job: JobDB) -> JobD:
        """Convert ORM JobDB to Pydantic JobD."""
        return JobD(
            id=job.id,
            title=job.title,
            role=job.role,
            required_skills=job.required_skills or [],
            preferred_skills=job.preferred_skills or [],
            minimum_experience=job.minimum_experience,
            education_requirements=job.education_requirements or [],
            responsibilities=job.responsibilities or [],
            created_at=job.created_at,
            scoring_weights=job.scoring_weights
        )
    
    @staticmethod
    def _resume_db_to_schema(resume: ResumeDB) -> Resume:
        """Convert ORM ResumeDB to Pydantic Resume."""
        # Convert the experience JSON dicts back to Experience objects
        from schemas.models import Experience
        experience_list = []
        for exp in (resume.experience or []):
            if isinstance(exp, dict):
                experience_list.append(Experience(**exp))
            else:
                experience_list.append(exp)
        
        return Resume(
            id=resume.id,
            filename=resume.filename,
            name=resume.name,
            email=resume.email,
            phone=resume.phone,
            total_experience_years=resume.total_experience_years,
            skills=resume.skills or [],
            experience=experience_list,
            education=resume.education or [],
            projects=resume.projects or [],
            certifications=resume.certifications or [],
            raw_text_preview=resume.raw_text_preview,
            created_at=resume.created_at
        )
    
    @staticmethod
    async def evaluate_candidates(
        db: AsyncSession,
        job_id: str,
        user_id: str,
        resume_ids: Optional[List[str]] = None
    ) -> MatchResponse:
        """Evaluate candidates against a job description.
        
        1. Fetch job from DB (must belong to user)
        2. Fetch resumes (specific IDs or all user's resumes)
        3. Run concurrent LLM evaluations
        4. Store results in DB
        5. Return sorted results
        """
        # Get job
        job_db = await JobRepository.get(db, job_id, user_id)
        if not job_db:
            raise ValueError(f"Job '{job_id}' not found")
        job = MatchService._job_db_to_schema(job_db)
        
        # Get resumes
        if resume_ids:
            resumes_db = await ResumeRepository.get_multiple(db, resume_ids, user_id)
        else:
            resumes_db = await ResumeRepository.list_by_user(db, user_id)
        
        if not resumes_db:
            raise ValueError("No resumes found to evaluate")
        
        resumes = [MatchService._resume_db_to_schema(r) for r in resumes_db]
        
        # Run concurrent LLM evaluations
        tasks = [ai_service.match_resume_to_job(job, resume, weights=job.scoring_weights) for resume in resumes]
        results: List[MatchResult] = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Filter out exceptions and log them
        valid_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Failed to evaluate {resumes[i].name}: {result}")
            else:
                valid_results.append(result)
        
        # Sort by score descending
        valid_results.sort(key=lambda r: r.score, reverse=True)
        
        # Delete old results for this job and save new ones
        await MatchResultRepository.delete_by_job(db, job_id, user_id)
        
        # Save to DB
        result_dicts = []
        for r in valid_results:
            result_dicts.append({
                "job_id": job_id,
                "resume_id": r.resume_id,
                "user_id": user_id,
                "candidate_name": r.candidate_name,
                "score": r.score,
                "matching_skills": r.details.matching_skills,
                "missing_skills": r.details.missing_skills,
                "experience_met": r.details.experience_met,
                "candidate_experience_years": r.details.candidate_experience_years,
                "required_experience_years": r.details.required_experience_years,
                "verdict": r.details.verdict
            })
        
        if result_dicts:
            await MatchResultRepository.create_batch(db, result_dicts)
        
        return MatchResponse(
            job_id=job_id,
            job_title=job_db.title,
            total_evaluated=len(valid_results),
            results=valid_results
        )

match_service = MatchService()
