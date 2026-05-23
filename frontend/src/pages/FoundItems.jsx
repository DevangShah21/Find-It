import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import ItemCard from "../components/ItemCard.jsx";
import ItemModal from "../components/ItemModal.jsx";

const CATS = ["All Items", "Electronics", "Pets", "Accessories", "Keys", "Jewelry", "Documents"];

export default function FoundItems() {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);

  const cat = searchParams.get("category") || "All Items";
  const sort = searchParams.get("sort") || "newest";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { type: "found", sort, page, limit: 9 };
      if (cat !== "All Items") params.category = cat;
      const data = await api.getItems(params);
      setItems(data.items);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [cat, sort, page]);

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

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Found Items</h1>
        <p className="page-sub">
          Items discovered and reported by community members. If something looks
          familiar, reach out to reunite it with its owner.
        </p>
      </div>

      <div className="section">
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
            </select>
          </div>
        </div>

        {loading ? (
          <div className="spinner" />
        ) : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <div className="empty-state-title">No found items yet</div>
            <div className="empty-state-sub">
              Found something? <Link to="/report">Report it</Link> to help reunite it with its owner.
            </div>
          </div>
        ) : (
          <>
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

            {totalPages > 1 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>‹</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                  <button key={p} className={page === p ? "active" : ""} onClick={() => setPage(p)}>{p}</button>
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
          onDeleted={() => { setSelected(null); load(); }}
        />
      )}
    </>
  );
}
