import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="not-found container">
      <span>404</span>
      <h1>This path has gone quiet.</h1>
      <p>The page you requested does not exist or may have moved.</p>
      <Link className="button" to="/">Return home</Link>
    </div>
  );
}
