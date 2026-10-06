import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.identifier.trim() || !form.password) {
      setError("Enter your email or phone number and password.");
      return;
    }

    setSaving(true);
    try {
      await login(form.identifier, form.password);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-intro">
        <p className="eyebrow">Welcome back</p>
        <h1>Continue the conversation.</h1>
        <p>Sign in to share a new thought, respond to the community, or update your profile.</p>
        <div className="demo-note">
          <strong>Demo account</strong>
          <span>demo@example.com</span>
          <span>demo123</span>
        </div>
      </section>

      <section className="auth-card card">
        <h2>Log in</h2>
        <p className="muted">Use your email address or phone number.</p>
        <Alert>{error}</Alert>
        <form onSubmit={handleSubmit} noValidate>
          <label>
            Email or phone
            <input
              autoComplete="username"
              value={form.identifier}
              onChange={(event) => setForm({ ...form, identifier: event.target.value })}
              placeholder="you@example.com"
            />
          </label>
          <label>
            Password
            <input
              autoComplete="current-password"
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="Your password"
            />
          </label>
          <button className="button full-width" disabled={saving} type="submit">
            {saving ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
      </section>
    </div>
  );
}
