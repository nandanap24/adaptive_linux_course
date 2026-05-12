import "../App.css";

export default function LandingPage({
  setAuthMode,
  isLoggedIn,
  handleOpenCourse,
  handleLogout,
}) {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const courses = [
    {
      title: "Linux Fundamentals",
      desc: "Start here: Meaning of Userspace, Command Line basics, and more.",
      topics: 8,
      progress: 0,
      icon: "💻",
      bg: "bg-orange",
    },
    {
      title: "System Administration",
      desc: "Manage users, processes, and network configurations.",
      topics: 12,
      progress: 0,
      icon: "⚙️",
      bg: "bg-violet",
    },
    {
      title: "Cloud Infrastructure",
      desc: "Deploy Linux on major cloud platforms (AWS, Azure, GCP).",
      topics: 10,
      progress: 0,
      icon: "☁️",
      bg: "bg-blue",
    },
    {
      title: "DevOps Practices",
      desc: "Integrate Linux with tools like Docker and Ansible.",
      topics: 15,
      progress: 0,
      icon: "♾️",
      bg: "bg-indigo",
    },
  ];

  return (
    <div className="landing-wrapper">
      {/* Navbar */}
      <header className="landing-navbar">
        <div className="landing-logo">
          <div className="landing-logo-box">△</div>
          LinuxCourse
        </div>

        <div className="landing-nav-actions">
          {!isLoggedIn ? (
            <>
              <button
                className="landing-signin-btn"
                onClick={() => setAuthMode("signin")}
              >
                Sign In
              </button>

              <button
                className="landing-signup-btn"
                onClick={() => setAuthMode("signup")}
              >
                Sign In / Sign Up
              </button>
            </>
          ) : (
            <div className="landing-user-actions">
              <button className="landing-user-btn">{user?.username}</button>

              <button className="landing-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="landing-hero">
        <h1>
          Master Linux, Your Adaptive Learning
          <br />
          Journey Starts Here.
        </h1>

        <p>
          Welcome to LinuxCourse, the adaptive platform tailored to your pace.
          Explore curated modules and start learning today.
        </p>
      </section>

      {/* Cards */}
      <section className="course-grid">
        {courses.map((course, index) => (
          <div className="course-card" key={index}>
            <div className={`course-icon ${course.bg}`}>{course.icon}</div>

            <div className="course-content">
              <div className="course-header">
                <h3>{course.title}</h3>
                <span>{course.progress}%</span>
              </div>

              <p>{course.desc}</p>

              <div className="course-topics">{course.topics} Topics</div>

              <button
                className="course-btn"
                onClick={() => {
                  if (index === 0) {
                    handleOpenCourse();
                  } else {
                    alert("Only Module 1 available now");
                  }
                }}
              >
                View Course
              </button>
            </div>
          </div>
        ))}
      </section>

      {/* How It Works */}
      <section className="how-section">
        <h2>How It Works</h2>

        <div className="how-steps">
          <div className="step">
            <div className="step-circle">1</div>
            Sign Up
          </div>

          <div className="step-arrow">→</div>

          <div className="step">
            <div className="step-circle">2</div>
            Choose Course
          </div>

          <div className="step-arrow">→</div>

          <div className="step">
            <div className="step-circle">3</div>
            Learn & Track
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div>© 2026 LinuxCourse Inc. All rights reserved.</div>

        <div className="footer-links">
          <button>About Us</button>
          <button>Contact</button>
          <button>Terms of Service</button>
        </div>
      </footer>
    </div>
  );
}
