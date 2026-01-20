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

    const user = await User.findOne({ googleId: profile.id }, { email: profile.emails[0].value });

    if (user) {
        // User  is avilable -update  google id & genrate token and send it in response
        if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
        }

    } else {
        // user is not avilable - create new user and genrate token and send it in response
        const newUser = new User({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
        });
        await newUser.save({ validateBeforeSave: false });
    }

    const token = jwt.sign({ _id: user._id, name: user.name }, process.env.JWT_SECRET, {
        expiresIn: '2h',
    });
    res.redirect(`http://localhost:4200/dashboard?token=${token}`);
});

module.exports = router;