export default function SignUpModal({
  signupData,
  setSignupData,
  handleSignup,
  setAuthMode,
}) {
  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={() => setAuthMode(null)}>
          ×
        </button>

        <h2>Create Account</h2>

        <p>
          Already have account?
          <span onClick={() => setAuthMode("signin")}>Log In</span>
        </p>

        <input
          type="text"
          placeholder="Username"
          value={signupData.username}
          onChange={(e) =>
            setSignupData({
              ...signupData,
              username: e.target.value,
            })
          }
        />

        <input
          type="email"
          placeholder="Email"
          value={signupData.email}
          onChange={(e) =>
            setSignupData({
              ...signupData,
              email: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={signupData.password}
          onChange={(e) =>
            setSignupData({
              ...signupData,
              password: e.target.value,
            })
          }
        />

        <button onClick={handleSignup}>Sign Up</button>
      </div>
    </div>
  );
}
