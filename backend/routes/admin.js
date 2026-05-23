import express from "express";
import User from "../models/User.js";
import Item from "../models/Item.js";
import Message from "../models/Message.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();
router.use(protect, adminOnly);

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const [totalUsers, totalItems, lostItems, foundItems, returnedItems, unreadMessages] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments({ deletedAt: null }),
      Item.countDocuments({ type: "lost", deletedAt: null }),
      Item.countDocuments({ type: "found", deletedAt: null }),
      Item.countDocuments({ status: "returned", deletedAt: null }),
      Message.countDocuments({ isRead: false }),
    ]);
    res.json({ totalUsers, totalItems, lostItems, foundItems, returnedItems, unreadMessages });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── MESSAGES ──────────────────────────────────────────

// GET /api/admin/messages
router.get("/messages", async (req, res) => {
  try {
    const { page = 1, limit = 15, unreadOnly = "false", search = "" } = req.query;
    const query = {};
    if (unreadOnly === "true") query.isRead = false;
    if (search) {
      query.$or = [
        { senderName:  new RegExp(search, "i") },
        { senderEmail: new RegExp(search, "i") },
        { itemName:    new RegExp(search, "i") },
        { message:     new RegExp(search, "i") },
      ];
    }
    const total = await Message.countDocuments(query);
    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("item", "name type image location")
      .populate("sentBy", "name email");
    res.json({ messages, total, totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/admin/messages/:id/read  — mark one as read
router.patch("/messages/:id/read", async (req, res) => {
  try {
    const msg = await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
    if (!msg) return res.status(404).json({ error: "Message not found" });
    res.json(msg);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/admin/messages/read-all  — mark all as read
router.patch("/messages/read-all", async (req, res) => {
  try {
    await Message.updateMany({ isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/admin/messages/:id
router.delete("/messages/:id", async (req, res) => {
  try {
    await Message.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── USERS ─────────────────────────────────────────────

router.get("/users", async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = search
      ? { $or: [{ name: new RegExp(search, "i") }, { email: new RegExp(search, "i") }] }
      : {};
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));
    res.json({ users, total, totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role))
      return res.status(400).json({ error: "role must be 'user' or 'admin'" });
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ error: "Cannot change your own role." });
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.patch("/users/:id/toggle", async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ error: "Cannot deactivate yourself." });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found." });
    user.isActive = !user.isActive;
    await user.save();
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/users/:id", async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ error: "Cannot delete yourself." });
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── ITEMS ─────────────────────────────────────────────

router.get("/items", async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, search } = req.query;
    const query = { deletedAt: null };
    if (type && type !== "all") query.type = type;
    if (status && status !== "all") query.status = status;
    if (search) query.$or = [{ name: new RegExp(search, "i") }, { location: new RegExp(search, "i") }];
    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("reportedBy", "name email");
    res.json({ items, total, totalPages: Math.ceil(total / Number(limit)) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete("/items/:id", async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found." });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
