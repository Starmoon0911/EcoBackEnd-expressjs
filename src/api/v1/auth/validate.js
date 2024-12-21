const exporess = require('express');
const router = exporess.Router();
const jwt = require('jsonwebtoken')
router.post("/validate", async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        res.status(200).json({ message: "Token is valid", data: decode })
    } catch (error) {
        return res.status(401).json({ valid: false, message: 'Token 無效或已過期' });

    }
});

module.exports = {
    router,
    name: "validate"
}