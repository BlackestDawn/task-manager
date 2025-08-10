import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import "./navbar.css";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="navbar">
        <Link to="/">Home</Link>
        <Link to="/tasks">Tasks</Link>
        <Link to="/groups">Groups</Link>
        <Link to="/users">Users</Link>
        <Link to="/settings">Settings</Link>
        {/* <Link to="/about">About</Link> */}
      </div>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
});
