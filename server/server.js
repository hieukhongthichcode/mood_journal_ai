const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

// Load biến môi trường từ .env
dotenv.config();
const PORT = process.env.PORT || 5000;

// Import route
const authRoute = require('./routes/auth');
const journalsRoute = require('./routes/journals');
const moodsRoute = require('./routes/moods');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoute);          // Đăng ký / đăng nhập
app.use('/api/journals', journalsRoute);  // Ghi nhật ký
app.use('/api/moods', moodsRoute);        // Lấy dữ liệu mood cho biểu đồ

// Route kiểm tra
app.get("/", (req, res) => {
  res.send("🎉 Mood Journal API is running!");
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
