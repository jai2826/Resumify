from sqlalchemy import Column, String, Float, Boolean, JSON, ForeignKey, Text
from database.connection import Base
from datetime import datetime, timezone
import uuid

def get_utc_now_str():
    return datetime.now(timezone.utc).isoformat()

class UserDB(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: f"user_{uuid.uuid4().hex[:8]}")
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    name = Column(String(255), default="Anonymous")
    role = Column(String(50), nullable=False)
    groq_api_key = Column(String(255), nullable=True)
    preferred_model = Column(String(100), nullable=True)
    subscription_tier = Column(String(50), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(String, default=get_utc_now_str)

class JobDB(Base):
    __tablename__ = "jobs"

    id = Column(String, primary_key=True, default=lambda: f"job_{uuid.uuid4().hex[:8]}")
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=True)
    role = Column(String(255), nullable=False)
    required_skills = Column(JSON, default=list)
    preferred_skills = Column(JSON, default=list)
    minimum_experience = Column(Float, nullable=True)
    education_requirements = Column(JSON, default=list)
    responsibilities = Column(JSON, default=list)
    raw_text = Column(Text, nullable=True)
    company = Column(String(255), nullable=True)
    scoring_weights = Column(JSON, nullable=True)
    created_at = Column(String, default=get_utc_now_str)

class ResumeDB(Base):
    __tablename__ = "resumes"

    id = Column(String, primary_key=True, default=lambda: f"res_{uuid.uuid4().hex[:8]}")
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    filename = Column(String(255), nullable=True)
    name = Column(String(255), default="Anonymous Candidate")
    email = Column(String(255), nullable=True)
    phone = Column(String(50), nullable=True)
    total_experience_years = Column(Float, nullable=True)
    skills = Column(JSON, default=list)
    experience = Column(JSON, default=list)
    education = Column(JSON, default=list)
    projects = Column(JSON, default=list)
    certifications = Column(JSON, default=list)
    raw_text_preview = Column(Text, nullable=True)
    created_at = Column(String, default=get_utc_now_str)

class MatchResultDB(Base):
    __tablename__ = "match_results"

    id = Column(String, primary_key=True, default=lambda: f"match_{uuid.uuid4().hex[:8]}")
    job_id = Column(String, ForeignKey("jobs.id"), nullable=False)
    resume_id = Column(String, ForeignKey("resumes.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    candidate_name = Column(String(255), nullable=False)
    score = Column(Float, nullable=False)
    matching_skills = Column(JSON, default=list)
    missing_skills = Column(JSON, default=list)
    experience_met = Column(Boolean, default=False)
    candidate_experience_years = Column(Float, nullable=True)
    required_experience_years = Column(Float, nullable=True)
    verdict = Column(Text, default="")
    created_at = Column(String, default=get_utc_now_str)
