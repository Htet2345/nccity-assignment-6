const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:3101";

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (error) {
    throw new Error(
      "Unable to reach the API. Make sure JSON Server is running on port 3101."
    );
  }

  if (!response.ok) {
    let detail = "";
    try {
      const data = await response.json();
      detail = data.message || "";
    } catch (error) {
      // The server did not return JSON; the status message below is enough.
    }
    throw new Error(detail || `Request failed (${response.status}).`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  getUsers: () => request("/users"),
  getUser: (id) => request(`/users/${id}`),
  createUser: (user) =>
    request("/users", { method: "POST", body: JSON.stringify(user) }),
  updateUser: (id, user) =>
    request(`/users/${id}`, { method: "PATCH", body: JSON.stringify(user) }),

  getPosts: () => request("/posts?_sort=createdAt&_order=desc"),
  getPostsByUser: (userId) =>
    request(`/posts?userId=${encodeURIComponent(userId)}&_sort=createdAt&_order=desc`),
  createPost: (post) =>
    request("/posts", { method: "POST", body: JSON.stringify(post) }),
  deletePost: (id) => request(`/posts/${id}`, { method: "DELETE" }),

  getComments: () => request("/comments?_sort=createdAt&_order=asc"),
  createComment: (comment) =>
    request("/comments", { method: "POST", body: JSON.stringify(comment) }),
  deleteComment: (id) => request(`/comments/${id}`, { method: "DELETE" }),
};
