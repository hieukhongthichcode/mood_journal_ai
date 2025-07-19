const router = require("express").Router();
const Journal = require("../models/Journal");
const verifyToken = require("../middleware/verifyToken");
const axios = require("axios");

router.post("/", verifyToken, async (req, res) => {
    const { title, content } = req.body;

    try {
        const response = await axios.post(
            "https://api-inference.huggingface.co/models/michellejieli/emotion_text_classifier",
            { inputs: content },
            {
                headers: {
                    Authorization: `Bearer ${process.env.HF_API_KEY}`,
                },
            }
        );

        const predictions = response.data[0];

        if (!predictions || predictions.length === 0) {
            return res.status(400).json({
                error: "Phân tích cảm xúc thất bại: Kết quả trống.",
                rawData: response.data,
            });
        }

        const topEmotion = predictions.reduce((prev, current) => {
            return (prev.score > current.score) ? prev : current;
        });

        // Lưu vào database theo schema hiện tại
        const newJournal = new Journal({
            userId: req.user.id,
            title,
            content,
            moodLabel: topEmotion.label,
            moodScore: topEmotion.score,
        });

        const savedJournal = await newJournal.save();

        // Trả về đúng định dạng bạn muốn
        res.status(201).json({
            message: "Tạo nhật ký thành công",
            data: {
                _id: savedJournal._id,
                userId: savedJournal.userId,
                title: savedJournal.title,
                content: savedJournal.content,
                mood: {
                    label: savedJournal.moodLabel,
                    score: savedJournal.moodScore
                },
                date: savedJournal.date
            }
        });

    } catch (err) {
        console.error("Lỗi khi gọi API HuggingFace:", err.message);

        if (err.response) {
            return res.status(500).json({
                error: "Lỗi từ Hugging Face API",
                details: err.response.data,
            });
        }

        res.status(500).json({
            error: "Lỗi server khi tạo nhật ký",
            details: err.message,
        });
    }
});

module.exports = router;
