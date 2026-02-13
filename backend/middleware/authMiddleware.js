const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }

    const [scheme, token] = authHeader.split(" ");

    if (!token || scheme.toLowerCase() !== "bearer") {
        return res.status(401).json({ message: "Invalid authorization format" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        console.error("🔑 Auth Middleware Error:", err.message);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
