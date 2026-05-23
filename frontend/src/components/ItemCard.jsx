import { useAuth } from "../context/AuthContext.jsx";
import { timeAgo } from "../utils.js";

export default function ItemCard({ item, onClick, onDelete }) {
  const { isAdmin } = useAuth();
  const id = item._id || item.id;

  return (
    <div className="item-card" onClick={() => onClick && onClick(item)}>
      <div className="item-card-img">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1614285680340-a5f4fcecf5e5?w=400"; }}
        />
        <div className="item-card-badge">
          <span className={`badge badge-${item.type}`}>
            {item.type === "lost" ? "LOST" : "FOUND"}
          </span>
        </div>
        {isAdmin && onDelete && (
          <button
            className="item-card-delete"
            title="Delete item (Admin)"
            onClick={(e) => { e.stopPropagation(); onDelete(item); }}
          >
            🗑 Delete
          </button>
        )}
      </div>
      <div className="item-card-body">
        <div className="item-card-name">{item.name}</div>
        <div className="item-card-loc">📍 {item.location}</div>
        {item.reward && (
          <div style={{ fontSize: "0.78rem", color: "#e65100", fontWeight: 600, marginTop: 4 }}>
            🎁 ₹{item.reward} reward
          </div>
        )}
        <div className="item-card-footer">
          <span className="item-card-time">
            {item.type === "lost" ? "Reported" : "Found"}{" "}
            {timeAgo(item.createdAt || item.reportedAt)}
          </span>
          <span className="item-card-detail">Details →</span>
        </div>
      </div>
    </div>
  );
}
