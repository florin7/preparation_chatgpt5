import { NavLink, Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div>
      <nav className="nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/plans"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Plans
        </NavLink>
        <NavLink
          to="/billing"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Billing
        </NavLink>
        <NavLink
          to="/admin"
          className={({ isActive }) => (isActive ? "active" : "")}
        >
          Admin
        </NavLink>
      </nav>
      <main className="container stack-lg">
        <Outlet />
      </main>
    </div>
  );
}
