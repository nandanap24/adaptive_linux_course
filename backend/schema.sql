BEGIN;

-- =========================
-- COURSES
-- =========================
CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT
);

-- =========================
-- MODULES
-- =========================
CREATE TABLE modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,

    sequence INTEGER DEFAULT 1,

    UNIQUE(course_id, slug)
);

-- =========================
-- TOPICS
-- =========================
CREATE TABLE topics (
    id SERIAL PRIMARY KEY,

    module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,

    sequence INTEGER DEFAULT 1,

    UNIQUE(module_id, slug)
);

-- =========================
-- SUBTOPICS
-- =========================
CREATE TABLE subtopics (
    id SERIAL PRIMARY KEY,

    topic_id INTEGER REFERENCES topics(id) ON DELETE CASCADE,

    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,

    sequence INTEGER DEFAULT 1,

    UNIQUE(topic_id, slug)
);

-- =========================
-- LESSON CONTENTS
-- =========================
CREATE TABLE lesson_contents (
    id SERIAL PRIMARY KEY,

    subtopic_id INTEGER REFERENCES subtopics(id) ON DELETE CASCADE,

    level VARCHAR(50) NOT NULL,
    content TEXT NOT NULL
);

-- =========================
-- QUESTIONS
-- =========================
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,

    subtopic_id INTEGER REFERENCES subtopics(id) ON DELETE CASCADE,

    level VARCHAR(50) NOT NULL,

    question TEXT NOT NULL,

    options JSONB NOT NULL,

    answer TEXT NOT NULL
);

-- =========================
-- USERS
-- =========================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- =========================
-- USER PROGRESS
-- =========================
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,

    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    subtopic_id INTEGER REFERENCES subtopics(id) ON DELETE CASCADE,

    current_level VARCHAR(50) DEFAULT 'standard',

    best_score INTEGER DEFAULT 0,

    attempts INTEGER DEFAULT 0,

    completed BOOLEAN DEFAULT FALSE,

    UNIQUE(user_id, subtopic_id)
);

COMMIT;