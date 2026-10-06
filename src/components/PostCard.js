import { useState } from "react";
import { Link } from "react-router-dom";
import Alert from "./Alert";

const sameId = (left, right) => String(left) === String(right);

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function PostCard({
  post,
  author,
  comments,
  users,
  currentUser,
  onDeletePost,
  onAddComment,
  onDeleteComment,
}) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const handleComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;
    setSaving(true);
    setError("");
    try {
      await onAddComment(post.id, comment.trim());
      setComment("");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Delete this post and all of its comments?")) return;
    try {
      await onDeletePost(post.id);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await onDeleteComment(commentId);
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  return (
    <article className="post-card card">
      <header className="post-header">
        <div className="author-row">
          <img
            className="author-avatar"
            src={author?.profile_url || "https://placehold.co/96x96?text=?"}
            alt=""
          />
          <div>
            <strong>{author?.name || "Former member"}</strong>
            <time dateTime={post.createdAt}>{formatDate(post.createdAt)}</time>
          </div>
        </div>
        {currentUser && sameId(currentUser.id, post.userId) && (
          <button className="icon-button danger" onClick={handleDeletePost} type="button">
            Delete post
          </button>
        )}
      </header>

      {post.image_url && !imageFailed && (
        <img
          className="post-image"
          src={post.image_url}
          alt=""
          onError={() => setImageFailed(true)}
        />
      )}

      <div className="post-content">
        <h2>{post.title}</h2>
        <p>{post.body}</p>
      </div>

      <div className="comments-panel">
        <div className="comments-title">
          <h3>Conversation</h3>
          <span>{comments.length} {comments.length === 1 ? "comment" : "comments"}</span>
        </div>
        <Alert>{error}</Alert>

        {comments.length > 0 ? (
          <ul className="comment-list">
            {comments.map((item) => {
              const commentAuthor = users.find((candidate) => sameId(candidate.id, item.userId));
              return (
                <li key={item.id} className="comment">
                  <img
                    src={commentAuthor?.profile_url || "https://placehold.co/72x72?text=?"}
                    alt=""
                  />
                  <div className="comment-bubble">
                    <div className="comment-meta">
                      <strong>{commentAuthor?.name || "Former member"}</strong>
                      <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                    </div>
                    <p>{item.body}</p>
                  </div>
                  {currentUser && sameId(currentUser.id, item.userId) && (
                    <button
                      className="comment-delete"
                      type="button"
                      onClick={() => handleDeleteComment(item.id)}
                      aria-label="Delete your comment"
                    >
                      Delete
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="empty-comment">No comments yet. Start the conversation.</p>
        )}

        {currentUser ? (
          <form className="comment-form" onSubmit={handleComment}>
            <img src={currentUser.profile_url} alt="" />
            <label className="sr-only" htmlFor={`comment-${post.id}`}>
              Add a comment
            </label>
            <input
              id={`comment-${post.id}`}
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              maxLength="300"
              placeholder="Add to the conversation…"
            />
            <button className="button button-small" disabled={saving || !comment.trim()} type="submit">
              {saving ? "Sending…" : "Comment"}
            </button>
          </form>
        ) : (
          <p className="login-prompt">
            <Link to="/login">Log in</Link> to join the conversation.
          </p>
        )}
      </div>
    </article>
  );
}
