import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";
import Item from "../models/Item.js";

const SEED_ITEMS = [
  {
    type: "lost", status: "searching", name: "Classic Leather Watch",
    category: "accessories", subcategory: "watches",
    description: "Brown leather strap, white dial, analog. Engraving on back: 'To John, 2018'.",
    location: "Central Park, East Side", date: "2024-10-20",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400",
  },
  {
    type: "found", status: "found", name: "Silver Bluetooth Headphones",
    category: "electronics", subcategory: "audio",
    description: "Silver over-ear Sony WH-1000XM4 headphones. Found in black case.",
    location: "Grand Central Terminal", date: "2024-10-20",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  },
  {
    type: "found", status: "found", name: "Brown Bi-fold Wallet",
    category: "accessories", subcategory: "wallets",
    description: "Brown leather bi-fold wallet. Contains some cards (no cash).",
    location: "SoHo Coffee House", date: "2024-10-20",
    image: "https://images.unsplash.com/photo-1612404459859-2bdd4c43e99d?w=400",
  },
  {
    type: "lost", status: "searching", name: "Vintage Leather Portfolio",
    category: "accessories", subcategory: "bags",
    description: "Hand-stitched tan leather portfolio with personal sketches and a fountain pen.",
    location: "Central Library, Sector 4", date: "2023-10-12",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400",
    reward: 50,
    owner: { name: "Alice R.", contact: "alice@example.com" },
  },
  {
    type: "lost", status: "searching", name: "iPhone 14 Pro Max",
    category: "electronics", subcategory: "mobile",
    description: "Space Black with a clear MagSafe case. Small scratch on top left corner.",
    location: "Union Square Metro Station", date: "2024-10-19",
    image: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400",
  },
  {
    type: "found", status: "found", name: "Keychain with Blue Owl",
    category: "keys", subcategory: "house keys",
    description: "A set of three keys and a car fob. Found at Westside Mall entrance.",
    location: "Westside Mall Entrance", date: "2024-10-20",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400",
    verifiedLocation: true,
  },
  {
    type: "found", status: "returned", name: "Leica M6 Camera",
    category: "electronics", subcategory: "camera",
    description: "Classic Leica M6 film camera with 50mm lens. Reunited with owner.",
    location: "Chelsea, London", date: "2024-10-18",
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
    verifiedLocation: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Item.deleteMany({});
    console.log("🗑  Cleared existing data");

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@findit.com",
      password: "admin123",
      role: "admin",
    });
    console.log(`👑 Admin created: admin@findit.com / admin123`);

    // Create regular user
    const user = await User.create({
      name: "Test User",
      email: "user@findit.com",
      password: "user1234",
      role: "user",
    });
    console.log(`👤 User created: user@findit.com / user1234`);

    // Seed items
    for (const itemData of SEED_ITEMS) {
      await Item.create({ ...itemData, reportedBy: user._id });
    }
    console.log(`📦 ${SEED_ITEMS.length} items seeded`);

    console.log("\n✅ Database seeded successfully!");
    console.log("─────────────────────────────────");
    console.log("Admin login → admin@findit.com  / admin123");
    console.log("User login  → user@findit.com   / user1234");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
}

seed();
