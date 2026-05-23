import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import { timeAgo } from "../utils.js";
import ItemCard from "../components/ItemCard.jsx";
import ItemModal from "../components/ItemModal.jsx";

const CATS = ["All Items", "Electronics", "Pets", "Accessories", "Documents", "Keys", "Jewelry"];

export default function LostItems() {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [featured, setFeatured] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);

  const cat = searchParams.get("category") || "All Items";
  const sort = searchParams.get("sort") || "newest";
  const search = searchParams.get("search") || "";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { type: "lost", sort, page, limit: 6 };
      if (cat !== "All Items") params.category = cat;
      if (search) params.search = search;

      const data = await api.getItems(params);
      const rewardItem = data.items.find((i) => i.reward);
      const featuredItem = rewardItem || data.items[0] || null;
      setFeatured(featuredItem);
      setItems(featuredItem ? data.items.filter((i) => (i._id || i.id) !== (featuredItem._id || featuredItem.id)) : data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [cat, sort, search, page]);

  useEffect(() => { load(); }, [load]);

  const setCategory = (c) => {
    setPage(1);
    const p = new URLSearchParams(searchParams);
    if (c === "All Items") p.delete("category"); else p.set("category", c);
    setSearchParams(p);
  };

  const handleDelete = (it) => {
    if (!confirm(`Delete "${it.name}"?`)) return;
    api.deleteItem(it._id || it.id)
      .then(() => load())
      .catch((e) => alert(e.message));
  };

  const handleDeleted = (id) => { setSelected(null); load(); };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Reuniting with What's Lost</h1>
        <p className="page-sub">
          Browse through reported missing items. Our curated process ensures every
          detail is handled with precision and empathy.
        </p>
      </div>

      <div className="section">
        {/* Filter bar */}
        <div className="filters-bar">
          {CATS.map((c) => (
            <button
              key={c}
              className={`filter-chip ${cat === c ? "active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
          <div className="sort-select">
            <span>Sorted by:</span>
            <select
              value={sort}
              onChange={(e) => {
                setPage(1);
                setSearchParams((p) => { p.set("sort", e.target.value); return p; });
              }}
            >
              <option value="newest">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="reward">Reward Offered</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : !featured && items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">No lost items found</div>
            <div className="empty-state-sub">
              Try adjusting your filters or <Link to="/report">report a lost item</Link>.
            </div>
          </div>
        ) : (
          <>
            {/* Featured card */}
            {featured && (
              <div className="featured-item" style={{ cursor: "pointer" }}
                onClick={() => setSelected(featured)}>
                <div className="featured-item-img">
                  <img src={featured.image} alt={featured.name} />
                </div>
                <div className="featured-item-body">
                  <div className="featured-item-meta">
                    <span style={{ textTransform: "capitalize" }}>{featured.category}</span>
                    {featured.reward && " • REWARD OFFERED"}
                    {featured.reward && (
                      <span className="featured-item-reward" style={{ marginLeft: 16 }}>
                        ₹{featured.reward}
                      </span>
                    )}
                  </div>
                  <div className="featured-item-name">{featured.name}</div>
                  <div className="featured-item-desc">{featured.description}</div>
                  <div className="featured-item-detail">📍 {featured.location}</div>
                  <div className="featured-item-detail" style={{ marginTop: 6 }}>
                    📅 Lost on {featured.date}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button
                      className="btn btn-primary"
                      onClick={(e) => { e.stopPropagation(); setSelected(featured); }}
                    >
                      Contact Owner
                    </button>
                    {isAdmin && (
                      <button
                        className="btn"
                        style={{ background: "#c62828", color: "white" }}
                        onClick={(e) => { e.stopPropagation(); handleDelete(featured); }}
                      >
                        🗑 Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Grid */}
            <div className="items-grid">
              {items.map((item) => (
                <ItemCard
                  key={item._id || item.id}
                  item={item}
                  onClick={setSelected}
                  onDelete={isAdmin ? handleDelete : undefined}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={page === p ? "active" : ""} onClick={() => setPage(p)}>
                    {p}
                  </button>
                ))}
                <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
              </div>
            )}
            <div style={{ textAlign: "center", marginTop: 12, fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Page {page} of {totalPages} · {total} items total
            </div>
          </>
        )}
      </div>

      {selected && (
        <ItemModal
          item={selected}
          onClose={() => setSelected(null)}
          onClaimed={() => { setSelected(null); load(); }}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
