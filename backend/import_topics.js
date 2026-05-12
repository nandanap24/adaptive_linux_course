const fs = require("fs");
const path = require("path");
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "adaptive_linux_course",
  password: "newpassword123",
  port: 5432,
});

async function importTopics() {
  try {
    // ===============================
    // CREATE COURSE
    // ===============================

    const courseRes = await pool.query(
      `
      INSERT INTO courses (title, slug)
      VALUES ($1, $2)
      RETURNING id
    `,
      ["Adaptive Linux Course", "adaptive-linux-course"],
    );

    const courseId = courseRes.rows[0].id;

    // ===============================
    // CREATE MODULE
    // ===============================

    const moduleRes = await pool.query(
      `
      INSERT INTO modules (
        course_id,
        title,
        slug,
        sequence
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
      [courseId, "Userspace Fundamentals", "userspace-fundamentals", 1],
    );

    const moduleId = moduleRes.rows[0].id;

    // ===============================
    // READ ALL TOPIC FILES
    // ===============================

    const topicFiles = ["topic1.json", "topic2.json", "topic3.json"];

    for (let t = 0; t < topicFiles.length; t++) {
      const fileName = topicFiles[t];

      console.log("Importing:", fileName);

      const filePath = path.join(__dirname, fileName);

      const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

      // ===============================
      // CREATE TOPIC
      // ===============================

      const topicTitle = data[0]?.parent_topic || `Topic ${t + 1}`;

      const topicSlug = topicTitle.toLowerCase().replace(/\s+/g, "-");

      const topicRes = await pool.query(
        `
        INSERT INTO topics (
          module_id,
          title,
          slug,
          sequence
        )
        VALUES ($1, $2, $3, $4)
        RETURNING id
      `,
        [moduleId, topicTitle, topicSlug, t + 1],
      );

      const topicId = topicRes.rows[0].id;

      // ===============================
      // INSERT SUBTOPICS
      // ===============================

      for (let i = 0; i < data.length; i++) {
        const item = data[i];

        const subtopicRes = await pool.query(
          `
          INSERT INTO subtopics (
            topic_id,
            title,
            slug,
            sequence
          )
          VALUES ($1, $2, $3, $4)
          RETURNING id
        `,
          [topicId, item.topic_name, item.slug, i + 1],
        );

        const subtopicId = subtopicRes.rows[0].id;

        // ===============================
        // INSERT LEVEL CONTENTS
        // ===============================

        for (const level of ["standard", "layman", "eli10"]) {
          const levelData = item.levels[level];

          // Insert explanation

          await pool.query(
            `
            INSERT INTO lesson_contents (
              subtopic_id,
              level,
              content
            )
            VALUES ($1, $2, $3)
          `,
            [subtopicId, level, levelData.explanation],
          );

          // ===============================
          // INSERT QUESTIONS
          // ===============================

          for (const q of levelData.questions) {
            await pool.query(
              `
              INSERT INTO questions (
                subtopic_id,
                level,
                question,
                options,
                answer
              )
              VALUES ($1, $2, $3, $4, $5)
            `,
              [
                subtopicId,
                level,
                q.question,
                JSON.stringify(q.options),
                q.answer,
              ],
            );
          }
        }
      }
    }

    console.log("=================================");
    console.log("Import completed successfully");
    console.log("=================================");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

importTopics();
