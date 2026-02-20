from pydantic import BaseModel, EmailStr, Field
from typing import List

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class DriverStandingSchema(BaseModel):
    driver: str
    team: str
    points: float
    position: int

    class Config:
        orm_mode = True

class PredictionCreate(BaseModel):
    year: int
    round: int
    identifier: str
    picks: List[str] = Field(..., min_items=3, max_items=3)

class PredictionOut(BaseModel):
    id: int
    year: int
    user_id: int
    username: str
    round: int
    identifier: str
    first: str
    second: str
    third: str

    class Config:
        from_attributes = True   # Pydantic v2

class PredictionLeaderboardOut(BaseModel):
    year: int
    user_id: int
    username: str
    points: int

    class Config:
        from_attributes = True
