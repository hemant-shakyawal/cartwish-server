const express = require('express');
const router = express.Router();
const Category = require('../models/category');
const multer = require('multer');
const checkRole = require('../middleware/checkRole');
const authMiddeleware = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/category');
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

router.post('/', authMiddeleware, checkRole("admin"), upload.single('icon'), async (req, res) => {
    try {

        if (!req.body.name || !req.file) {
            return res.status(400).json({ message: 'Name and icon are required' });
        }

        const newCategory = new Category({
            name: req.body.name,
            image: req.file.filename
        });

        await newCategory.save();
        res.status(201).json({ message: 'Category added successfully', category: newCategory });

    } catch (error) {

    }

});
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().sort('name');
        res.status(200).json(categories);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });

    }
});


module.exports = router;// Add your category routes here