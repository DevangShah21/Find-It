import express from "express";
import Item from "../models/Item.js";
import Message from "../models/Message.js";
import { protect, adminOnly, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

const CATEGORIES = ["Electronics", "Pets", "Accessories", "Documents", "Keys", "Jewelry", "Clothing", "Other"];

// GET /api/items
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { type, category, status, search, sort = "newest", page = 1, limit = 9 } = req.query;
    const query = { deletedAt: null };
    if (type && type !== "all") query.type = type;
    if (category && category !== "all") query.category = category.toLowerCase();
    if (status && status !== "all") query.status = status;
    if (search) {
      query.$or = [
        { name: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
        { location: new RegExp(search, "i") },
      ];
    }
    const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, reward: { reward: -1 } };
    const total = await Item.countDocuments(query);
    const items = await Item.find(query)
      .sort(sortMap[sort] || sortMap.newest)
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .populate("reportedBy", "name");
    res.json({ items, total, totalPages: Math.ceil(total / Number(limit)), page: Number(page) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/recent", async (req, res) => {
  try {
    const recent = await Item.find({ status: { $ne: "returned" }, deletedAt: null })
      .sort({ createdAt: -1 }).limit(3);
    res.json(recent);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/returned", async (req, res) => {
  try {
    const item = await Item.findOne({ status: "returned" }).sort({ updatedAt: -1 });
    res.json(item || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/stats", async (req, res) => {
  try {
    const [itemsReported, successfullyReturned] = await Promise.all([
      Item.countDocuments({ deletedAt: null }),
      Item.countDocuments({ status: "returned", deletedAt: null }),
    ]);
    res.json({ itemsReported, successfullyReturned, averageReturnHours: 48 });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/categories", (req, res) => res.json(CATEGORIES));

router.get("/my", protect, async (req, res) => {
  try {
    const items = await Item.find({ reportedBy: req.user._id, deletedAt: null }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("reportedBy", "name");
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch { res.status(404).json({ error: "Item not found" }); }
});

router.post("/", protect, async (req, res) => {
  try {
    const { type, name, category, description, location, date, ownerName, ownerContact, reward, image } = req.body;
    if (!type || !name || !category || !description || !location || !date)
      return res.status(400).json({ error: "Missing required fields." });
    if (!["lost", "found"].includes(type))
      return res.status(400).json({ error: "type must be 'lost' or 'found'" });
    const item = await Item.create({
      type, status: type === "lost" ? "searching" : "found",
      name, category: category.toLowerCase(),
      subcategory: req.body.subcategory || "", description, location, date,
      image: image || undefined,
      owner: ownerName ? { name: ownerName, contact: ownerContact || "" } : undefined,
      reward: reward ? Number(reward) : null,
      reportedBy: req.user._id,
    });
    res.status(201).json(item);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.patch("/:id/claim", protect, async (req, res) => {
  try {
    const item = await Item.findByIdAndUpdate(req.params.id, { status: "returned" }, { new: true });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/items/:id/contact  — NOW SAVES TO DATABASE
router.post("/:id/contact", protect, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });

    const { name, email, message } = req.body;
    if (!name || !email || !message)
      return res.status(400).json({ error: "name, email, and message are required" });

    const saved = await Message.create({
      item: item._id,
      itemName: item.name,
      itemType: item.type,
      senderName: name,
      senderEmail: email,
      message,
      sentBy: req.user._id,
    });

    res.status(201).json({ success: true, message: "Your message has been sent.", id: saved._id });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE — admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    const item = await Item.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json({ success: true, message: "Item deleted." });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
