const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const router = require("./routes");

dotenv.config();

const app = express();

// 🔧 Middleware
app.use(cors());
app.use(express.json());

// 🧩 API Routes
app.use("/api", router);

// 🩵 Root endpoint
app.get("/", (req, res) => {
  res.send("🤖 AI Matching Platform API is running...");
});

// 🚀 Start server after DB connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () =>
      console.log(`🌍 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
