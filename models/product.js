const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    title: { type: String, required: true, unique: true, minlength: 3, maxlength: 100 },
    description: { type: String, required: true, minlength: 50 },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, minlength: 3 },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    images: { type: [String], required: true },
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: { type: String, maxlength: 500 },


    }],




});

const Product = mongoose.models.product || mongoose.model('product', productSchema);
module.exports = Product;
