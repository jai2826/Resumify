from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from config import settings

class Base(DeclarativeBase):
    pass

connect_args = {}
if "sqlite" in settings.database_url:
    connect_args["check_same_thread"] = False
elif "postgresql+asyncpg" in settings.database_url:
    connect_args["statement_cache_size"] = 0

engine = create_async_engine(settings.database_url, echo=False, connect_args=connect_args)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def get_db():
    async with async_session() as session:
        yield session

async def init_db():
    from database.models import UserDB, JobDB, ResumeDB, MatchResultDB  # Import models here to avoid circular imports
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
