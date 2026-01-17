const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/user');

const Joi = require('joi');
const jwt = require('jsonwebtoken');

const authMiddeleware = require('../middleware/auth');
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
        const token = generateToken({ id: newUser._id, name: newUser.name });


        res.status(201).json(token);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});

router.post('/login', async (req, res) => {
    try {

        // find user from database by mail
        const { email, password } = req.body;
        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // compare password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        //create jwt token
        const token = generateToken({ id: user._id, name: user.name });
        res.status(201).json(token);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});


router.get('/', authMiddeleware, async (req, res) => {
    try {
        // const users = req.user; // Access the authenticated user from the request
        const users = await User.findById(req.user.id).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
});
const generateToken = (data) => {
    return jwt.sign(data,
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
    );
};

module.exports = router;
