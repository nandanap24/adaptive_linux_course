import { useState } from "react";

import LandingPage from "./components/LandingPage";
import SignInModal from "./components/SignInModal";
import SignUpModal from "./components/SignUpModal";

import LearningPage from "./Pages/LearningPage";

import "./App.css";

export default function App() {
  const [authMode, setAuthMode] = useState(null);

  const [currentPage, setCurrentPage] = useState("landing");

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("loggedIn") === "true",
  );

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    username: "",
    email: "",
    password: "",
  });

  // LOGIN
  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);

        if (data.error === "User not found") {
          setAuthMode("signup");
        }

        return;
      }

      setIsLoggedIn(true);

      localStorage.setItem("loggedIn", "true");

      localStorage.setItem("loggedInUser", JSON.stringify(data.user));

      setAuthMode(null);

      alert("Login successful!");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  // SIGNUP
  const handleSignup = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error);
        return;
      }

      alert("Account created successfully!");

      setAuthMode("signin");
    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  };

  // OPEN COURSE
  const handleOpenCourse = () => {
    if (!isLoggedIn) {
      setAuthMode("signin");
      return;
    }

    setCurrentPage("learning");
  };

  // BACK TO HOME
  const handleBack = () => {
    setCurrentPage("landing");
  };
  const handleLogout = () => {
    localStorage.removeItem("loggedIn");

    setIsLoggedIn(false);

    setCurrentPage("landing");

    alert("Logged out successfully");
  };
  return (
    <>
      {currentPage === "landing" ? (
        <LandingPage
          setAuthMode={setAuthMode}
          isLoggedIn={isLoggedIn}
          handleOpenCourse={handleOpenCourse}
          handleLogout={handleLogout}
        />
      ) : (
        <LearningPage handleBack={handleBack} />
      )}

      {authMode === "signin" && (
        <SignInModal
          loginData={loginData}
          setLoginData={setLoginData}
          handleLogin={handleLogin}
          setAuthMode={setAuthMode}
        />
      )}

      {authMode === "signup" && (
        <SignUpModal
          signupData={signupData}
          setSignupData={setSignupData}
          handleSignup={handleSignup}
          setAuthMode={setAuthMode}
        />
      )}
    </>
  );
}
