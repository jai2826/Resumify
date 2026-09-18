from typing import List, Optional
from pydantic import BaseModel, Field
import uuid
from datetime import datetime

# ==========================================
# 1. Job Description Models
# ==========================================

class JobCreateRequest(BaseModel):
    title: Optional[str] = "Untitled Role"
    raw_text: str
    company: Optional[str] = None

class ScoringWeights(BaseModel):
    required_skills_weight: float = Field(default=0.60, ge=0.0, le=1.0)
    experience_weight: float = Field(default=0.25, ge=0.0, le=1.0)
    preferred_skills_weight: float = Field(default=0.15, ge=0.0, le=1.0)

class JobD(BaseModel):
    id: str = Field(default_factory=lambda: f"job_{uuid.uuid4().hex[:8]}")
    title: Optional[str] = None
    role: str
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    minimum_experience: Optional[float] = None
    education_requirements: List[str] = []
    responsibilities: List[str] = []
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    scoring_weights: Optional[ScoringWeights] = None

# ==========================================
# 2. Resume Parsing Models
# ==========================================

class Experience(BaseModel):
    company: Optional[str] = None
    role: Optional[str] = None
    duration: Optional[str] = None
    description: Optional[str] = None
    skills_used: List[str] = []

class Resume(BaseModel):
    id: str = Field(default_factory=lambda: f"res_{uuid.uuid4().hex[:8]}")
    filename: Optional[str] = None
    name: Optional[str] = "Anonymous Candidate"
    email: Optional[str] = None
    phone: Optional[str] = None
    total_experience_years: Optional[float] = None
    skills: List[str] = []
    experience: List[Experience] = []
    education: List[str] = []
    projects: List[str] = []
    certifications: List[str] = []
    raw_text_preview: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

# ==========================================
# 3. Matching & Scoring Models (Fixed Day 4 dict bug)
# ==========================================

class ScoreBreakdown(BaseModel):
    required_skills_score: float = 0.0
    experience_score: float = 0.0
    preferred_skills_score: float = 0.0
    total_score: float = 0.0

class CandidateMatchDetails(BaseModel):
    candidate_name: Optional[str] = None
    matching_skills: List[str] = []
    missing_skills: List[str] = []
    experience_met: bool = False
    candidate_experience_years: Optional[float] = None
    required_experience_years: Optional[float] = None
    verdict: str = ""
    score_breakdown: Optional[ScoreBreakdown] = None

class MatchResult(BaseModel):
    resume_id: str
    candidate_name: str
    score: float = Field(..., ge=0.0, le=100.0)
    details: CandidateMatchDetails

class MatchEvaluationRequest(BaseModel):
    job_id: str
    resume_ids: Optional[List[str]] = None  # None means evaluate all uploaded resumes

class MatchResponse(BaseModel):
    job_id: str
    job_title: Optional[str] = None
    total_evaluated: int
    results: List[MatchResult]

# ==========================================
# 4. Upload Responses
# ==========================================

class UploadSummary(BaseModel):
    total_uploaded: int
    successful: int
    failed: int
    resumes: List[Resume]
    errors: List[dict] = []
