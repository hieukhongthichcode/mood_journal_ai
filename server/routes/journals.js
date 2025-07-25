const router = require("express").Router();
const Journal = require("../models/Journal");
const verifyToken = require("../middleware/verifyToken");
const axios = require("axios");

// Danh sách từ khóa song ngữ
const emotionKeywords = {
    joy: [
        "vui", "hạnh phúc", "phấn khởi", "hào hứng", "yêu đời", "tuyệt vời",
        "happy", "joy", "excited", "delighted", "cheerful", "great"
    ],
    anger: [
        "tức giận", "giận", "bực", "nổi điên", "bực bội",
        "angry", "mad", "furious", "rage", "annoyed"
    ],
    sadness: [
        "buồn", "chán", "tệ", "khóc", "mệt mỏi", "kiệt sức",
        "sad", "upset", "depressed", "cry", "exhausted"
    ],
    fear: [
        "sợ", "hoảng loạn", "run", "lo lắng", "bất an",
        "scared", "afraid", "fear", "panic", "anxious"
    ],
    disgust: [
        "ghê tởm", "khó chịu", "kinh tởm", "gớm",
        "disgust", "disgusted", "gross", "nauseous"
    ],
    neutral: []
};

// Hàm nhận diện từ khóa
function detectEmotionByKeywords(text) {
    const textLower = text.toLowerCase();
    for (const [emotion, keywords] of Object.entries(emotionKeywords)) {
        for (const keyword of keywords) {
            if (textLower.includes(keyword)) {
                return emotion;
            }
        }
    }
    return null; // Không tìm thấy từ khóa
}

// POST /api/journals
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
            return prev.score > current.score ? prev : current;
        });

        const keywordEmotion = detectEmotionByKeywords(content);
        let finalEmotionLabel = topEmotion.label;

        if (keywordEmotion) {
            console.log(`Override cảm xúc từ model thành "${keywordEmotion}" do khớp từ khóa.`);
            finalEmotionLabel = keywordEmotion;
        }

        const newJournal = new Journal({
            userId: req.user.id,
            title,
            content,
            moodLabel: finalEmotionLabel,
            moodScore: topEmotion.score
        });

        const savedJournal = await newJournal.save();

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

// GET /api/journals/moods
router.get("/moods", verifyToken, async (req, res) => {
    try {
        const data = await Journal.find({ userId: req.user.id }).sort({ date: 1 });

        const moodData = data.map(entry => ({
            date: entry.date.toISOString().split("T")[0],
            mood: {
                label: entry.moodLabel,
                score: entry.moodScore
            }
        }));

        res.json(moodData);
    } catch (error) {
        res.status(500).json({ message: "Lỗi server khi lấy mood." });
    }
});

module.exports = router;
