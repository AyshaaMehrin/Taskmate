
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const assignmentRoutes = require("./routes/assignment");
app.use(cors());
app.use(express.json());
app.use("/api/assignments", assignmentRoutes);
app.get("/", (req, res) => {
  res.send("TaskMate backend is running!");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "TaskMate API is working!",
  });
});

async function startServer() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error("Missing MONGO_URI in server/.env. Add your MongoDB connection string.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);

    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`TaskMate server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
