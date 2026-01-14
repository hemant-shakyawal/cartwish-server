const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, minlength: 3, },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    delveryAddress: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
});

const User = mongoose.model('user', userSchema);
module.exports = User;


