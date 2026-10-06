import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink className="brand" to="/" aria-label="Common Ground home">
          <span className="brand-mark">CG</span>
          <span>Common Ground</span>
        </NavLink>

        <nav className="main-nav" aria-label="Main navigation">
          <NavLink to="/" end>
            Home
          </NavLink>
          {user ? (
            <>
              <NavLink to="/profile">Profile</NavLink>
              <button className="nav-button" onClick={handleLogout} type="button">
                Log out
              </button>
              <NavLink className="avatar-link" to="/profile" aria-label="Your profile">
                <img src={user.profile_url} alt="" />
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink className="button button-small" to="/register">
                Join now
              </NavLink>
            </>
          )}
        </nav>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <span>Common Ground</span>
        <span>A friendly place to share what matters.</span>
      </footer>
    </div>
  );
}
