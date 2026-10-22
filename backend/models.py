from pydantic import BaseModel, Field, field_validator
from genres import GENRES

class BookCreate(BaseModel):
    title: str = Field(max_length=100)
    author: str = Field(max_length=100)
    genre: str = Field(max_length=100)
    rating: int = Field(ge=1, le=5)

    @field_validator("genre")
    @classmethod
    def genre_is_in_list(cls, value):
        if value not in GENRES:
            raise ValueError("Genre must be one of the listed genres")
        return value

class Book(BookCreate):
    id: int

class CreateUser(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=8, max_length=100)

class LoginUser(BaseModel):
    username: str
    password: str