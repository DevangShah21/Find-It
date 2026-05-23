import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["lost", "found"], required: true },
    status: { type: String, enum: ["searching", "found", "returned"], default: "searching" },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, lowercase: true },
    subcategory: { type: String, default: "" },
    description: { type: String, required: true, minlength: 10 },
    location: { type: String, required: true },
    date: { type: String, required: true },
    image: {
      type: String,
      default: "https://images.unsplash.com/photo-1614285680340-a5f4fcecf5e5?w=400",
    },
    owner: {
      name: { type: String, default: "" },
      contact: { type: String, default: "" },
    },
    reward: { type: Number, default: null },
    verifiedLocation: { type: Boolean, default: false },
    reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Virtual for reportedAt compatibility with frontend
itemSchema.virtual("reportedAt").get(function () {
  return this.createdAt;
});

itemSchema.set("toJSON", { virtuals: true });
itemSchema.set("toObject", { virtuals: true });

export default mongoose.model("Item", itemSchema);
