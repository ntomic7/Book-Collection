import os
import psycopg
from fastapi import FastAPI, Depends
from starlette.exceptions import HTTPException

from database import get_connection
from models import BookCreate, CreateUser, LoginUser
from genres import GENRES
from fastapi.middleware.cors import CORSMiddleware
from auth import hash_password, verify_password, create_access_token, get_current_user_id

origins = os.getenv("CORS_ORIGINS", "http://localhost:63342").split(",")
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=origins,
                    allow_methods=["*"], allow_headers=["*"],)

@app.get("/")
def root():
    return {"message": "Hello World"}

@app.get("/books")
def get_books(user_id: int = Depends(get_current_user_id)):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM books WHERE user_id = %s", (user_id,))
            rows = cur.fetchall()
    return rows

@app.get("/books/{book_id}")
def get_book(book_id: int, user_id: int = Depends(get_current_user_id)):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM books WHERE id = %s AND user_id = %s",
                        (book_id, user_id))
            row = cur.fetchone()
    if row is None:
        raise HTTPException(status_code=404, detail="Book not found")

    return row
@app.get("/genres")
def get_genres():
    return GENRES



@app.post("/books")
def add_book(book: BookCreate, user_id: int = Depends(get_current_user_id)):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO books (title, author, genre, rating, user_id)"
                        " VALUES (%s, %s, %s, %s, %s) RETURNING *",
                        (book.title, book.author, book.genre, book.rating, user_id))
            new_book = cur.fetchone()
        conn.commit()
    return new_book

@app.put("/books/{book_id}")
def update_book(book_id: int, updated_book: BookCreate,
                user_id: int = Depends(get_current_user_id)):

    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE books SET title = %s, author = %s, genre = %s,"
                        " rating = %s WHERE id = %s AND user_id = %s RETURNING * ",
                        (updated_book.title, updated_book.author,
                         updated_book.genre, updated_book.rating, book_id, user_id))
            new_book = cur.fetchone()

            if new_book is None:
                raise HTTPException(status_code=404, detail="Book not found")

        conn.commit()
    return new_book

@app.delete("/books/{book_id}")
def delete_book(book_id: int, user_id: int = Depends(get_current_user_id)):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM books WHERE id = %s AND user_id = %s "
                        "RETURNING *", (book_id, user_id))
            book_to_delete = cur.fetchone()

            if book_to_delete is None:
                raise HTTPException(status_code=404, detail="Book not found")

        conn.commit()
    return book_to_delete

# user log-in functions
@app.post("/register", status_code=201)
def register(user: CreateUser):
    hashed = hash_password(user.password)

    try:
        with get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("INSERT INTO users (username, password_hash) "
                            "VALUES (%s, %s) RETURNING id, username",
                            (user.username, hashed))
                new_user = cur.fetchone()
            conn.commit()
    except psycopg.errors.UniqueViolation:
        raise HTTPException(status_code=409, detail="Username already taken")
    return new_user
@app.post("/login")
def login(credentials: LoginUser):
    with get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT id, username, password_hash FROM users "
                        "WHERE username = %s", (credentials.username, ))
            user = cur.fetchone()

    if user is None or not verify_password(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid username or password")

    token = create_access_token(user["id"])
    return {"access_token": token, "token_type": "bearer"}