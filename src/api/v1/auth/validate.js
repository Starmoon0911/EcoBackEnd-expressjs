const express = require('express');
const router = express.Router();
const User = require('@database/schemas/User')
const jwt = require('jsonwebtoken')
router.post("/validate", async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }
    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        const user = User.findById(decode);
        if (user?.role === "admin") {
            return res.status(200).json({ message: "Token is valid", data: decode, role: "admin" })

        }
        res.status(200).json({ message: "Token is valid", data: decode, role: "customer" })
    } catch (error) {
        return res.status(401).json({ valid: false, message: 'Token 無效或已過期' });

    }
});

module.exports = {
    router,
    name: "validate"
}