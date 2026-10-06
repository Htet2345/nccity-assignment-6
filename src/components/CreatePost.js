import { useState } from "react";
import Alert from "./Alert";

const initialForm = { image_url: "", title: "", body: "" };

export default function CreatePost({ onCreate }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.title.trim() || !form.body.trim()) {
      setError("Please add both a title and some post content.");
      return;
    }

    if (form.image_url && !/^https?:\/\//i.test(form.image_url)) {
      setError("The image URL must begin with http:// or https://.");
      return;
    }

    setSaving(true);
    try {
      await onCreate({
        image_url: form.image_url.trim(),
        title: form.title.trim(),
        body: form.body.trim(),
      });
      setForm(initialForm);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="composer card" aria-labelledby="new-post-heading">
      <div className="section-heading compact">
        <div>
          <p className="eyebrow">Start a conversation</p>
          <h2 id="new-post-heading">Share something new</h2>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <Alert>{error}</Alert>
        <label>
          Post title
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            maxLength="100"
            placeholder="What is on your mind?"
          />
        </label>
        <label>
          Image URL <span className="optional">optional</span>
          <input
            name="image_url"
            value={form.image_url}
            onChange={handleChange}
            type="url"
            placeholder="https://example.com/image.jpg"
          />
        </label>
        <label>
          Your post
          <textarea
            name="body"
            value={form.body}
            onChange={handleChange}
            rows="4"
            maxLength="1000"
            placeholder="Tell the community more…"
          />
        </label>
        <div className="form-footer">
          <span className="character-count">{form.body.length}/1000</span>
          <button className="button" disabled={saving} type="submit">
            {saving ? "Publishing…" : "Publish post"}
          </button>
        </div>
      </form>
    </section>
  );
}
