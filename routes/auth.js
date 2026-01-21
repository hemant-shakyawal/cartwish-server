const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.get('/google', passport.authenticate('google', {
    scope: ['email', 'profile']
}));
router.get('/google/callback', passport.authenticate('google', {
    session: false,
    failureRedirect: 'http://localhost:4200/login',
}), async (req, res) => {
    //check usser is avilable  or not using google id or mail
    const profile = req.user;
    const token = await handleOauthCallback(profile, 'googleId');

    res.redirect(`http://localhost:4200/dashboard?token=${token}`);
});

router.get('/facebook',
    passport.authenticate('facebook', { scope: ['public_profile', 'email'] }));

router.get('/facebook/callback', passport.authenticate('facebook', {
    session: false,
    failureRedirect: 'http://localhost:4200/login',
}), async (req, res) => {
    //check usser is avilable  or not using google id or mail
    const profile = req.user;

    const token = await handleOauthCallback(profile, 'facebookId');
    res.redirect(`http://localhost:4200/dashboard?token=${token}`);
});

const handleOauthCallback = async (profile, providerID) => {
    const user = await User.findOne({ [providerID]: profile.id }, { email: profile.emails[0].value });

    if (user) {
        // User  is avilable -update  google id & genrate token and send it in response
        if (!user[providerID]) {
            user[providerID] = profile.id;
            await user.save();
        }

    } else {
        // user is not avilable - create new user and genrate token and send it in response
        const newUser = new User({
            [providerID]: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
        });
        await newUser.save({ validateBeforeSave: false });
    }

    const token = jwt.sign({ _id: user._id, name: user.name }, process.env.JWT_SECRET, {
        expiresIn: '2h',
    });
    return token;
}
module.exports = router;