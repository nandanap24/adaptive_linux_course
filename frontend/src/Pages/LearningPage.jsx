import { useState, useEffect, useRef } from "react";

import { FiMoon, FiSun } from "react-icons/fi";
import BashPlayground from "../components/BashPlayground";
import LabPanel from "../components/LabPanel";
import "../App.css";

// ─── Constants ────────────────────────────────────────────────────────────────
const LEVELS = ["standard", "layman", "eli10"];
const LLABELS = { standard: "Standard", layman: "Layman", eli10: "ELI10" };
const LDESC = {
  standard: "Technical",
  layman: "Plain English",
  eli10: "Super simple",
};
const LICONS = { standard: "⬡", layman: "◈", eli10: "◉" };
const PASS_THRESH = 0.8;
const API = "http://localhost:3001/api"; // proxied by Vite → localhost:3001

// ─── Markdown renderer ───────────────────────────────────────────────────────
function parseMd(md = "") {
  const esc = (s) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  let s = esc(md)
    .replace(
      /```bash\n([\s\S]*?)```/g,
      (_, c) =>
        `<div class="codeblock"><div class="codeblock-hd"><span class="codeblock-lang">bash</span></div><pre><code>${c.trim()}</code></pre></div>`,
    )
    .replace(
      /```([\s\S]*?)```/g,
      (_, c) =>
        `<div class="codeblock"><pre><code>${c.trim()}</code></pre></div>`,
    )
    .replace(/`([^`]+)`/g, `<code class="icode">$1</code>`)
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, (s) => `<ul>${s}</ul>`);

  s = s
    .split("\n\n")
    .map((p) => (/^<[hup]|^<div|^<ul/.test(p.trim()) ? p : `<p>${p}</p>`))
    .join("");

  return `<div class="md">${s}</div>`;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function LevelTrail({ level, topicProgress }) {
  return (
    <div className="level-trail">
      {LEVELS.map((l, i) => {
        const passed = topicProgress[l]?.passed;
        const active = level === l && !passed;
        const locked = i > LEVELS.indexOf(level) && !passed;
        return (
          <div
            key={l}
            className={`lvl-badge ${active ? "active" : ""} ${passed ? "passed" : ""} ${locked ? "locked" : ""}`}
          >
            <span className="lvl-icon">{LICONS[l]}</span>
            <div className="lvl-info">
              <span className="lvl-nm">{LLABELS[l]}</span>
              <span className="lvl-desc">{LDESC[l]}</span>
            </div>
            {passed && <span className="lvl-check">✓</span>}
          </div>
        );
      })}
    </div>
  );
}

function TopicCard({ topic, active, topicProgress, onClick, locked }) {
  return (
    <button
      className={`tcard ${active ? "active" : ""} ${locked ? "locked" : ""}`}
      onClick={!locked ? onClick : undefined}
    >
      <span className="tcard-name">{topic.topic_name}</span>
      <div className="tdots">
        {LEVELS.map((l) => (
          <span
            key={l}
            className={`dot ${topicProgress[l]?.passed ? "done" : topicProgress[l]?.attempted ? "tried" : ""}`}
          />
        ))}
      </div>
    </button>
  );
}

function ReadingView({ subtopic, content, level, onStartQuiz }) {
  const ref = useRef();

  useEffect(() => {
    if (ref.current && content) {
      ref.current.innerHTML = parseMd(content.content);
    }
  }, [content]);

  if (!content)
    return <div className="loading">No content for this level.</div>;

  return (
    <div className="reading-view">
      <div className="r-header">
        <div className="r-topic">
          <span className="r-icon">⌨</span>
          {subtopic.title}
        </div>
        <span className={`r-lvl-badge ${level}`}>{LLABELS[level]}</span>
      </div>

      <div className="reading-body" ref={ref} />

      <div className="r-footer">
        <p className="r-hint">Read carefully, then test your understanding.</p>
        <button className="quiz-start-btn" onClick={onStartQuiz}>
          Take the quiz →
        </button>
      </div>
    </div>
  );
}

function QuizView({ questions, level, onPass, onFail, isLast }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const pick = (qi, opt) => {
    if (!submitted) setAnswers((a) => ({ ...a, [qi]: opt }));
  };

  const handleSubmit = () => {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });
    const pct = correct / questions.length;
    setScore({ correct, total: questions.length, pct });
    setSubmitted(true);
    setTimeout(() => {
      pct >= PASS_THRESH ? onPass(pct) : onFail(pct);
    }, 2500);
  };

  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="quiz-view">
      <div className="q-hdr">
        <h2 className="q-title">Knowledge Check</h2>
        <span className="q-meta">
          {questions.length} questions · {LLABELS[level]} level · pass at 80%
        </span>
      </div>

      {questions.map((q, qi) => (
        <div
          key={qi}
          className={`qcard ${submitted ? (answers[qi] === q.answer ? "correct" : "wrong") : ""}`}
        >
          <p className="qtext">
            <span className="qnum">{qi + 1}</span>
            {q.question}
          </p>
          <div className="options">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                className={[
                  "opt",
                  answers[qi] === opt ? "sel" : "",
                  submitted && opt === q.answer ? "rc" : "",
                  submitted && answers[qi] === opt && opt !== q.answer
                    ? "rw"
                    : "",
                ].join(" ")}
                onClick={() => pick(qi, opt)}
              >
                <span className="opt-l">{String.fromCharCode(65 + oi)}</span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {!submitted && (
        <button
          className={`sub-btn ${allAnswered ? "ready" : ""}`}
          onClick={allAnswered ? handleSubmit : undefined}
          disabled={!allAnswered}
        >
          {allAnswered
            ? "Submit answers →"
            : `Answer all questions (${Object.keys(answers).length}/${questions.length})`}
        </button>
      )}

      {submitted && score && (
        <div
          className={`score-banner ${score.pct >= PASS_THRESH ? "pass" : "fail"}`}
        >
          <div className="s-icon">{score.pct >= PASS_THRESH ? "✓" : "✗"}</div>
          <div className="s-text">
            <strong>
              {score.correct}/{score.total} correct
            </strong>
            <span>
              {score.pct >= PASS_THRESH
                ? "Excellent! Moving forward…"
                : isLast
                  ? "All explanation levels seen — keep practicing!"
                  : "Let's try a simpler explanation…"}
            </span>
          </div>
          <div className="s-pct">{Math.round(score.pct * 100)}%</div>
        </div>
      )}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function LearningPage({ handleBack }) {
  const currentUser = JSON.parse(localStorage.getItem("loggedInUser")) || null;
  const [modules, setModules] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [theme, setTheme] = useState("light");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topicIdx, setTopicIdx] = useState(0);
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [unlockedTopics, setUnlockedTopics] = useState([1]);
  const [showTopicMenu, setShowTopicMenu] = useState(false);
  const [subtopicIdx, setSubtopicIdx] = useState(0);
  const [lvlIdx, setLvlIdx] = useState(0);
  const [phase, setPhase] = useState("read"); // "read" | "quiz"
  const [progress, setProgress] = useState({});
  const [fading, setFading] = useState(false);
  const [sideOpen, setSideOpen] = useState(true);
  const activeRef = useRef(null);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [notify, setNotify] = useState(null);
  const [content, setContent] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [labs, setLabs] = useState([]);
  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
    fetch(`${API}/modules/1/topics`)
      .then((r) => {
        if (!r.ok) throw new Error(`API error ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setTopics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!currentUser || !currentUser.id || subtopics.length === 0) return;

    const loadProgress = async () => {
      try {
        const response = await fetch(`${API}/progress/${currentUser.id}`);

        const data = await response.json();

        console.log("RESTORED:", data);

        const restored = {};

        data.forEach((p) => {
          restored[p.subtopic_id] = {
            [p.current_level]: {
              attempted: true,
              passed: p.completed,
              score: p.best_score,
            },
          };
        });

        setProgress(restored);
        const unlocked = [1];

        topics.forEach((topic, idx) => {
          const topicSubtopics = subtopics.filter(
            (s) => s.topic_id === topic.id,
          );

          const allPassed =
            topicSubtopics.length > 0 &&
            topicSubtopics.every((s) =>
              LEVELS.some((l) => restored[s.id]?.[l]?.passed),
            );

          if (allPassed) {
            if (topics[idx + 1]) {
              unlocked.push(topics[idx + 1].id);
            }
          }
        });

        setUnlockedTopics(unlocked);

        let nextIdx = 0;

        for (let i = 0; i < subtopics.length; i++) {
          const sid = subtopics[i].id;

          const passed = LEVELS.some((l) => restored[sid]?.[l]?.passed);

          if (passed) {
            nextIdx = i + 1;
          }
        }

        if (nextIdx >= subtopics.length) {
          nextIdx = subtopics.length - 1;
        }

        setSubtopicIdx(nextIdx);
      } catch (err) {
        console.error(err);
      }
    };

    loadProgress();
  }, [subtopics]);
  // ── Fetch topics from API on mount ──────────────────────────────────────────

  useEffect(() => {
    if (!topics[topicIdx]) return;

    fetch(`${API}/topics/${topics[topicIdx].id}/subtopics`)
      .then((r) => r.json())
      .then((data) => {
        setSubtopics(data);
      });
  }, [topics, topicIdx]);
  // ── Derived State ─────────────────────────────────────
  const topic = topics[topicIdx];
  const subtopic = subtopics[subtopicIdx];
  console.log("CURRENT SUBTOPIC:", subtopic);
  const level = LEVELS[lvlIdx];

  const topicProg = progress[subtopic?.id] ?? {};

  const completed = subtopics.filter((s) =>
    LEVELS.some((l) => progress[s.id]?.[l]?.passed),
  ).length;
  useEffect(() => {
    if (!subtopic) return;

    fetch(`${API}/subtopics/${subtopic.id}/content/${level}`)
      .then((r) => r.json())
      .then((data) => {
        setContent(data[0] || null);
      });

    fetch(`${API}/labs/${subtopic.id}`)
      .then((r) => r.json())
      .then((data) => {
        console.log("LABS:", data);

        setLabs(data);
      });

    fetch(`${API}/subtopics/${subtopic.id}/questions/${level}`)
      .then((r) => r.json())
      .then((data) => {
        setQuestions(data);
      });
  }, [subtopic, level]);

  useEffect(() => {
    const move = (e) => {
      setSidebarWidth(Math.min(Math.max(e.clientX, 240), 520));
    };

    const stop = () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", stop);
    };

    const start = () => {
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", stop);
    };

    window.startSidebarResize = start;

    return () => stop();
  }, []);

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [subtopicIdx]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const go = (fn) => {
    setFading(true);
    setTimeout(() => {
      fn();
      setFading(false);
    }, 250);
  };

  const saveProgress = async (subtopicId, level, pct, passed) => {
    try {
      await fetch(`${API}/progress`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          user_id: currentUser.id,

          subtopic_id: subtopicId,

          current_level: level,

          best_score: Math.round(pct * 100),

          completed: passed,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const onPass = (pct) => {
    const topic = topics[topicIdx];
    const subtopic = subtopics[subtopicIdx];
    const level = LEVELS[lvlIdx];
    setProgress((p) => ({
      ...p,
      [subtopic.id]: {
        ...p[subtopic.id],
        [level]: { attempted: true, passed: true, score: pct },
      },
    }));
    saveProgress(subtopic.id, level, pct, true);
    showNotify("pass", `Passed — ${LLABELS[level]} level ✓`);
    go(() => {
      // move to next subtopic
      if (subtopicIdx < subtopics.length - 1) {
        setSubtopicIdx((s) => s + 1);
      }

      // subtopics finished → move to next topic
      else if (topicIdx < topics.length - 1) {
        setTopicIdx((t) => t + 1);
        setSubtopicIdx(0);

        showNotify("pass", "Topic completed ✓ Moving to next topic");
        setUnlockedTopics((u) => [
          ...new Set([...u, topics[topicIdx + 1]?.id]),
        ]);
      }

      // everything completed
      else {
        showNotify("pass", "Course completed 🎉");
      }

      setLvlIdx(0);
      setPhase("read");
    });
  };

  const onFail = (pct) => {
    const topic = topics[topicIdx];
    const level = LEVELS[lvlIdx];

    setProgress((p) => ({
      ...p,
      [subtopic.id]: {
        ...p[subtopic.id],
        [level]: {
          attempted: true,
          passed: false,
          score: pct,
        },
      },
    }));

    saveProgress(subtopic.id, level, pct, false);

    const nextLevel = lvlIdx + 1;

    // move to simpler explanation
    if (nextLevel < LEVELS.length) {
      showNotify("down", `Moving to ${LLABELS[LEVELS[nextLevel]]} explanation`);

      go(() => {
        setLvlIdx(nextLevel);
        setPhase("read");
      });
    }

    // failed even in eli10
    else {
      showNotify("down", "Retry ELI10 until score reaches 80%");

      go(() => {
        setPhase("read");
      });
    }
  };

  const changeTopic = (i) => {
    go(() => {
      setTopicIdx(i);
      setSubtopicIdx(0);
      setLvlIdx(0);
      setPhase("read");
    });
  };
  useEffect(() => {
    if (!topic || !currentUser) return;

    fetch("http://localhost:3001/api/terminal/reset", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        userId: currentUser.id,
        topicName: topic.topic_name,
      }),
    });
  }, [topicIdx]);
  const showNotify = (type, msg) => {
    setNotify({ type, msg });
    setTimeout(() => setNotify(null), 3500);
  };

  const isTopicUnlocked = (idx) => {
    // first subtopic always unlocked
    if (idx === 0) return true;

    const prevSubtopicId = subtopics[idx - 1]?.id;

    const prevProgress = progress[prevSubtopicId];

    if (!prevProgress) return false;

    return LEVELS.some((l) => prevProgress[l]?.passed);
  };

  // ── Loading / Error states ───────────────────────────────────────────────────
  if (loading)
    return (
      <div className="splash">
        <div className="splash-icon">$_</div>
        <p className="splash-msg">Connecting to database…</p>
      </div>
    );

  if (error)
    return (
      <div className="splash">
        <div className="splash-icon error">✗</div>
        <p className="splash-msg">Could not reach the API</p>
        <p className="splash-detail">{error}</p>
        <p className="splash-hint">
          Make sure the Express server is running:
          <br />
          <code>cd backend && npm start</code>
        </p>
      </div>
    );

  if (!topic) return null;
  if (!subtopic)
    return (
      <div className="splash">
        <div className="splash-icon">$_</div>
        <p className="splash-msg">Loading subtopics...</p>
      </div>
    );
  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="app">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside
        className={`sidebar ${sideOpen ? "" : "closed"}`}
        style={{
          width: sideOpen ? sidebarWidth : 56,
        }}
      >
        <div className="sidebar-top">
          <div className="brand">
            <div className="brand-icon">$</div>
            {sideOpen && <span className="brand-name">LinuxCourse</span>}
          </div>
          <button className="stoggle" onClick={() => setSideOpen((o) => !o)}>
            {sideOpen ? "◂" : "▸"}
          </button>
        </div>

        {sideOpen && (
          <>
            <div className="sidebar-stats">
              <div className="stat">
                <span className="stat-n">
                  {completed}/{subtopics.length}
                </span>
                <span className="stat-l">Subtopics</span>
              </div>

              <div className="stat">
                <span className="stat-n">Topic {topicIdx + 1}</span>
                <span className="stat-l">of {topics.length}</span>
              </div>
            </div>
            <div className="progress-wrap">
              <div
                className="progress-fill"
                style={{
                  width: `${(completed / subtopics.length) * 100}%`,
                }}
              />
            </div>
            <div
              className="topic-dropdown"
              onClick={() => setShowTopicMenu(!showTopicMenu)}
            >
              Topic {topicIdx + 1} ▾
            </div>
            {showTopicMenu && (
              <div className="topic-menu">
                {topics.map((t, i) => {
                  console.log(t);

                  const unlocked = unlockedTopics.includes(t.id);

                  return (
                    <button
                      key={t.id}
                      className={`topic-menu-item ${
                        i === topicIdx ? "active-topic" : ""
                      } ${!unlocked ? "locked-topic" : ""}`}
                      disabled={!unlocked}
                      onClick={() => {
                        setTopicIdx(i);
                        setSubtopicIdx(0);
                        setShowTopicMenu(false);
                      }}
                    >
                      {t.title}
                      {!unlocked && " 🔒"}
                    </button>
                  );
                })}
              </div>
            )}
            <div className="topic-list">
              {subtopics.map((s, i) => (
                <div key={s.id} ref={i === subtopicIdx ? activeRef : null}>
                  <TopicCard
                    key={s.id}
                    topic={{ topic_name: s.title }}
                    active={i === subtopicIdx}
                    topicProgress={progress[s.id] ?? {}}
                    locked={!isTopicUnlocked(i)}
                    onClick={() => setSubtopicIdx(i)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
        {sideOpen && (
          <div
            className="resize-handle"
            onMouseDown={() => window.startSidebarResize()}
          />
        )}
      </aside>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <div className="main">
        <header className="main-header">
          <button className="back-home-btn" onClick={handleBack}>
            ← Home
          </button>
          <div className="breadcrumb">
            <span className="bc-c">Linux Fundamentals</span>
            <span className="bc-sep">›</span>
            <span className="bc-t">{subtopic.title}</span>
          </div>
          <div className="hdr-right">
            <button
              className="theme-btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <>
                  <FiSun className="theme-ic sun" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <FiMoon className="theme-ic moon" />
                  <span>Dark</span>
                </>
              )}
            </button>

            <LevelTrail level={level} topicProgress={topicProg} />
          </div>
        </header>

        <div className={`content-area ${fading ? "fade-out" : "fade-in"}`}>
          <div className="content-inner">
            {notify && (
              <div
                className={`notify ${notify.type === "pass" ? "notify-pass" : "notify-down"}`}
              >
                <span>{notify.type === "pass" ? "🎉" : "📖"}</span>
                <strong>{notify.msg}</strong>
              </div>
            )}

            {phase === "quiz" && (
              <button className="back-btn" onClick={() => setPhase("read")}>
                ← Back to reading
              </button>
            )}

            {phase === "read" ? (
              <>
                <ReadingView
                  subtopic={subtopic}
                  content={content}
                  level={level}
                  onStartQuiz={() => setPhase("quiz")}
                />

                {(subtopic?.title?.includes("CLI") ||
                  subtopic?.title?.includes("Shell") ||
                  subtopic?.title?.includes("Process")) && (
                  <>
                    {labs.length > 0 && (
                      <LabPanel
                        key={labs[0]?.id}
                        lab={labs[0]}
                        currentUser={currentUser}
                      />
                    )}

                    <BashPlayground resetTrigger={subtopic?.id} />
                  </>
                )}
              </>
            ) : (
              <QuizView
                questions={questions}
                level={level}
                onPass={onPass}
                onFail={onFail}
                isLast={lvlIdx === LEVELS.length - 1}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
