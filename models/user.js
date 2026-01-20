const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3, },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: false },
    googleId: { type: String, unique: true, },
    facebookId: { type: String, unique: true, },
    deliveryAddress: { type: String, required: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

const User = mongoose.models.user || mongoose.model('user', userSchema);
module.exports = User;

