const mongoose = require('mongoose');
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true, minlength: 3 },
    image: { type: String, required: false },

});

const Category = mongoose.models.category || mongoose.model('category', categorySchema);
module.exports = Category;