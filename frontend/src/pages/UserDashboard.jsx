import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import { timeAgo } from "../utils.js";

const STATUS_STYLE = {
  searching: { bg: "#e3f2fd", color: "#1565c0" },
  found:     { bg: "#e8f5e9", color: "#2e7d32" },
  returned:  { bg: "#f3e5f5", color: "#6a1b9a" },
};

export default function UserDashboard() {
  const { user, signout } = useAuth();
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    api.getMyItems()
      .then(setItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = tab === "all" ? items : items.filter((i) => i.type === tab);

  const stats = {
    total: items.length,
    lost: items.filter((i) => i.type === "lost").length,
    found: items.filter((i) => i.type === "found").length,
    returned: items.filter((i) => i.status === "returned").length,
  };

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="dash-brand"><Link to="/">Find-It</Link></div>

        <div className="dash-user-card">
          <div className="dash-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="dash-user-name">{user?.name}</div>
            <div className="dash-user-email">{user?.email}</div>
            <span className="dash-role-badge">👤 User</span>
          </div>
        </div>

        <nav className="dash-nav">
          {[
            { id: "all",   icon: "📋", label: "All Reports" },
            { id: "lost",  icon: "🔍", label: "Lost Reports" },
            { id: "found", icon: "📦", label: "Found Reports" },
          ].map((n) => (
            <button
              key={n.id}
              className={`dash-nav-item ${tab === n.id ? "active" : ""}`}
              onClick={() => setTab(n.id)}
            >
              {n.icon} {n.label}
            </button>
          ))}
          <Link to="/report" className="dash-nav-item">➕ Report New Item</Link>
          <Link to="/lost" className="dash-nav-item">🌐 Browse Items</Link>
          <Link to="/" className="dash-nav-item">🏠 Home</Link>
        </nav>

        <button className="dash-signout" onClick={() => { signout(); nav("/"); }}>
          ← Sign Out
        </button>
      </aside>

      {/* Main content */}
      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">My Dashboard</h1>
            <p className="dash-sub">Welcome back, {user?.name?.split(" ")[0]}. Track your reports below.</p>
          </div>
          <Link to="/report" className="btn btn-primary">+ Report New Item</Link>
        </div>

        {/* Stats */}
        <div className="dash-stats">
          <div className="dash-stat-card">
            <div className="dash-stat-num">{stats.total}</div>
            <div className="dash-stat-label">Total Reports</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-num">{stats.lost}</div>
            <div className="dash-stat-label">Lost Reports</div>
          </div>
          <div className="dash-stat-card">
            <div className="dash-stat-num">{stats.found}</div>
            <div className="dash-stat-label">Found Reports</div>
          </div>
          <div className="dash-stat-card highlight">
            <div className="dash-stat-num">{stats.returned}</div>
            <div className="dash-stat-label">Returned ✓</div>
          </div>
        </div>

        {/* Table */}
        <div className="dash-table-card">
          <div className="dash-table-header">
            <span className="dash-table-title">
              {tab === "all" ? "All Reports" : tab === "lost" ? "Lost Items" : "Found Items"}
            </span>
            <span className="dash-table-count">{filtered.length} items</span>
          </div>

          {loading ? (
            <div className="spinner" />
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <div className="empty-state-title">No reports yet</div>
              <div className="empty-state-sub">
                <Link to="/report">Report your first item →</Link>
              </div>
            </div>
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Reported</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="dash-item-name">
                          <img src={item.image} alt={item.name} className="dash-item-thumb" onError={(e) => e.target.style.display = "none"} />
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${item.type}`}>{item.type.toUpperCase()}</span>
                      </td>
                      <td style={{ textTransform: "capitalize" }}>{item.category}</td>
                      <td className="dash-location">📍 {item.location}</td>
                      <td>
                        <span className="dash-status-pill" style={STATUS_STYLE[item.status] || {}}>
                          {item.status}
                        </span>
                      </td>
                      <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        {timeAgo(item.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
