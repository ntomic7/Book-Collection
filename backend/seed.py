from database import get_connection
from auth import hash_password
from genres import GENRES

DEMO_USERS = {
    "demo_1": {
        "password": "demo12345",
        "books": [
            ("A Court of Thorns and Roses", "Sarah J Maas", "Fantasy", 4),
            ("Mistborn", "Brandon Sanderson", "Fantasy", 5),
            ("Red Rising", "Pierce Brown", "Science Fiction", 5),
        ],
    },
    "demo_2": {
        "password": "demo12345",
        "books": [
            ("1984", "George Orwell", "Dystopian", 5),
            ("Dracula", "Bram Stoker", "Horror", 4),
            ("Gone Girl", "Gillian Flynn", "Thriller", 3),
        ],
    },
}

def seed():
    with get_connection() as conn:
        with conn.cursor() as cur:
            for username, data in DEMO_USERS.items():
                cur.execute("INSERT INTO users (username, password_hash) VALUES "
                            "(%s, %s) ON CONFLICT (username) DO UPDATE SET "
                            "password_hash = EXCLUDED.password_hash RETURNING ID",
                            (username, hash_password(data["password"])))
                user_id = cur.fetchone()["id"]

                cur.execute("DELETE FROM books WHERE user_id = %s", (user_id,))

                for title, author, genre, rating in data["books"]:
                    assert genre in GENRES, f"{genre} is not in GENRES"
                    cur.execute("INSERT INTO books (title, author, genre, rating, user_id) "
                                "VALUES (%s,%s,%s,%s,%s)",
                                (title, author, genre, rating, user_id))
                print(f"Reset {username} with {len(data['books'])} books")

        conn.commit()

if __name__ == "__main__":
    seed()
