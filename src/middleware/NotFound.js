// NotFound.js
module.exports = (req, res, next) => {
    res.status(404).json({ status: 404, message: '找不到此頁面' });
};
