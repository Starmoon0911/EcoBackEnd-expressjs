const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
    res.json({message:'Login endpoint'});
});

module.exports = router;
