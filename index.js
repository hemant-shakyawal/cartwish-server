require("dotenv").config();
require("./config/passport");
const express = require('express');
const cookieParser = require('cookie-parser'); //for refresh token in cookie
const app = express();

const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/category');

app.use(express.json());
app.use(cookieParser());
app.use('/uploads/category', express.static('uploads/category'));

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, {
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB", err);
});

app.use("/api/user", userRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/category", categoryRoutes)

const PORT = process.env.PORT || 3200;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
