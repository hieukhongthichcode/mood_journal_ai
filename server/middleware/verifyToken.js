const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(" ")[1]; // Bearer <token>

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: "Token không hợp lệ!" });
            }

            req.user = user;
            next();
        });
    } else {
        return res.status(401).json({ error: "Bạn chưa đăng nhập!" });
    }
};

module.exports = verifyToken;
