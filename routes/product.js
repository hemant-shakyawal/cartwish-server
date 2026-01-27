const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const checkSeller = require('../middleware/checkSeller');



router.post('/', authMiddleware, checkSeller, (req, res) => {
    res.send("Seller is here")

});

module.exports = router;