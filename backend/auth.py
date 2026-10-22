import os
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta, timezone
from urllib.request import parse_http_list

import jwt
from pwdlib import PasswordHash
from dotenv import load_dotenv

load_dotenv()
passwordHasher = PasswordHash.recommended()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60

if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET is not set in .env")

def hash_password(password: str) -> str:
    return passwordHasher.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return passwordHasher.verify(plain_password, hashed_password)

def create_access_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

bearer_scheme = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials
                        = Depends(bearer_scheme),) -> int:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired token")
