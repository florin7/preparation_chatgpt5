import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="container">
      <h1>404 - Not Found</h1>
      <p>This page does not exist.</p>
      <Link to="/" className="button">
        Go Home
      </Link>
    </div>
  );
}
