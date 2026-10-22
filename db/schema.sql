CREATE TABLE users
(
    id            SERIAL PRIMARY KEY,
    username      VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT        NOT NULL
);

CREATE TABLE books
(
    id      SERIAL PRIMARY KEY,
    title   VARCHAR(100) NOT NULL,
    author  VARCHAR(100) NOT NULL,
    genre   VARCHAR(100) NOT NULL,
    rating  INTEGER      NOT NULL CHECK (rating BETWEEN 1 AND 5),
    user_id INTEGER      NOT NULL REFERENCES users (id) ON DELETE CASCADE
);