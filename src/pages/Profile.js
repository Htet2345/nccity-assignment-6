import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import Alert from "../components/Alert";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";

function readableDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(new Date(value));
}

export default function Profile() {
  const { user, updateSession } = useAuth();
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({
    profile_url: user.profile_url,
    name: user.name,
    email: user.email,
    phone: user.phone,
  });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    api.getPostsByUser(user.id)
      .then((data) => active && setPosts(data))
      .catch((loadError) => active && setError(loadError.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user.id]);

  const handleChange = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const cancelEdit = () => {
    setForm({ profile_url: user.profile_url, name: user.name, email: user.email, phone: user.phone });
    setError("");
    setEditing(false);
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (Object.values(form).some((value) => !value.trim())) {
      setError("All profile fields are required.");
      return;
    }
    if (!/^https?:\/\//i.test(form.profile_url)) {
      setError("Profile URL must begin with http:// or https://.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError("Enter a valid email address.");
      return;
    }

    setSaving(true);
    try {
      const users = await api.getUsers();
      if (users.some((candidate) => String(candidate.id) !== String(user.id) && candidate.email.toLowerCase() === form.email.trim().toLowerCase())) {
        throw new Error("Another account already uses that email address.");
      }
      if (users.some((candidate) => String(candidate.id) !== String(user.id) && candidate.phone.replace(/\s/g, "") === form.phone.replace(/\s/g, ""))) {
        throw new Error("Another account already uses that phone number.");
      }
      const updated = await api.updateUser(user.id, {
        profile_url: form.profile_url.trim(),
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      });
      updateSession(updated);
      setEditing(false);
      setMessage("Your profile has been updated.");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page container">
      <section className="profile-hero card">
        <div className="profile-accent" />
        <img className="profile-avatar" src={user.profile_url} alt={`${user.name}'s profile`} />
        <div className="profile-summary">
          <p className="eyebrow">Community member</p>
          <h1>{user.name}</h1>
          <p>Joined {readableDate(user.registrationDate)}</p>
        </div>
        {!editing && (
          <button className="button button-secondary" onClick={() => setEditing(true)} type="button">
            Edit profile
          </button>
        )}
      </section>

      <div className="profile-grid">
        <section className="card profile-details">
          <div className="section-heading compact">
            <div><p className="eyebrow">Your details</p><h2>Profile information</h2></div>
          </div>
          <Alert>{error}</Alert>
          <Alert type="success">{message}</Alert>
          {editing ? (
            <form onSubmit={saveProfile}>
              <label>Profile image URL<input name="profile_url" value={form.profile_url} onChange={handleChange} /></label>
              <label>Full name<input name="name" value={form.name} onChange={handleChange} /></label>
              <label>Email address<input name="email" type="email" value={form.email} onChange={handleChange} /></label>
              <label>Phone number<input name="phone" type="tel" value={form.phone} onChange={handleChange} /></label>
              <div className="profile-actions">
                <button className="button button-secondary" onClick={cancelEdit} type="button">Cancel</button>
                <button className="button" disabled={saving} type="submit">{saving ? "Saving…" : "Save changes"}</button>
              </div>
            </form>
          ) : (
            <dl className="detail-list">
              <div><dt>Email</dt><dd>{user.email}</dd></div>
              <div><dt>Phone</dt><dd>{user.phone}</dd></div>
              <div><dt>Member since</dt><dd>{readableDate(user.registrationDate)}</dd></div>
            </dl>
          )}
        </section>

        <section className="profile-posts">
          <div className="section-heading compact">
            <div><p className="eyebrow">Your contributions</p><h2>Posts you have shared</h2></div>
            <span className="post-count">{posts.length} total</span>
          </div>
          {loading ? <Spinner label="Loading your posts…" /> : posts.length ? (
            posts.map((post) => (
              <article className="profile-post card" key={post.id}>
                {post.image_url && <img src={post.image_url} alt="" />}
                <div>
                  <time dateTime={post.createdAt}>{readableDate(post.createdAt)}</time>
                  <h3>{post.title}</h3>
                  <p>{post.body}</p>
                </div>
              </article>
            ))
          ) : (
            <div className="empty-state card"><h3>No posts yet</h3><p>Your published posts will appear here.</p><Link className="button" to="/">Create your first post</Link></div>
          )}
        </section>
      </div>
    </div>
  );
}
