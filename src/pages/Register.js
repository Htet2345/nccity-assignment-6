import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../api";
import Alert from "../components/Alert";
import { useAuth } from "../context/AuthContext";

const initialForm = {
  profile_url: "",
  name: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

function validate(form) {
  if (Object.values(form).some((value) => !value.trim())) return "Please complete every field.";
  if (!/^https?:\/\//i.test(form.profile_url)) return "Profile URL must begin with http:// or https://.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "Enter a valid email address.";
  if (!/^[+\d][\d\s()-]{6,19}$/.test(form.phone)) return "Enter a valid phone number.";
  if (form.password.length < 6) return "Password must contain at least 6 characters.";
  if (form.password !== form.confirmPassword) return "The passwords do not match.";
  return "";
}

export default function Register() {
  const { user, updateSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const handleChange = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");
    try {
      const users = await api.getUsers();
      const email = form.email.trim().toLowerCase();
      const phone = form.phone.replace(/\s/g, "");
      if (users.some((candidate) => candidate.email.toLowerCase() === email)) {
        throw new Error("An account already uses this email address.");
      }
      if (users.some((candidate) => candidate.phone.replace(/\s/g, "") === phone)) {
        throw new Error("An account already uses this phone number.");
      }

      const { confirmPassword, ...values } = form;
      const created = await api.createUser({
        ...values,
        name: values.name.trim(),
        profile_url: values.profile_url.trim(),
        email,
        phone: values.phone.trim(),
        registrationDate: new Date().toISOString(),
      });
      updateSession(created);
      navigate("/profile", { replace: true });
    } catch (registrationError) {
      setError(registrationError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="register-page container">
      <div className="register-heading">
        <p className="eyebrow">Join the community</p>
        <h1>Bring your perspective.</h1>
        <p>Create your profile and start sharing in just a moment.</p>
      </div>

      <section className="register-card card">
        <Alert>{error}</Alert>
        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <label className="span-two">
            Profile image URL
            <input name="profile_url" type="url" value={form.profile_url} onChange={handleChange} placeholder="https://example.com/you.jpg" />
          </label>
          <label>
            Full name
            <input name="name" autoComplete="name" value={form.name} onChange={handleChange} placeholder="Your name" />
          </label>
          <label>
            Email address
            <input name="email" autoComplete="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" />
          </label>
          <label>
            Phone number
            <input name="phone" autoComplete="tel" type="tel" value={form.phone} onChange={handleChange} placeholder="+95 9…" />
          </label>
          <div className="form-spacer" aria-hidden="true" />
          <label>
            Password
            <input name="password" autoComplete="new-password" type="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" />
          </label>
          <label>
            Confirm password
            <input name="confirmPassword" autoComplete="new-password" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" />
          </label>
          <div className="span-two submit-row">
            <p>Already a member? <Link to="/login">Log in</Link></p>
            <button className="button" disabled={saving} type="submit">
              {saving ? "Creating account…" : "Create account"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
