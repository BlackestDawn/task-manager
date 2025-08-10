import "./navbar.css";

function HeaderNavbar() {
  return (
    <nav>
      <ul className="navbar">
        <li><a href="/">Home</a></li>
        <li><a href="/tasks">Tasks</a></li>
        <li><a href="/Groups">Groups</a></li>
        <li><a href="/users">Users</a></li>
        <li><a href="/settings">Settings</a></li>
      </ul>
    </nav>
  )
}

export default HeaderNavbar
