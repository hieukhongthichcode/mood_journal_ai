const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  console.log("JWT_SECRET loaded:", process.env.JWT_SECRET); // ✅ phải in ra được 'supersecret123'

  const authHeader = req.headers.authorization;
  console.log("Authorization Header:", authHeader);
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Không có token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // ví dụ: "mysecret"
    req.user = decoded; // { id, email }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};

module.exports = authMiddleware;
