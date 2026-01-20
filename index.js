require("dotenv").config();
require("./config/passport");
const express = require('express');
const app = express();

const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
app.use(express.json());

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL, {
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Error connecting to MongoDB", err);
});

app.use("/api/user", userRoutes)
app.use("/api/auth", authRoutes)

const PORT = process.env.PORT || 3200;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
