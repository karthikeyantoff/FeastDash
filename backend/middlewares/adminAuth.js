import jwt from "jsonwebtoken";

export const adminAuthMiddleware = (req, res, next) => {
    let token = req.headers.token;

    // Support standard Authorization: Bearer <token>
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        token = req.headers.authorization.split(" ")[1];
    }

    const adminSecret = process.env.ADMIN_SECRET_KEY || "feastdash_admin_secret_key_default";

    if (!token) {
        return res.status(401).json({ success: false, message: "Admin authorization denied: No token provided" });
    }

    try {
        const decoded = jwt.verify(token, adminSecret);
        if (decoded.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized: Admin access required" });
        }
        req.adminId = decoded.id;
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Invalid or expired admin token" });
    }
};
