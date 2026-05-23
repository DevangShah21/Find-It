import { NavLink, useNavigate, Link } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar({ showSearch = false }) {
  const { user, signout, isAdmin } = useAuth();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (q.trim()) nav(`/lost?search=${encodeURIComponent(q.trim())}`);
  };

  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignout = () => { signout(); setMenuOpen(false); nav("/"); };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">Find-It</NavLink>
        <div className="navbar-links">
          <NavLink to="/" end className={({ isActive }) => isActive ? "active" : ""}>Home</NavLink>
          <NavLink to="/lost" className={({ isActive }) => isActive ? "active" : ""}>Lost Items</NavLink>
          <NavLink to="/found" className={({ isActive }) => isActive ? "active" : ""}>Found Items</NavLink>
          <NavLink to="/about" className={({ isActive }) => isActive ? "active" : ""}>About Us</NavLink>
        </div>
        <div className="navbar-actions">
          {showSearch && (
            <form className="navbar-search" onSubmit={handleSearch}>
              <span>🔍</span>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search missing belongings..." />
            </form>
          )}
          {user ? (
            <div className="user-menu-wrap" ref={menuRef}>
              <button className="user-menu-trigger" onClick={() => setMenuOpen((o) => !o)}>
                <div className="user-menu-avatar">{user.name?.[0]?.toUpperCase()}</div>
                <span className="user-menu-name">{user.name.split(" ")[0]}</span>
                {isAdmin && <span className="nav-admin-badge">Admin</span>}
                <span className="user-menu-caret">{menuOpen ? "▲" : "▼"}</span>
              </button>
              {menuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-name">{user.name}</div>
                    <div className="user-dropdown-email">{user.email}</div>
                  </div>
                  <div className="user-dropdown-divider" />
                  {isAdmin ? (
                    <Link to="/admin" className="user-dropdown-item" onClick={() => setMenuOpen(false)}>👑 Admin Panel</Link>
                  ) : (
                    <Link to="/dashboard" className="user-dropdown-item" onClick={() => setMenuOpen(false)}>📋 My Dashboard</Link>
                  )}
                  <Link to="/report" className="user-dropdown-item" onClick={() => setMenuOpen(false)}>➕ Report Item</Link>
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item signout-item" onClick={handleSignout}>← Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/signin" className="btn btn-outline" style={{ padding: "8px 16px" }}>Sign In</Link>
              <Link to="/report" className="btn btn-primary">Report an Item</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
