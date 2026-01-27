const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');




router.post('/', authMiddleware, checkRole("seller"),  (req, res) => {
    res.send("Seller is here")

});

module.exports = router;