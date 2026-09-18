from typing import List, Optional, Union, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from database.models import UserDB, JobDB, ResumeDB, MatchResultDB
import uuid

class UserRepository:
    @staticmethod
    async def create(db: AsyncSession, email: str, hashed_password: str, name: str, role: str) -> UserDB:
        user = UserDB(email=email, hashed_password=hashed_password, name=name, role=role)
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    @staticmethod
    async def get_by_email(db: AsyncSession, email: str) -> Optional[UserDB]:
        result = await db.execute(select(UserDB).where(UserDB.email == email))
        return result.scalars().first()

    @staticmethod
    async def get_by_id(db: AsyncSession, user_id: str) -> Optional[UserDB]:
        result = await db.execute(select(UserDB).where(UserDB.id == user_id))
        return result.scalars().first()

class JobRepository:
    @staticmethod
    async def create(db: AsyncSession, data_or_user_id: Union[str, Dict[str, Any]] = None, **kwargs) -> JobDB:
        if isinstance(data_or_user_id, dict):
            raw_data = {**data_or_user_id, **kwargs}
        else:
            raw_data = kwargs
            if data_or_user_id is not None:
                raw_data["user_id"] = data_or_user_id

        valid_data = {k: v for k, v in raw_data.items() if hasattr(JobDB, k)}
        if not valid_data.get("id") or not str(valid_data["id"]).startswith("job_") or len(str(valid_data["id"])) < 8:
            valid_data["id"] = f"job_{uuid.uuid4().hex[:8]}"

        job = JobDB(**valid_data)
        db.add(job)
        await db.commit()
        await db.refresh(job)
        return job

    @staticmethod
    async def get(db: AsyncSession, job_id: str, user_id: str) -> Optional[JobDB]:
        result = await db.execute(select(JobDB).where(JobDB.id == job_id, JobDB.user_id == user_id))
        return result.scalars().first()

    @staticmethod
    async def list_by_user(db: AsyncSession, user_id: str) -> List[JobDB]:
        result = await db.execute(select(JobDB).where(JobDB.user_id == user_id))
        return list(result.scalars().all())

class ResumeRepository:
    @staticmethod
    async def create(db: AsyncSession, data_or_user_id: Union[str, Dict[str, Any]] = None, **kwargs) -> ResumeDB:
        if isinstance(data_or_user_id, dict):
            raw_data = {**data_or_user_id, **kwargs}
        else:
            raw_data = kwargs
            if data_or_user_id is not None:
                raw_data["user_id"] = data_or_user_id

        if "experience" in raw_data and isinstance(raw_data["experience"], list):
            raw_data["experience"] = [
                exp.model_dump() if hasattr(exp, "model_dump") else exp 
                for exp in raw_data["experience"]
            ]

        valid_data = {k: v for k, v in raw_data.items() if hasattr(ResumeDB, k)}

        # Check if a resume with the same filename already exists for this user (upsert)
        if valid_data.get("filename") and valid_data.get("user_id"):
            existing_res = await db.execute(
                select(ResumeDB).where(
                    ResumeDB.user_id == valid_data["user_id"],
                    ResumeDB.filename == valid_data["filename"]
                )
            )
            existing_resume = existing_res.scalars().first()
            if existing_resume:
                for k, v in valid_data.items():
                    if k != "id" and hasattr(existing_resume, k):
                        setattr(existing_resume, k, v)
                await db.commit()
                await db.refresh(existing_resume)
                return existing_resume

        if not valid_data.get("id") or not str(valid_data["id"]).startswith("res_") or len(str(valid_data["id"])) < 8:
            valid_data["id"] = f"res_{uuid.uuid4().hex[:8]}"

        resume = ResumeDB(**valid_data)
        db.add(resume)
        await db.commit()
        await db.refresh(resume)
        return resume

    @staticmethod
    async def get(db: AsyncSession, resume_id: str, user_id: str) -> Optional[ResumeDB]:
        result = await db.execute(select(ResumeDB).where(ResumeDB.id == resume_id, ResumeDB.user_id == user_id))
        return result.scalars().first()

    @staticmethod
    async def list_by_user(db: AsyncSession, user_id: str) -> List[ResumeDB]:
        result = await db.execute(select(ResumeDB).where(ResumeDB.user_id == user_id))
        return list(result.scalars().all())

    @staticmethod
    async def get_multiple(db: AsyncSession, resume_ids: List[str], user_id: str) -> List[ResumeDB]:
        result = await db.execute(select(ResumeDB).where(ResumeDB.id.in_(resume_ids), ResumeDB.user_id == user_id))
        return list(result.scalars().all())

class MatchResultRepository:
    @staticmethod
    async def create_batch(db: AsyncSession, results: List[Dict[str, Any]]) -> List[MatchResultDB]:
        created_results = []
        for res_data in results:
            valid_data = {k: v for k, v in res_data.items() if hasattr(MatchResultDB, k)}
            if not valid_data.get("id") or not str(valid_data["id"]).startswith("match_") or len(str(valid_data["id"])) < 8:
                valid_data["id"] = f"match_{uuid.uuid4().hex[:8]}"
            match_res = MatchResultDB(**valid_data)
            db.add(match_res)
            created_results.append(match_res)
        await db.commit()
        for res in created_results:
            await db.refresh(res)
        return created_results

    @staticmethod
    async def get_by_job(db: AsyncSession, job_id: str, user_id: str) -> List[MatchResultDB]:
        result = await db.execute(select(MatchResultDB).where(MatchResultDB.job_id == job_id, MatchResultDB.user_id == user_id))
        return list(result.scalars().all())

    @staticmethod
    async def delete_by_job(db: AsyncSession, job_id: str, user_id: str):
        await db.execute(delete(MatchResultDB).where(MatchResultDB.job_id == job_id, MatchResultDB.user_id == user_id))
        await db.commit()
