
-- Users tábla
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,   -- ide kerül majd a bcrypt hash
    email VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Példa: demo user hozzáadása (bcrypt hash-sel)
-- jelszó: "teszt123"
INSERT INTO users (username, password_hash, email)
VALUES (
    'demo',
    '$2b$12$6c0wqVhmlEcp18cGZiiJue3QqjNKYgYkkUUM0gOmLNqYBozrWIk6',
    'demo@email.com'
);