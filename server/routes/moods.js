// routes/moods.js
const express = require("express");
const router = express.Router();
const Journal = require("../models/Journal");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/moods
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const entries = await Journal.find({ userId }).sort({ createdAt: 1 });

    const result = entries.map(entry => ({
      createdAt: entry.createdAt,
      mood: entry.moodLabel,
    }));

    res.json(result);
  } catch (err) {
    console.error("Lỗi khi lấy dữ liệu mood:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
