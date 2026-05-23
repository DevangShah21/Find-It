import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";
import { timeAgo } from "../utils.js";

export default function ItemModal({ item, onClose, onClaimed, onDeleted }) {
  const { user, isAdmin } = useAuth();
  const nav = useNavigate();
  const [showContact, setShowContact] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", email: user?.email || "", message: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const id = item._id || item.id;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleContact = async (e) => {
    e.preventDefault();
    if (!user) { nav("/signin"); return; }
    setLoading(true);
    try {
      await api.contactOwner(id, form);
      showToast("Message sent! The reporter will be in touch.");
      setShowContact(false);
      setForm({ name: user?.name || "", email: user?.email || "", message: "" });
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    if (!user) { nav("/signin"); return; }
    if (!confirm("Mark this item as successfully returned?")) return;
    try {
      const updated = await api.claimItem(id);
      showToast("Item marked as returned! 🎉");
      if (onClaimed) onClaimed(updated);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Permanently delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteItem(id);
      showToast("Item deleted.");
      setTimeout(() => { onClose(); if (onDeleted) onDeleted(id); }, 800);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="modal">
          <div className="modal-img">
            <img src={item.image} alt={item.name} />
            <div className="modal-img-badge">
              <span className={`badge badge-${item.type}`}>
                {item.type === "lost" ? "LOST" : "FOUND"}
              </span>
            </div>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="modal-body">
            <div className="modal-meta">
              <span style={{ textTransform: "capitalize" }}>{item.category}</span>
              {item.subcategory && ` • ${item.subcategory}`}
              {item.verifiedLocation && (
                <span style={{ color: "var(--green-dark)", marginLeft: 8 }}>✔ Verified Location</span>
              )}
            </div>

            <div className="modal-title">{item.name}</div>
            <div className="modal-desc">{item.description}</div>

            {item.reward && (
              <div className="modal-reward">
                <span>🎁</span>
                <span className="modal-reward-label">Reward Offered</span>
                <span className="modal-reward-amount">₹{item.reward}</span>
              </div>
            )}

            <div className="modal-details">
              <div className="modal-detail-item">📍 {item.location}</div>
              <div className="modal-detail-item">
                📅 {item.type === "lost" ? "Lost on" : "Found on"} {item.date}
              </div>
              <div className="modal-detail-item">
                ⏱ {timeAgo(item.createdAt || item.reportedAt)}
              </div>
              {item.reportedBy?.name && (
                <div className="modal-detail-item">👤 Reported by {item.reportedBy.name}</div>
              )}
              {item.status === "returned" && (
                <div className="modal-detail-item" style={{ color: "var(--green-dark)", fontWeight: 600 }}>
                  ✔ Successfully Returned
                </div>
              )}
            </div>

            <div className="modal-actions">
              {item.status !== "returned" && (
                <>
                  <button className="btn btn-primary" onClick={() => {
                    if (!user) { nav("/signin"); return; }
                    setShowContact((v) => !v);
                  }}>
                    {item.type === "lost" ? "📞 Contact Owner" : "📞 I Know This Owner"}
                  </button>
                  {item.type === "found" && (
                    <button className="btn btn-green" onClick={handleClaim}>
                      Claim Item ✓
                    </button>
                  )}
                </>
              )}
              {isAdmin && (
                <button className="btn" style={{ background: "#c62828", color: "white" }} onClick={handleDelete}>
                  🗑 Delete
                </button>
              )}
              <button className="btn btn-outline" onClick={onClose}>Close</button>
            </div>

            {showContact && (
              <div className="contact-form">
                <div className="contact-form-title">Send a Message</div>
                <form onSubmit={handleContact}>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Your Name</label>
                      <input
                        className="form-input"
                        value={form.name}
                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        required
                        placeholder="Full Name"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Email</label>
                      <input
                        className="form-input"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        required
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-input"
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      required
                      placeholder="Describe how you can verify ownership or provide details..."
                    />
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={loading}>
                    {loading ? "Sending..." : "Send Message →"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
    </>
  );
}
