const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

const Joi = require('joi');

const createUserSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    delveryAddress: Joi.string().min(5).required()
});

// Create a new user
router.post('/', async (req, res) => {
    try {
        const { name, email, password, delveryAddress } = req.body;
        const joyValidation = createUserSchema.validate(req.body);
        if (joyValidation.error) {
            return res.status(400).json({ message: joyValidation.error.details[0].message });
        }
        const user = await User.findOne({ email: email });


        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name: name,
            email: email,
            password: hashPassword,
            delveryAddress: delveryAddress
        });

        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});
module.exports = router;
