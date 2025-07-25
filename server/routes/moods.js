// routes/moods.js
const express = require("express");
const router = express.Router();
const Journal = require("../models/Journal");
const authMiddleware = require("../middleware/authMiddleware");

// GET /api/moods
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Tìm các nhật ký của user, sắp xếp theo ngày tạo tăng dần
    const entries = await Journal.find({ userId }).sort({ createdAt: 1 });

    // Nếu không có entry nào
    if (!entries || entries.length === 0) {
      return res.json([]); // Gửi mảng rỗng, frontend sẽ hiển thị "Không có dữ liệu"
    }

    // Chuyển đổi thành dữ liệu biểu đồ
    const result = entries.map(entry => ({
      x: entry.createdAt.toISOString().split("T")[0], // YYYY-MM-DD
      y: typeof entry.moodScore === "number" ? Number(entry.moodScore.toFixed(2)) : 0
    }));

    res.json(result);
  } catch (error) {
    console.error("❌ Lỗi lấy dữ liệu mood:", error);
    res.status(500).json({ message: "Lỗi server khi lấy dữ liệu mood" });
  }
});

module.exports = router;
