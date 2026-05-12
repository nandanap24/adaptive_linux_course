# LinuxPath — Adaptive Linux Learning Platform

LinuxPath is an interactive adaptive learning platform for learning Linux concepts through structured lessons, guided labs, real terminal practice, command validation, and adaptive quizzes.

The platform combines a React frontend, an Express backend, a PostgreSQL database, and Docker-powered Ubuntu containers to provide a safe Linux practice environment for learners.

---

## Features

### Interactive Linux Playground

Learners can execute real Linux commands inside isolated Docker containers.

Supported features include:

- Persistent working directory
- Command history
- Terminal scrolling
- Real Bash execution
- Safe isolated environment
- Per-user terminal session support

Example commands:

```bash
mkdir demo
cd demo
touch notes.txt
```

---

### Guided Practice Labs

Each subtopic includes guided labs with:

- Step-by-step instructions
- Command hints
- Beginner-friendly explanations
- Verification system
- Real command validation

Example lab flow:

```text
Step 1 → Run pwd
Step 2 → Create a directory
Step 3 → Navigate into the directory
Step 4 → Create a file
```

The learner must type the correct Linux command before moving to the next step.

---

### Adaptive Learning System

LinuxPath adapts the explanation level based on quiz performance.

```text
Standard Explanation
        ↓
Quiz
        ↓
Pass → Topic Completed

Fail
        ↓
Layman Explanation
        ↓
Quiz

Fail
        ↓
ELI10 Explanation
```

This helps beginners receive simpler explanations when they struggle, while allowing stronger learners to progress faster.

---

## Tech Stack

### Frontend

- React
- Vite
- CSS

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL

### Sandbox Environment

- Docker
- Ubuntu containers

---

## Project Structure

```text
linux_6/
├── backend/
│   ├── server.js
│   ├── terminalManager.js
│   ├── schema.sql
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BashPlayground.jsx
│   │   │   ├── LabPanel.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── SignInModal.jsx
│   │   │   └── SignUpModal.jsx
│   │   │
│   │   ├── Pages/
│   │   │   └── LearningPage.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## Database Tables

The main database tables used in the platform are:

| Table             | Purpose                                                   |
| ----------------- | --------------------------------------------------------- |
| `courses`         | Stores course-level information                           |
| `modules`         | Stores module groupings inside a course                   |
| `subtopics`       | Stores individual learning subtopics                      |
| `lesson_contents` | Stores explanations for different learning levels         |
| `questions`       | Stores quiz questions and answer options                  |
| `labs`            | Stores guided lab metadata                                |
| `lab_steps`       | Stores step-by-step lab instructions and validation rules |

---

## Core Learning Flow

```text
Concept Explanation
        ↓
Guided Lab
        ↓
Real Linux Practice
        ↓
Command Verification
        ↓
Quiz
        ↓
Adaptive Difficulty
        ↓
Progress Tracking
```

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/nandanap24/adaptive_linux_course.git
cd adaptive_linux_course
```

---

### 2. Configure PostgreSQL

Create the database:

```bash
sudo -u postgres createdb adaptive_linux_course
```

Import the database schema:

```bash
sudo -u postgres psql -d adaptive_linux_course -f backend/schema.sql
```

---

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory:

```text
backend/.env
```

Add the following configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=adaptive_linux_course
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
```

Replace `your_password` with your actual PostgreSQL password.

---

### 4. Install and Run the Backend

Move into the backend directory:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Start the backend server:

```bash
node server.js
```

The backend will run at:

```text
http://localhost:3001
```

---

### 5. Install and Run the Frontend

Open a new terminal and move into the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will run at:

```text
http://localhost:5173
```

---

## Docker Requirement

Docker is required for the Linux playground.

Install Docker before using the terminal feature.

Verify Docker installation:

```bash
docker --version
```

The platform automatically creates isolated Ubuntu containers for learners.

---

## Example Guided Lab

```text
Step 1:
Run pwd

Step 2:
Create a directory named demo

Step 3:
Move into the demo directory

Step 4:
Create a file named notes.txt
```

Example commands:

```bash
pwd
mkdir demo
cd demo
touch notes.txt
```

---

## Current Features

- Adaptive explanations
- Guided Linux labs
- Docker-based Linux terminal
- Quiz engine
- Progress tracking
- Command verification
- Step validation
- Persistent terminal session

---

## Future Improvements

Planned improvements include:

- Multiple labs per subtopic
- Achievement system
- AI-generated hints
- Code execution analytics
- Admin dashboard
- Leaderboards
- Personalized learning recommendations
- Instructor-side course management

---

## Author

Nandana

---

## License

This project is licensed under the MIT License.
