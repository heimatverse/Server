
const JWT = require("jsonwebtoken");
const jwtSecret = 'FallbackSecretKey';
const Authentication = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        console.log(token);
        if (token) {
            JWT.verify(token,jwtSecret, (err, decodedtoken) => {
                if (err) {
                    return res.status(401).json({ message: "you are unauthorized" });
                } else {
                    next();
                }
            });
        } else {
            return res.status(401).json({ message: "Token not found" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { Authentication };
