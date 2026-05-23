import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api.js";

const CATEGORIES = ["Electronics", "Pets", "Accessories", "Documents", "Keys", "Jewelry", "Clothing", "Other"];

export default function ReportItem() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [type, setType] = useState("found");
  const [form, setForm] = useState({
    name: "", category: "", subcategory: "", description: "",
    location: "", date: new Date().toISOString().split("T")[0],
    ownerName: user?.name || "", ownerContact: user?.email || "",
    reward: "", image: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.reportItem({ ...form, type });
      setSuccess(true);
      setTimeout(() => nav(type === "lost" ? "/lost" : "/found"), 2200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "100px 24px" }}>
        <div style={{ fontSize: "4rem", marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "var(--navy)", marginBottom: 8 }}>
          Report Submitted!
        </h2>
        <p style={{ color: "var(--text-muted)" }}>Your item has been added to the community. Redirecting…</p>
        <div className="spinner" style={{ marginTop: 32 }} />
      </div>
    );
  }

  return (
    <div className="form-page">
      {/* Hero */}
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "56px 24px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "start" }}>
        <div>
          <span className="form-hero-tag">
            {type === "found" ? "Found Someone's Joy?" : "Lost Something?"}
          </span>
          <h1 className="form-hero-title">
            {type === "found"
              ? <>Restore the <span>Connection.</span></>
              : <>Report a <span>Lost Item.</span></>}
          </h1>
          <p className="form-hero-text">
            {type === "found"
              ? "By listing a found item, you're not just returning an object — you're easing a heart. Our curator system handles the details with care."
              : "Describe your lost item in detail. Our community will scan active 'Found' reports to find the best match for you."}
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button className={`btn ${type === "found" ? "btn-primary" : "btn-outline"}`} onClick={() => setType("found")}>
              📦 I Found Something
            </button>
            <button className={`btn ${type === "lost" ? "btn-primary" : "btn-outline"}`} onClick={() => setType("lost")}>
              🔍 I Lost Something
            </button>
          </div>
        </div>
        <div className="form-hero-img">
          <img src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600" alt="Items on desk" />
          <div className="form-hero-quote">
            "Kindness is the language which the deaf can hear and the blind can see."
          </div>
        </div>
      </div>

      {/* Form */}
      <div style={{ padding: "0 24px 64px" }}>
        <form className="form-card" onSubmit={handleSubmit}>
          {/* Item Details */}
          <div className="form-section-title">
            <div className="form-icon">📋</div>
            Item Details
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input className="form-input" value={form.name} onChange={set("name")} required placeholder="e.g. Blue Nikon Camera" />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select className="form-input" value={form.category} onChange={set("category")} required>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c.toLowerCase()}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description * <span className="form-hint">(min. 10 characters)</span></label>
            <textarea
              className="form-input"
              value={form.description}
              onChange={set("description")}
              required
              minLength={10}
              rows={4}
              placeholder="Describe unique features, colour, brand, scratches, or any identifying details…"
            />
            <span className="form-hint">Detailed descriptions help verify the true owner faster.</span>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location {type === "found" ? "Found" : "Lost"} *</label>
              <div className="form-input-wrap">
                <span className="form-input-icon">📍</span>
                <input
                  className="form-input with-icon"
                  value={form.location}
                  onChange={set("location")}
                  required
                  placeholder="e.g. Central Park near North Pond"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Date {type === "found" ? "Found" : "Lost"} *</label>
              <input className="form-input" type="date" value={form.date} onChange={set("date")} required max={new Date().toISOString().split("T")[0]} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image URL <span className="form-hint">(optional)</span></label>
            <input className="form-input" value={form.image} onChange={set("image")} placeholder="https://…" />
          </div>

          {/* Your Information */}
          <div className="form-section-title" style={{ marginTop: 28 }}>
            <div className="form-icon">👤</div>
            Your Information
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input className="form-input" value={form.ownerName} onChange={set("ownerName")} placeholder="Full Name" />
            </div>
            <div className="form-group">
              <label className="form-label">Contact (Email or Phone)</label>
              <input className="form-input" value={form.ownerContact} onChange={set("ownerContact")} placeholder="contact@example.com" />
            </div>
          </div>

          {type === "lost" && (
            <div className="form-group">
              <label className="form-label">Reward Amount <span className="form-hint">(optional, ₹)</span></label>
              <input className="form-input" type="number" min="0" step="1" value={form.reward} onChange={set("reward")} placeholder="e.g. 50" style={{ maxWidth: 200 }} />
            </div>
          )}

          {error && (
            <div style={{ background: "#ffebee", color: "#c62828", padding: "12px 16px", borderRadius: 8, fontSize: "0.875rem", marginBottom: 8, borderLeft: "3px solid #c62828" }}>
              ⚠ {error}
            </div>
          )}

          <div className="form-footer">
            <div className="form-privacy">
              🔒 Your privacy is prioritized. Info shared only with verified owners.
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? "Submitting…" : `Submit ${type === "found" ? "Found" : "Lost"} Report →`}
            </button>
          </div>
        </form>

        {/* Feature cards */}
        <div className="form-features" style={{ maxWidth: 1140, margin: "0 auto" }}>
          <div className="feat-card">
            <div className="feat-icon">✅</div>
            <div className="feat-title">Verification First</div>
            <div className="feat-text">We require seekers to provide specific proof before connecting them to you. No more guessing games.</div>
          </div>
          <div className="feat-card dark">
            <div className="feat-icon">🤝</div>
            <div className="feat-title">Hand-Curated Match</div>
            <div className="feat-text">Our AI and human team scan active reports immediately to find the best match for what you've found.</div>
          </div>
          <div className="feat-card accent">
            <div className="feat-icon">🌱</div>
            <div className="feat-title">Community Impact</div>
            <div className="feat-text">Every item returned strengthens trust in our local communities. Thank you for being a part of it.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
