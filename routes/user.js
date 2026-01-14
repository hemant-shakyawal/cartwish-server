const express = require('express');
const router = express.Router();
const User = require('../models/user');

// Create a new user
router.post('/', async (req, res) => {
    try {
        const { name, email, password, delveryAddress } = req.body;
        const user = await User.findOne({ email: email });


        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const newUser = new User({
            name: name,
            email: email,
            password: password,
            delveryAddress: delveryAddress
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});
module.exports = router;
