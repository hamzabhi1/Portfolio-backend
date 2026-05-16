import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  title: String,
  desc: String,
  tech: [String],
  image: String   // 🔥 IMPORTANT ADD THIS
});

export default mongoose.model("Project", projectSchema);