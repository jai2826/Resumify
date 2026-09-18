from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from database.connection import get_db
from database.repository import ResumeRepository
from database.models import UserDB
from schemas.models import Resume, UploadSummary
from services.extractor import extract_text_from_file, TextExtractorError
from services.ai_service import ai_service
from auth.dependencies import get_current_user

router = APIRouter(prefix="/resumes", tags=["Resumes"])

@router.post("/upload", response_model=UploadSummary)
async def upload_resumes(
    files: List[UploadFile] = File(...),
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Accepts multiple resume files, extracts their text, parses them with Groq,
    and stores structured candidate profiles in the database.
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files uploaded."
        )

    parsed_resumes: List[Resume] = []
    errors: List[dict] = []

    for file in files:
        try:
            file_bytes = await file.read()
            raw_text = extract_text_from_file(file.filename or "unknown.pdf", file_bytes)
            resume = await ai_service.parse_resume(raw_text, filename=file.filename)
            
            resume_data = resume.model_dump()
            resume_data["user_id"] = current_user.id
            resume_db = await ResumeRepository.create(db, resume_data)
            
            resume.id = resume_db.id
            parsed_resumes.append(resume)
            
        except TextExtractorError as te:
            errors.append({"filename": file.filename, "error": str(te)})
        except Exception as e:
            errors.append({"filename": file.filename, "error": f"Failed to parse resume: {str(e)}"})

    return UploadSummary(
        total_uploaded=len(files),
        successful=len(parsed_resumes),
        failed=len(errors),
        resumes=parsed_resumes,
        errors=errors
    )

@router.get("/", response_model=List[Resume])
async def list_resumes(
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lists all parsed resumes for the current user."""
    resumes_db = await ResumeRepository.list_by_user(db, current_user.id)
    
    from services.matcher import MatchService
    return [MatchService._resume_db_to_schema(r) for r in resumes_db]

@router.get("/{resume_id}", response_model=Resume)
async def get_resume(
    resume_id: str,
    current_user: UserDB = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retrieves full details of a specific candidate resume if owned by user."""
    resume_db = await ResumeRepository.get(db, resume_id, current_user.id)
    if not resume_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID '{resume_id}' not found."
        )
    from services.matcher import MatchService
    return MatchService._resume_db_to_schema(resume_db)
