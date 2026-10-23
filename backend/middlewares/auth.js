import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    let token = req.headers.token;

    // Support standard Authorization: Bearer <token>
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: "Authorization denied: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        req.user = decoded;

        // Safely set on body for legacy controller compatibility
        if (req.body && typeof req.body === "object") {
            req.body.userId = decoded.id;
        }

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
    }
};
