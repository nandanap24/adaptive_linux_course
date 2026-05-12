import { useState } from "react";

export default function LinuxCourseLandingPage() {
  const [authMode, setAuthMode] = useState(null);
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleLogin = () => {
    const existingUser = localStorage.getItem(loginData.username);

    if (!existingUser) {
      alert("User does not exist. Please create an account.");
      setAuthMode("signup");
      return;
    }

    const parsed = JSON.parse(existingUser);

    if (parsed.password !== loginData.password) {
      alert("Incorrect password");
      return;
    }

    alert("Login successful");
    setAuthMode(null);
  };

  const handleSignup = () => {
    if (!signupData.username || !signupData.password) {
      alert("Fill all required fields");
      return;
    }

    localStorage.setItem(signupData.username, JSON.stringify(signupData));

    alert("Account created successfully");

    setLoginData({
      username: signupData.username,
      password: signupData.password,
    });

    setAuthMode("signin");
  };
  const courses = [
    {
      title: "Linux Fundamentals",
      desc: "Start here: Meaning of Userspace, Command Line basics, and more.",
      topics: 8,
      progress: 0,
      icon: "💻",
      bg: "bg-orange-50",
    },
    {
      title: "System Administration",
      desc: "Manage users, processes, and network configurations.",
      topics: 12,
      progress: 0,
      icon: "⚙️",
      bg: "bg-violet-50",
    },
    {
      title: "Cloud Infrastructure",
      desc: "Deploy Linux on major cloud platforms (AWS, Azure, GCP).",
      topics: 10,
      progress: 0,
      icon: "☁️",
      bg: "bg-blue-50",
    },
    {
      title: "DevOps Practices",
      desc: "Integrate Linux with tools like Docker and Ansible.",
      topics: 15,
      progress: 0,
      icon: "♾️",
      bg: "bg-indigo-50",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f8f6f3] overflow-hidden relative font-sans text-[#1f1f1f]">
      {/* background blur shapes */}
      <div className="absolute -left-24 top-24 w-56 h-56 bg-black/30 blur-3xl rounded-full opacity-25" />
      <div className="absolute -right-24 top-16 w-56 h-56 bg-black/30 blur-3xl rounded-full opacity-25" />

      {/* navbar */}
      <header className="relative z-10 h-16 border-b border-black/5 bg-white/70 backdrop-blur-md flex items-center justify-between px-8">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <div className="w-6 h-6 rounded bg-orange-500 flex items-center justify-center text-white text-xs">
            △
          </div>
          LinuxCourse
        </div>

        <div className="flex items-center gap-3 text-sm">
          <button className="text-neutral-700 hover:text-black transition">
            Sign In
          </button>

          <button
            onClick={() => setAuthMode("signin")}
            className="bg-orange-100 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-md hover:bg-orange-200 transition"
          >
            Sign In / Sign Up
          </button>
        </div>
      </header>

      {/* hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        <section className="text-center max-w-4xl mx-auto mb-10">
          <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight">
            Master Linux, Your Adaptive Learning
            <br />
            Journey Starts Here.
          </h1>

          <p className="mt-5 text-neutral-700 text-lg leading-8 max-w-3xl mx-auto">
            Welcome to LinuxCourse, the adaptive platform tailored to your pace.
            Explore our curated modules and start learning today.
            <span className="text-orange-600 font-medium">
              {" "}
              Sign In / Sign Up
            </span>{" "}
            to track progress.
          </p>
        </section>

        {/* cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {courses.map((course) => (
            <div
              key={course.title}
              className="bg-white/95 rounded-2xl overflow-hidden border border-black/10 shadow-lg hover:-translate-y-1 hover:shadow-xl transition duration-200"
            >
              <div
                className={`h-40 ${course.bg} flex items-center justify-center text-7xl border-b border-black/5`}
              >
                {course.icon}
              </div>

              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-bold text-xl leading-snug">
                    {course.title}
                  </h3>

                  <span className="text-sm font-semibold text-neutral-500 mt-1">
                    {course.progress}%
                  </span>
                </div>

                <p className="text-sm text-neutral-700 leading-6 min-h-[72px]">
                  {course.desc}
                </p>

                <div className="text-sm text-neutral-600 mb-4">
                  {course.topics} Topics
                </div>

                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-lg shadow transition">
                  View Course
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* how it works */}
        <section className="mt-16 text-center">
          <h2 className="text-4xl font-bold mb-10">How It Works</h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-10 text-lg font-medium">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                1
              </div>
              Sign Up
            </div>

            <div className="hidden md:block text-3xl text-neutral-400">→</div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                2
              </div>
              Choose Course
            </div>

            <div className="hidden md:block text-3xl text-neutral-400">→</div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                3
              </div>
              Learn & Track
            </div>
          </div>
        </section>

        {/* footer */}
        <footer className="mt-20 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-600 border-t border-black/5 pt-6">
          <div>© 2024 LinuxCourse Inc. All rights reserved.</div>

          <div className="flex items-center gap-5">
            <button className="hover:text-black transition">About Us</button>
            <button className="hover:text-black transition">Contact</button>
            <button className="hover:text-black transition">
              Terms of Service
            </button>
          </div>
        </footer>
      </main>

      {/* auth modal */}
      {
        authMode && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-black/5 p-10 relative animate-in fade-in duration-200">
              <button
                onClick={() => setAuthMode(null)}
                className="absolute right-5 top-5 text-2xl text-neutral-400 hover:text-black"
              >
                ×
              </button>

              {/* SIGN IN */}
              {authMode === "signin" && (
                <div>
                  <h2 className="text-4xl font-bold mb-3">Log in</h2>

                  <div className="text-neutral-600 mb-8">
                    New user?{" "}
                    <button
                      onClick={() => setAuthMode("signup")}
                      className="text-orange-600 font-semibold hover:underline"
                    >
                      Register Now
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Username or Email
                      </label>

                      <input
                        type="text"
                        value={loginData.username}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            username: e.target.value,
                          })
                        }
                        placeholder="Enter username or email"
                        className="w-full h-14 rounded-xl border border-neutral-200 px-4 outline-none focus:border-orange-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Password
                      </label>

                      <input
                        type="password"
                        value={loginData.password}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            password: e.target.value,
                          })
                        }
                        placeholder="Enter password"
                        className="w-full h-14 rounded-xl border border-neutral-200 px-4 outline-none focus:border-orange-400"
                      />
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 text-neutral-600">
                        <input type="checkbox" />
                        Remember Me
                      </label>

                      <button className="text-orange-600 hover:underline">
                        Forgot password
                      </button>
                    </div>

                    <button
                      onClick={handleLogin}
                      className="w-full h-14 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-lg transition"
                    >
                      Sign In
                    </button>
                  </div>
                </div>
              )}

              {/* SIGN UP */}
              {authMode === "signup" && (
                <div>
                  <h2 className="text-4xl font-bold mb-3">Create Account</h2>

                  <div className="text-neutral-600 mb-8">
                    Already have an account?{" "}
                    <button
                      onClick={() => setAuthMode("signin")}
                      className="text-orange-600 font-semibold hover:underline"
                    >
                      Log in
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Username
                      </label>

                      <input
                        type="text"
                        value={signupData.username}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            username: e.target.value,
                          })
                        }
                        placeholder="Choose username"
                        className="w-full h-14 rounded-xl border border-neutral-200 px-4 outline-none focus:border-orange-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Email
                      </label>

                      <input
                        type="email"
                        value={signupData.email}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            email: e.target.value,
                          })
                        }
                        placeholder="Enter email"
                        className="w-full h-14 rounded-xl border border-neutral-200 px-4 outline-none focus:border-orange-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Password
                      </label>

                      <input
                        type="password"
                        value={signupData.password}
                        onChange={(e) =>
                          setSignupData({
                            ...signupData,
                            password: e.target.value,
                          })
                        }
                        placeholder="Create password"
                        className="w-full h-14 rounded-xl border border-neutral-200 px-4 outline-none focus:border-orange-400"
                      />
                    </div>

                    <button
                      onClick={handleSignup}
                      className="w-full h-14 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-lg transition"
                    >
                      Sign Up
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )

        /* floating cards */
      }
      <div className="hidden lg:flex fixed bottom-6 right-24 bg-[#fff5ef] border border-orange-200 rounded-2xl shadow-xl overflow-hidden w-72 z-20">
        <div className="p-4">
          <div className="inline-flex items-center gap-2 bg-orange-500 text-white text-xs px-3 py-1 rounded-full mb-3 font-semibold">
            ⭐ Featured Course
          </div>

          <div className="text-sm text-neutral-500">Featured Course</div>

          <div className="font-bold text-xl mt-1">Linux Fundamentals</div>
        </div>
      </div>

      <div className="hidden lg:flex fixed bottom-5 right-5 bg-white border border-black/10 rounded-2xl shadow-xl p-4 w-80 z-20 gap-3">
        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center text-xl">
          💻
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <div className="font-semibold text-sm">Meaning of Userspace</div>
            <button className="text-neutral-400 hover:text-black">×</button>
          </div>

          <p className="text-xs text-neutral-600 leading-5">
            Start here: Meaning of Userspace, Command Line basics, and more. 8
            Topics.
          </p>
        </div>
      </div>

      {/* floating support button */}
      <button className="fixed bottom-5 right-5 lg:right-5 w-14 h-14 rounded-full bg-orange-500 text-white shadow-2xl text-2xl hover:scale-105 transition z-30">
        💬
      </button>
    </div>
  );
}
