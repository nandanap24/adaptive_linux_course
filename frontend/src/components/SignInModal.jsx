export default function SignInModal({
  loginData,
  setLoginData,
  handleLogin,
  setAuthMode,
}) {
  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={() => setAuthMode(null)}>
          ×
        </button>

        <h2>Log In</h2>

        <p>
          New user?
          <span onClick={() => setAuthMode("signup")}>Register Now</span>
        </p>

        <input
          type="text"
          placeholder="Username"
          value={loginData.username}
          onChange={(e) =>
            setLoginData({
              ...loginData,
              username: e.target.value,
            })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={loginData.password}
          onChange={(e) =>
            setLoginData({
              ...loginData,
              password: e.target.value,
            })
          }
        />

        <button onClick={handleLogin}>Sign In</button>
      </div>
    </div>
  );
}
