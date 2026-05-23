import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import ItemCard from "../components/ItemCard.jsx";
import ItemModal from "../components/ItemModal.jsx";

export default function Home() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [returned, setReturned] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = () =>
    Promise.all([api.getStats(), api.getRecentItems(), api.getReturnedItem()])
      .then(([s, r, ret]) => { setStats(s); setRecent(r); setReturned(ret); })
      .catch(console.error)
      .finally(() => setLoading(false));

  useEffect(() => { loadData(); }, []);

  const handleDeleted = (id) => {
    setRecent((prev) => prev.filter((i) => (i._id || i.id) !== id));
  };

  return (
    <>
      {/* ── Hero ── */}
      <section>
        <div className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Restoring what's lost<br />with <em>gentle care.</em>
            </h1>
            <p className="hero-subtitle">
              A curated space designed to reunite owners with their cherished belongings.
              No clutter, just clarity and a path back home.
            </p>
            <div className="hero-actions">
              <Link to="/lost" className="btn btn-primary">🔍 I've Lost Something</Link>
              <Link to="/report" className="btn btn-secondary">➕ I've Found Something</Link>
            </div>
          </div>
          <div className="hero-image-wrap">
            <img
              src={returned?.image || "https://images.unsplash.com/photo-1558618047-f4e29b8a0d8b?w=800"}
              alt="Lost key on fabric"
            />
            {returned && (
              <div className="hero-badge">
                <div className="hero-badge-label">Recently Returned</div>
                <div className="hero-badge-name">{returned.name}</div>
                <div className="hero-badge-loc">Reunited in {returned.location}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      {!loading && stats && (
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-number">{stats.itemsReported.toLocaleString()}</div>
            <div className="stat-label">Items Reported</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-icon">✅</div>
            <div className="stat-number">{stats.successfullyReturned}</div>
            <div className="stat-label">Successfully Returned</div>
          </div>
          <div className="stat-card stat-wide">
            <div className="stat-wide-icon">⏱</div>
            <div>
              <div className="stat-wide-title">Average Return Time</div>
              <div className="stat-wide-sub">
                Most items are claimed within {stats.averageReturnHours} hours of being found.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Recent Discoveries ── */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Recent Discoveries</h2>
            <p className="section-sub">The latest entries in our lost and found community.</p>
          </div>
          <Link to="/lost" className="view-all">View All Activity →</Link>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <div className="empty-state-title">No items yet</div>
            <div className="empty-state-sub">Be the first to <Link to="/report">report an item</Link>.</div>
          </div>
        ) : (
          <div className="items-grid">
            {recent.map((item) => (
              <ItemCard
                key={item._id || item.id}
                item={item}
                onClick={setSelected}
                onDelete={isAdmin ? (it) => {
                  if (confirm(`Delete "${it.name}"?`))
                    api.deleteItem(it._id || it.id)
                      .then(() => handleDeleted(it._id || it.id))
                      .catch((e) => alert(e.message));
                } : undefined}
              />
            ))}
          </div>
        )}
      </section>

      {selected && (
        <ItemModal
          item={selected}
          onClose={() => setSelected(null)}
          onDeleted={(id) => { handleDeleted(id); setSelected(null); }}
        />
      )}
    </>
  );
}
