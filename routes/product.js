const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/products');
    },
    filename: (req, file, cb) => {
        const timeStamp = Date.now()
        const originalname = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, '');
        cb(null, `${timeStamp}-${originalname}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images are allowed'));
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 1024 * 1024 * 2 // 2 MB limit
    }

});



router.post('/', authMiddleware, checkRole("seller"), upload.array("images", 8), async (req, res) => {
    const { title, description, category, price, stock } = req.body;

    const images = req.files.map(images => images.filename);
    if (images.length === 0) {
        return res.status(400).json({ message: "Atleast one image is required" });
    }
    const newProduct = new Product({
        title,
        description,
        category,
        price,
        stock,
        images,
        seller: req.user._id
    });

    await newProduct.save()
    res.status(201).json({
        message: "Product created successfully", newProduct
    });
});

router.get('/', async (req, res) => {
    const products = await Product.find().select('-description -seller -category -__v').lean();
    const updatedProducts = products.map(product => {
        const numberOfReviews = product.reviews.length;
        const sumOfRatings = product.reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = sumOfRatings / (numberOfReviews || 1);


        return { ...product, images: product.images[0], reviews: { numberOfReviews, averageRating } };
    });

    res.status(200).json(updatedProducts);
});

module.exports = router;