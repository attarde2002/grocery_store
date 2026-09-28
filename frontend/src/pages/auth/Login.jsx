import "./Login.css"; // Ensure Login.css exists in src/pages/auth/
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService"; // Path fixed to go up two levels

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await authService.login(email, password);
      console.log("Login successful:", data);
      navigate("/home");
    } catch (err) {
      console.error("Login failed:", err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <h1>Grocery Store</h1>
          <p>Fresh products. Simple shopping.</p>
        </div>

        <div className="login-card">
          <h2>Welcome Back</h2>
          <p className="login-subtitle">Login to your account</p>

          {error && <p className="login-error">{error}</p>}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>

              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="register-link">
            Don't have an account? <Link to="/register">Create Account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;