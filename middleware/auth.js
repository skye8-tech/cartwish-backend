const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
            .status(401)
            .json({ message: "Authorization token required!" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decodedData = jwt.verify(token, process.env.JWT_KEY);
        req.user = decodedData;
        if (req.user) {
            next();
        } else {
            throw new Error("");
        }
    } catch (error) {
        return res.status(400).json({ message: "Invalid Token!" });
    }
};

module.exports = authMiddleware;
