require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const axios = require("axios");
const { exec } = require("child_process");

const app = express();

app.use(cors());
app.use(express.json());
const {
  createContainer,
  runCommand,
  removeContainer,
  userDirs,
  getContainer,
} = require("./terminalManager");
const PORT = process.env.PORT || 3001;

// ================= DB =================

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// ================= ROOT =================

app.get("/", (req, res) => {
  res.send("Adaptive Linux Course Backend Running");
});

// ================= HEALTH =================

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT NOW()");

    res.json({
      status: "ok",
      database: process.env.DB_NAME,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      error: err.message,
    });
  }
});

// =====================================================
// GET ALL COURSES
// =====================================================

app.get("/api/courses", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM courses
      ORDER BY sequence
    `);

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// =====================================================
// GET MODULES OF A COURSE
// =====================================================

app.get("/api/courses/:courseId/modules", async (req, res) => {
  try {
    const { courseId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM modules
      WHERE course_id = $1
      ORDER BY sequence
    `,
      [courseId],
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// =====================================================
// GET TOPICS OF A MODULE
// =====================================================

app.get("/api/modules/:moduleId/topics", async (req, res) => {
  try {
    const { moduleId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM topics
      WHERE module_id = $1
      ORDER BY sequence
    `,
      [moduleId],
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// =====================================================
// GET LESSONS OF A TOPIC
// =====================================================

app.get("/api/topics/:topicId/subtopics", async (req, res) => {
  try {
    const { topicId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM subtopics
      WHERE topic_id = $1
      ORDER BY sequence
    `,
      [topicId],
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// =====================================================
// GET LESSON CONTENT BY LEVEL
// =====================================================

app.get("/api/subtopics/:subtopicId/content/:level", async (req, res) => {
  try {
    const { subtopicId, level } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM lesson_contents
      WHERE subtopic_id = $1
      AND level = $2
      ORDER BY id
    `,
      [subtopicId, level],
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// =====================================================
// GET QUESTIONS
// =====================================================

app.get("/api/subtopics/:subtopicId/questions/:level", async (req, res) => {
  try {
    const { subtopicId, level } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM questions
      WHERE subtopic_id = $1
      AND level = $2
      ORDER BY id
    `,
      [subtopicId, level],
    );

    res.json(result.rows);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

// =====================================================
// SAVE PROGRESS
// =====================================================

app.post("/api/progress", async (req, res) => {
  try {
    const { user_id, subtopic_id, current_level, best_score, completed } =
      req.body;

    const existing = await pool.query(
      `
      SELECT * FROM user_progress
      WHERE user_id = $1
      AND subtopic_id = $2
      `,
      [user_id, subtopic_id],
    );

    if (existing.rows.length > 0) {
      const updated = await pool.query(
        `
        UPDATE user_progress
        SET
          current_level = $1,
          best_score = GREATEST(best_score, $2),
          attempts = attempts + 1,
          completed = $3
        WHERE user_id = $4
        AND subtopic_id = $5
        RETURNING *
        `,
        [current_level, best_score, completed, user_id, subtopic_id],
      );

      return res.json(updated.rows[0]);
    }

    const inserted = await pool.query(
      `
      INSERT INTO user_progress
      (
        user_id,
        subtopic_id,
        current_level,
        best_score,
        attempts,
        completed
      )
      VALUES ($1,$2,$3,$4,$5,$6)
      RETURNING *
      `,
      [user_id, subtopic_id, current_level, best_score, 1, completed],
    );

    res.json(inserted.rows[0]);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/api/progress/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM user_progress
      WHERE user_id = $1
      `,
      [userId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/api/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username],
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING *
      `,
      [username, email, password],
    );

    res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/api/signin", async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      `
      SELECT * FROM users
      WHERE username = $1
      `,
      [username],
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    const user = result.rows[0];

    if (user.password_hash !== password) {
      return res.status(400).json({
        error: "Wrong password",
      });
    }
    await createContainer(user.id);
    res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/api/terminal", async (req, res) => {
  try {
    const { userId, command } = req.body;

    const output = await runCommand(userId, command);
    console.log("OUTPUT:", output);
    console.log("CWD:", userDirs[userId]);

    res.json({
      output,
      cwd: userDirs[userId],
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/api/logout", async (req, res) => {
  try {
    const { userId } = req.body;

    await removeContainer(userId);

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/api/terminal/reset", async (req, res) => {
  try {
    const { userId, topicName } = req.body;

    const folder = (topicName || "default").toLowerCase().replace(/\s+/g, "_");

    await runCommand(userId, `mkdir -p /root/workspace/${folder}`);

    res.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/api/labs/:subtopicId", async (req, res) => {
  try {
    const { subtopicId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM labs
      WHERE subtopic_id = $1
      `,
      [subtopicId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/api/labs/verify", async (req, res) => {
  try {
    const { userId, step } = req.body;

    console.log("STEP:", step);

    const output = await runCommand(userId, step.validation_command);

    const cleanedOutput = (output || "").trim();

    const expected = (step.expected_output || "").trim();

    console.log("OUTPUT:", cleanedOutput);
    console.log("EXPECTED:", expected);

    const passed = cleanedOutput === expected;

    res.json({
      passed,
      output: cleanedOutput,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/api/labs/:labId/steps", async (req, res) => {
  try {
    const { labId } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM lab_steps
      WHERE lab_id = $1
      ORDER BY step_number
      `,
      [labId],
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});

app.post("/api/labs/reset", async (req, res) => {
  try {
    const { userId } = req.body;

    const container = getContainer(userId);

    exec(
      `
      docker exec ${container} bash -c "
      rm -rf /root/*
      mkdir -p /root/workspace
      "
      `,
      (err, stdout, stderr) => {
        if (err) {
          console.error(stderr);

          return res.status(500).json({
            error: stderr,
          });
        }

        res.json({
          success: true,
        });
      },
    );
  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: err.message,
    });
  }
});
// ================= START =================

app.listen(PORT, () => {
  console.log("=================================");

  console.log("Server Running On Port " + PORT);

  console.log("http://localhost:" + PORT);

  console.log("=================================");
});
