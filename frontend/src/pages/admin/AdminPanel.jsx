import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { api, messageApi } from "../../api.js";
import { timeAgo } from "../../utils.js";

export default function AdminPanel() {
  const { user, signout } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [messages, setMessages] = useState([]);
  const [msgTotal, setMsgTotal] = useState(0);
  const [msgPage, setMsgPage] = useState(1);
  const [msgTotalPages, setMsgTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [itemSearch, setItemSearch] = useState("");
  const [itemType, setItemType] = useState("all");
  const [msgSearch, setMsgSearch] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [expandedMsg, setExpandedMsg] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadStats = () => api.adminStats().then(setStats).catch(console.error);
  useEffect(() => { loadStats(); }, []);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try { const d = await api.adminUsers({ search: userSearch }); setUsers(d.users); }
    catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  }, [userSearch]);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try { const d = await api.adminItems({ search: itemSearch, type: itemType }); setItems(d.items); }
    catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  }, [itemSearch, itemType]);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const d = await messageApi.getMessages({
        search: msgSearch,
        unreadOnly: unreadOnly ? "true" : "",
        page: msgPage,
        limit: 15,
      });
      setMessages(d.messages);
      setMsgTotal(d.total);
      setMsgTotalPages(d.totalPages);
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  }, [msgSearch, unreadOnly, msgPage]);

  useEffect(() => { if (tab === "users")    loadUsers();    }, [tab, loadUsers]);
  useEffect(() => { if (tab === "items")    loadItems();    }, [tab, loadItems]);
  useEffect(() => { if (tab === "messages") loadMessages(); }, [tab, loadMessages]);

  // Mark message read when expanded
  const handleExpandMsg = async (msg) => {
    setExpandedMsg(expandedMsg?._id === msg._id ? null : msg);
    if (!msg.isRead) {
      try {
        await messageApi.markRead(msg._id);
        setMessages((prev) => prev.map((m) => m._id === msg._id ? { ...m, isRead: true } : m));
        setStats((s) => s ? { ...s, unreadMessages: Math.max(0, s.unreadMessages - 1) } : s);
      } catch {}
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await messageApi.markAllRead();
      setMessages((prev) => prev.map((m) => ({ ...m, isRead: true })));
      setStats((s) => s ? { ...s, unreadMessages: 0 } : s);
      showToast("All messages marked as read.");
    } catch (e) { showToast(e.message, "error"); }
  };

  const handleDeleteMsg = async (id) => {
    try {
      await messageApi.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m._id !== id));
      setMsgTotal((t) => t - 1);
      setConfirmDel(null);
      if (expandedMsg?._id === id) setExpandedMsg(null);
      showToast("Message deleted.");
    } catch (e) { showToast(e.message, "error"); }
  };

  const doDeleteItem = async (id) => {
    try {
      await api.adminDeleteItem(id);
      setItems((p) => p.filter((i) => i._id !== id));
      setStats((s) => s ? { ...s, totalItems: s.totalItems - 1 } : s);
      showToast("Item deleted.");
    } catch (e) { showToast(e.message, "error"); }
    finally { setConfirmDel(null); }
  };

  const doDeleteUser = async (id) => {
    try {
      await api.adminDeleteUser(id);
      setUsers((p) => p.filter((u) => u._id !== id));
      setStats((s) => s ? { ...s, totalUsers: s.totalUsers - 1 } : s);
      showToast("User deleted.");
    } catch (e) { showToast(e.message, "error"); }
    finally { setConfirmDel(null); }
  };

  const toggleUser = async (id) => {
    try {
      const u = await api.adminToggleUser(id);
      setUsers((p) => p.map((x) => (x._id === id ? u : x)));
      showToast(`User ${u.isActive ? "activated" : "deactivated"}.`);
    } catch (e) { showToast(e.message, "error"); }
  };

  const changeRole = async (id, role) => {
    try {
      const u = await api.adminChangeRole(id, role);
      setUsers((p) => p.map((x) => (x._id === id ? u : x)));
      showToast(`Role changed to ${role}.`);
    } catch (e) { showToast(e.message, "error"); }
  };

  const STAT_CARDS = stats ? [
    { label: "Total Users",    value: stats.totalUsers,     icon: "👥", color: "#1565c0", bg: "#e3f2fd" },
    { label: "Total Items",    value: stats.totalItems,     icon: "📦", color: "#2e7d32", bg: "#e8f5e9" },
    { label: "Lost Reports",   value: stats.lostItems,      icon: "🔍", color: "#e65100", bg: "#fff3e0" },
    { label: "Found Reports",  value: stats.foundItems,     icon: "✅", color: "#6a1b9a", bg: "#f3e5f5" },
    { label: "Returned",       value: stats.returnedItems,  icon: "🎉", color: "#00695c", bg: "#e0f2f1" },
    { label: "Unread Messages",value: stats.unreadMessages, icon: "✉️",  color: "#c62828", bg: "#ffebee" },
  ] : [];

  const NAV = [
    { id: "dashboard", icon: "📊", label: "Dashboard" },
    { id: "messages",  icon: "✉️",  label: "Messages", badge: stats?.unreadMessages },
    { id: "items",     icon: "📦", label: "Manage Items" },
    { id: "users",     icon: "👥", label: "Manage Users" },
  ];

  return (
    <div className="dashboard-page">
      {/* Sidebar */}
      <aside className="dash-sidebar admin-sidebar">
        <div className="dash-brand"><Link to="/">Find-It</Link></div>
        <div className="dash-user-card">
          <div className="dash-avatar admin-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="dash-user-name">{user?.name}</div>
            <div className="dash-user-email">{user?.email}</div>
            <span className="dash-role-badge admin-badge">👑 Admin</span>
          </div>
        </div>
        <nav className="dash-nav">
          {NAV.map((n) => (
            <button key={n.id} className={`dash-nav-item ${tab === n.id ? "active" : ""}`} onClick={() => setTab(n.id)}>
              <span>{n.icon} {n.label}</span>
              {n.badge > 0 && <span className="nav-badge">{n.badge}</span>}
            </button>
          ))}
          <Link to="/" className="dash-nav-item">🌐 View Site</Link>
          <Link to="/report" className="dash-nav-item">➕ Report Item</Link>
        </nav>
        <button className="dash-signout" onClick={() => { signout(); nav("/"); }}>← Sign Out</button>
      </aside>

      {/* Main */}
      <main className="dash-main">

        {/* ── DASHBOARD ── */}
        {tab === "dashboard" && (
          <>
            <div className="dash-header">
              <div><h1 className="dash-title">Admin Dashboard</h1><p className="dash-sub">Platform-wide overview</p></div>
            </div>
            {stats ? (
              <div className="admin-stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {STAT_CARDS.map((c) => (
                  <div key={c.label} className="admin-stat-card" style={{ borderTop: `4px solid ${c.color}` }}>
                    <div className="admin-stat-icon" style={{ background: c.bg, color: c.color }}>{c.icon}</div>
                    <div className="admin-stat-num" style={{ color: c.color }}>{c.value}</div>
                    <div className="admin-stat-label">{c.label}</div>
                  </div>
                ))}
              </div>
            ) : <div className="spinner" />}
            <div className="admin-quick-actions">
              <h2 className="dash-table-title" style={{ marginBottom: 16 }}>Quick Actions</h2>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button className="btn btn-primary" onClick={() => setTab("messages")}>
                  ✉️ View Messages {stats?.unreadMessages > 0 && `(${stats.unreadMessages} unread)`}
                </button>
                <button className="btn btn-secondary" onClick={() => setTab("items")}>📦 Manage Items</button>
                <button className="btn btn-outline" onClick={() => setTab("users")}>👥 Manage Users</button>
                <Link to="/report" className="btn btn-green">+ Report Item</Link>
              </div>
            </div>
          </>
        )}

        {/* ── MESSAGES ── */}
        {tab === "messages" && (
          <>
            <div className="dash-header">
              <div>
                <h1 className="dash-title">Contact Messages</h1>
                <p className="dash-sub">
                  Messages sent via "Contact Owner" and "I Know This Owner" buttons — {msgTotal} total
                  {stats?.unreadMessages > 0 && <span style={{ color: "#c62828", fontWeight: 600 }}> · {stats.unreadMessages} unread</span>}
                </p>
              </div>
              {stats?.unreadMessages > 0 && (
                <button className="btn btn-outline" onClick={handleMarkAllRead}>✓ Mark All Read</button>
              )}
            </div>

            {/* Filters */}
            <div className="admin-filters">
              <input className="form-input admin-search"
                placeholder="🔍 Search by sender, item, or message…"
                value={msgSearch}
                onChange={(e) => setMsgSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadMessages()}
              />
              <label className="msg-filter-check">
                <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
                Unread only
              </label>
              <button className="btn btn-outline" onClick={loadMessages}>Search</button>
            </div>

            {/* Messages list */}
            {loading ? <div className="spinner" /> : messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <div className="empty-state-title">No messages yet</div>
                <div className="empty-state-sub">Messages from "Contact Owner" and "I Know This Owner" will appear here.</div>
              </div>
            ) : (
              <div className="msg-list">
                {messages.map((msg) => (
                  <div key={msg._id} className={`msg-card ${!msg.isRead ? "msg-unread" : ""} ${expandedMsg?._id === msg._id ? "msg-expanded" : ""}`}>
                    {/* Header row */}
                    <div className="msg-card-header" onClick={() => handleExpandMsg(msg)}>
                      <div className="msg-card-left">
                        {!msg.isRead && <span className="msg-dot" />}
                        <div className="msg-avatar">{msg.senderName?.[0]?.toUpperCase()}</div>
                        <div>
                          <div className="msg-sender">
                            {msg.senderName}
                            <span className="msg-email">{msg.senderEmail}</span>
                          </div>
                          <div className="msg-item-ref">
                            re: <span className={`badge badge-${msg.itemType}`} style={{ fontSize: "0.65rem", padding: "1px 6px" }}>{msg.itemType}</span>
                            {" "}<strong>{msg.itemName}</strong>
                          </div>
                        </div>
                      </div>
                      <div className="msg-card-right">
                        <span className="msg-time">{timeAgo(msg.createdAt)}</span>
                        <span className="msg-chevron">{expandedMsg?._id === msg._id ? "▲" : "▼"}</span>
                      </div>
                    </div>

                    {/* Preview (collapsed) */}
                    {expandedMsg?._id !== msg._id && (
                      <div className="msg-preview">{msg.message.slice(0, 120)}{msg.message.length > 120 ? "…" : ""}</div>
                    )}

                    {/* Full content (expanded) */}
                    {expandedMsg?._id === msg._id && (
                      <div className="msg-body">
                        <div className="msg-full-text">{msg.message}</div>

                        {/* Item info */}
                        {msg.item && (
                          <div className="msg-item-card">
                            {msg.item.image && (
                              <img src={msg.item.image} alt={msg.item.name} className="msg-item-img"
                                onError={(e) => e.target.style.display = "none"} />
                            )}
                            <div>
                              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>{msg.item.name}</div>
                              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>📍 {msg.item.location}</div>
                            </div>
                          </div>
                        )}

                        <div className="msg-meta-row">
                          <span>📧 <a href={`mailto:${msg.senderEmail}`} style={{ color: "var(--navy)" }}>{msg.senderEmail}</a></span>
                          <span>🕐 {new Date(msg.createdAt).toLocaleString()}</span>
                          {msg.sentBy && <span>👤 Account: {msg.sentBy.name}</span>}
                        </div>

                        <div className="msg-actions">
                          <a href={`mailto:${msg.senderEmail}?subject=Re: ${msg.itemName} on Find-It`}
                            className="btn btn-primary" style={{ fontSize: "0.85rem", padding: "8px 16px" }}>
                            ↩ Reply via Email
                          </a>
                          <button className="admin-delete-btn"
                            onClick={() => setConfirmDel({ kind: "message", id: msg._id, name: `message from ${msg.senderName}` })}>
                            🗑 Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Pagination */}
                {msgTotalPages > 1 && (
                  <div className="pagination" style={{ marginTop: 16 }}>
                    <button disabled={msgPage === 1} onClick={() => setMsgPage((p) => p - 1)}>‹</button>
                    {Array.from({ length: msgTotalPages }, (_, i) => i + 1).map((p) => (
                      <button key={p} className={msgPage === p ? "active" : ""} onClick={() => setMsgPage(p)}>{p}</button>
                    ))}
                    <button disabled={msgPage === msgTotalPages} onClick={() => setMsgPage((p) => p + 1)}>›</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* ── ITEMS ── */}
        {tab === "items" && (
          <>
            <div className="dash-header">
              <div><h1 className="dash-title">Manage Items</h1><p className="dash-sub">View and delete all reported items</p></div>
              <Link to="/report" className="btn btn-primary">+ Report Item</Link>
            </div>
            <div className="admin-filters">
              <input className="form-input admin-search" placeholder="🔍 Search by name or location…"
                value={itemSearch} onChange={(e) => setItemSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadItems()} />
              <select className="form-input" value={itemType} onChange={(e) => setItemType(e.target.value)} style={{ width: 150 }}>
                <option value="all">All Types</option>
                <option value="lost">Lost</option>
                <option value="found">Found</option>
              </select>
              <button className="btn btn-outline" onClick={loadItems}>Search</button>
            </div>
            <div className="dash-table-card">
              <div className="dash-table-header">
                <span className="dash-table-title">Items</span>
                <span className="dash-table-count">{items.length} records</span>
              </div>
              {loading ? <div className="spinner" /> : items.length === 0 ? (
                <div className="empty-state"><div className="empty-state-icon">📭</div><div className="empty-state-title">No items found</div></div>
              ) : (
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead><tr><th>Item</th><th>Type</th><th>Category</th><th>Location</th><th>Status</th><th>Reported By</th><th>Date</th><th>Action</th></tr></thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <div className="dash-item-name">
                              <img src={item.image} alt="" className="dash-item-thumb" onError={(e) => e.target.style.display = "none"} />
                              <span>{item.name}</span>
                            </div>
                          </td>
                          <td><span className={`badge badge-${item.type}`}>{item.type.toUpperCase()}</span></td>
                          <td style={{ textTransform: "capitalize" }}>{item.category}</td>
                          <td className="dash-location">📍 {item.location}</td>
                          <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                          <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{item.reportedBy?.name || "—"}</td>
                          <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{timeAgo(item.createdAt)}</td>
                          <td>
                            <button className="admin-delete-btn"
                              onClick={() => setConfirmDel({ kind: "item", id: item._id, name: item.name })}>
                              🗑 Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── USERS ── */}
        {tab === "users" && (
          <>
            <div className="dash-header">
              <div><h1 className="dash-title">Manage Users</h1><p className="dash-sub">Edit roles and manage accounts</p></div>
            </div>
            <div className="admin-filters">
              <input className="form-input admin-search" placeholder="🔍 Search by name or email…"
                value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadUsers()} />
              <button className="btn btn-outline" onClick={loadUsers}>Search</button>
            </div>
            <div className="dash-table-card">
              <div className="dash-table-header">
                <span className="dash-table-title">Users</span>
                <span className="dash-table-count">{users.length} accounts</span>
              </div>
              {loading ? <div className="spinner" /> : (
                <div className="dash-table-wrap">
                  <table className="dash-table">
                    <thead><tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} style={{ opacity: u.isActive ? 1 : 0.55 }}>
                          <td>
                            <div className="dash-item-name">
                              <div className="dash-avatar-sm">{u.name?.[0]?.toUpperCase()}</div>
                              <span>{u.name}</span>
                              {u._id === user?._id && <span style={{ fontSize: "0.7rem", color: "var(--green-dark)", marginLeft: 4 }}>(you)</span>}
                            </div>
                          </td>
                          <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{u.email}</td>
                          <td>
                            <select className="admin-role-select" value={u.role}
                              disabled={u._id === user?._id}
                              onChange={(e) => changeRole(u._id, e.target.value)}>
                              <option value="user">User</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td>
                            <span className={`dash-status-pill ${u.isActive ? "active-pill" : "inactive-pill"}`}>
                              {u.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>{timeAgo(u.createdAt)}</td>
                          <td>
                            {u._id !== user?._id && (
                              <div style={{ display: "flex", gap: 6 }}>
                                <button className={`admin-action-btn ${u.isActive ? "deactivate" : "activate"}`} onClick={() => toggleUser(u._id)}>
                                  {u.isActive ? "⏸ Deactivate" : "▶ Activate"}
                                </button>
                                <button className="admin-delete-btn" onClick={() => setConfirmDel({ kind: "user", id: u._id, name: u.name })}>
                                  🗑 Delete
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Confirm delete modal */}
      {confirmDel && (
        <div className="modal-overlay" onClick={() => setConfirmDel(null)}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">⚠️</div>
            <h3 className="confirm-title">Confirm Deletion</h3>
            <p className="confirm-text">
              Permanently delete <strong>"{confirmDel.name}"</strong>?<br />
              This action <strong>cannot be undone</strong>.
            </p>
            <div className="confirm-actions">
              <button className="btn btn-outline" onClick={() => setConfirmDel(null)}>Cancel</button>
              <button className="btn admin-delete-confirm-btn" onClick={() => {
                if (confirmDel.kind === "item") doDeleteItem(confirmDel.id);
                else if (confirmDel.kind === "user") doDeleteUser(confirmDel.id);
                else if (confirmDel.kind === "message") handleDeleteMsg(confirmDel.id);
              }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </div>
  );
}
