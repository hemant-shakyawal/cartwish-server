const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

router.get('/google', passport.authenticate('google', {
    scope: ['email', 'profile']
}));
router.get('/google/callback', passport.authenticate('google', {
    session: false,
    failureRedirect: 'http://localhost:4200/login',
}), async (req, res) => {
    //check usser is avilable  or not using google id or mail
    const profile = req.user;
    const { accessToken, refreshToken } = await handleOauthCallback(profile, 'googleId');

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect(`http://localhost:4200/dashboard?token=${accessToken}`);
});

router.get('/facebook',
    passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

router.get('/facebook/callback', passport.authenticate('facebook', {
    session: false,
    failureRedirect: 'http://localhost:4200/login',
}), async (req, res) => {
    //check usser is avilable  or not using google id or mail
    const profile = req.user;

    const { accessToken, refreshToken } = await handleOauthCallback(profile, 'facebookId');
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`http://localhost:4200/dashboard?token=${accessToken}`);
});

const handleOauthCallback = async (req, res, profile, providerID) => {
    let user = await User.findOne({
        $or: [{ [providerID]: profile.id }, { email: profile.emails[0].value }]
    });

    if (!user) {
        user = new User({
            [providerID]: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
        });
    } else {
        user[providerID] = profile.id;
    }

    const { accessToken, refreshToken } = generateTokens({ _id: user._id, name: user.name, role: user.role });
    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // true in production
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return accessToken; // Return only the access token
}


router.post('/refresh', async (req, res) => {
    const userRefreshToken = req.cookies.refreshToken;

    if (!userRefreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    let decoded;
    try {
        decoded = jwt.verify(
            userRefreshToken,
            process.env.REFRESH_TOKEN_KEY
        );
    } catch {
        return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded._id);
    if (!user || !user.refreshToken) {
        return res.status(404).json({ message: 'user not found' });
    }

    const isValid = await bcrypt.compare(
        userRefreshToken,
        user.refreshToken
    );

    if (!isValid) {
        return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const { accessToken, refreshToken } = generateTokens({
        _id: user._id,
        name: user.name,
        role: user.role

    });

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ accessToken });
});


router.post('/logout', async (req, res) => {
    const userRefreshToken = req.cookies.refreshToken;

    if (!userRefreshToken) {
        return res.status(401).json({ message: 'No refresh token provided' });
    }

    let decoded;
    try {
        decoded = jwt.verify(
            userRefreshToken,
            process.env.REFRESH_TOKEN_KEY
        );
    } catch {
        return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded._id);
    if (!user || !user.refreshToken) {
        return res.status(404).json({ message: 'user not found' });
    }

    user.refreshToken = null;
    await user.save();
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: false, // true in production
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ message: 'Logged out successfully' });

});

const generateTokens = (data) => {
    const accessToken = jwt.sign({ _id: data._id, name: data.name, role: data.role },
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