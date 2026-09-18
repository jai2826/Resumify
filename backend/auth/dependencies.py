from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from auth.security import decode_access_token
from database.connection import get_db
from database.repository import UserRepository
from database.models import UserDB

security_scheme = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db)
) -> UserDB:
    """Extract and validate JWT token, return the authenticated user."""
    token = credentials.credentials
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired authentication token",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = await UserRepository.get_by_id(db, user_id)
    if user is None or not user.is_active:
        raise credentials_exception
    return user

def require_role(*roles: str):
    """Factory that returns a dependency checking the user's role.
    
    Usage: Depends(require_role("hr"))
    """
    async def role_checker(
        current_user: UserDB = Depends(get_current_user)
    ) -> UserDB:
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(roles)}"
            )
        return current_user
    return role_checker
