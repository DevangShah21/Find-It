import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../api.js";

export default function SignIn() {
  const { signin } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { token, user } = await api.signin(form);
      signin(token, user);
      nav(user.role === "admin" ? "/admin" : from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <Link to="/">Find-It</Link>
        </div>
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">Sign in to your account to continue</p>

        {error && <div className="auth-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email address</label>
            <input
              className="form-input"
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={form.password}
              onChange={set("password")}
              placeholder="••••••••"
              required
            />
          </div>

          <button className="btn btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign In →"}
          </button>
        </form>

        <div className="auth-demo-box">
          <p className="auth-demo-title">Demo accounts</p>
          <div className="auth-demo-row">
            <span>👑 Admin</span>
            <code>admin@findit.com / admin123</code>
            <button className="auth-demo-fill" onClick={() => setForm({ email: "admin@findit.com", password: "admin123" })}>Fill</button>
          </div>
          <div className="auth-demo-row">
            <span>👤 User</span>
            <code>user@findit.com / user1234</code>
            <button className="auth-demo-fill" onClick={() => setForm({ email: "user@findit.com", password: "user1234" })}>Fill</button>
          </div>
        </div>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/signup" state={{ from }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
