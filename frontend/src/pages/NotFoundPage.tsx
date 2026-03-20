import { NavLink } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="not-found-page">
      <h1>Page not found</h1>
      <p>The page you requested does not exist in this MEDIWO demo workspace.</p>
      <NavLink to="/" className="btn btn-primary">
        Return Home
      </NavLink>
    </div>
  );
}
