const jwt = require('jsonwebtoken')
module.exports = (req, res, next) => {
    const token = req.header['authorization']?.split(' ')[1];
    if (!token) {
        return res.sendStatus(403)
    }
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
}