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
    deliveryAddress: Joi.string().min(5).required()
});

// Create a new user
router.post('/', async (req, res) => {
    try {
        const { name, email, password, deliveryAddress } = req.body;
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
            deliveryAddress: deliveryAddress,
            
        });

        await newUser.save();
        const { accessToken, refreshToken } = generateTokens({ _id: newUser._id, name: newUser.name, role: newUser.role });

        const newHashRefreshToken = await bcrypt.hash(refreshToken, 10);//hash refresh token before saving to db

        newUser.refreshToken = newHashRefreshToken;
        await newUser.save();


        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, //set true in production
            sameSite: 'lax',
            //domain: 'app.domain.com',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });//call always secure in production

        res.status(201).json(accessToken);
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
        //create jwt token and send in response
        const { accessToken, refreshToken } = generateTokens({ _id: user._id, name: user.name, role: user.role });

        const newHashRefreshToken = await bcrypt.hash(refreshToken, 10);

        user.refreshToken = newHashRefreshToken;
        await user.save();
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: false, //set true in production
            sameSite: 'lax',
            //domain: 'app.domain.com',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });//call always secure in production


        res.status(201).json(accessToken);
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
const generateTokens = (data) => {
    const accessToken = jwt.sign({ _id: data._id, name: data.name },
        process.env.ACCESS_TOKEN_KEY,
        { expiresIn: '5m' }
    );
    const refreshToken = jwt.sign({ _id: data._id },
        process.env.REFRESH_TOKEN_KEY,
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
};

module.exports = router;
