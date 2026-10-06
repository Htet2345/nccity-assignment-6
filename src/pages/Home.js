import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import Alert from "../components/Alert";
import CreatePost from "../components/CreatePost";
import PostCard from "../components/PostCard";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthContext";

const sameId = (left, right) => String(left) === String(right);

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [postData, commentData, userData] = await Promise.all([
          api.getPosts(),
          api.getComments(),
          api.getUsers(),
        ]);
        if (active) {
          setPosts(postData);
          setComments(commentData);
          setUsers(userData);
        }
      } catch (loadError) {
        if (active) setError(loadError.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(
    () => ({ posts: posts.length, members: users.length, comments: comments.length }),
    [posts, users, comments]
  );

  const createPost = async (values) => {
    const created = await api.createPost({
      ...values,
      userId: user.id,
      createdAt: new Date().toISOString(),
    });
    setPosts((current) => [created, ...current]);
  };

  const deletePost = async (postId) => {
    const post = posts.find((item) => sameId(item.id, postId));
    if (!post || !user || !sameId(post.userId, user.id)) {
      throw new Error("You can only delete your own posts.");
    }

    const related = comments.filter((item) => sameId(item.postId, postId));
    await Promise.all(related.map((item) => api.deleteComment(item.id)));
    await api.deletePost(postId);
    setPosts((current) => current.filter((item) => !sameId(item.id, postId)));
    setComments((current) => current.filter((item) => !sameId(item.postId, postId)));
  };

  const addComment = async (postId, body) => {
    if (!user) throw new Error("Please log in before commenting.");
    const created = await api.createComment({
      postId,
      userId: user.id,
      body,
      createdAt: new Date().toISOString(),
    });
    setComments((current) => [...current, created]);
  };

  const deleteComment = async (commentId) => {
    const comment = comments.find((item) => sameId(item.id, commentId));
    if (!comment || !user || !sameId(comment.userId, user.id)) {
      throw new Error("You can only delete your own comments.");
    }
    await api.deleteComment(commentId);
    setComments((current) => current.filter((item) => !sameId(item.id, commentId)));
  };

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A community for curious people</p>
          <h1>Ideas get better when we share them.</h1>
          <p className="hero-text">
            Post what you are learning, making, or noticing—and meet people who care about it too.
          </p>
          {!user && (
            <div className="hero-actions">
              <Link className="button" to="/register">Create an account</Link>
              <Link className="text-link" to="/login">I am already a member →</Link>
            </div>
          )}
        </div>
        <div className="community-stats" aria-label="Community statistics">
          <div><strong>{stats.posts}</strong><span>stories shared</span></div>
          <div><strong>{stats.members}</strong><span>community members</span></div>
          <div><strong>{stats.comments}</strong><span>conversations</span></div>
        </div>
      </section>

      <div className="page-grid container">
        <div className="feed">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Community feed</p>
              <h2>Latest posts</h2>
            </div>
            <span className="post-count">{posts.length} total</span>
          </div>

          <Alert>{error}</Alert>
          {loading ? (
            <Spinner label="Loading the community feed…" />
          ) : posts.length ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                author={users.find((candidate) => sameId(candidate.id, post.userId))}
                comments={comments.filter((item) => sameId(item.postId, post.id))}
                users={users}
                currentUser={user}
                onDeletePost={deletePost}
                onAddComment={addComment}
                onDeleteComment={deleteComment}
              />
            ))
          ) : (
            <div className="empty-state card">
              <span>✦</span>
              <h3>Be the first to post</h3>
              <p>The feed is quiet right now. Share something with the community.</p>
            </div>
          )}
        </div>

        <aside className="sidebar">
          {user ? (
            <CreatePost onCreate={createPost} />
          ) : (
            <section className="card sidebar-card">
              <p className="eyebrow">Your voice belongs here</p>
              <h2>Ready to contribute?</h2>
              <p>Create an account to publish posts and leave comments.</p>
              <Link className="button full-width" to="/register">Join Common Ground</Link>
            </section>
          )}
          <section className="card sidebar-card guidelines">
            <h3>Community notes</h3>
            <ul>
              <li><span>01</span> Share with curiosity</li>
              <li><span>02</span> Respond with kindness</li>
              <li><span>03</span> Make space for others</li>
            </ul>
          </section>
        </aside>
      </div>
    </>
  );
}
