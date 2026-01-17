
const jwt = require('jsonwebtoken');

const authMiddeleware = (req, res, next) => {

    const authHeader = req.headers.authorization;

    console.log("Auth Header:", authHeader);
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authorization token required!' });
    }


    const token = authHeader.split(' ')[1];
    try {
        // Here you would normally verify the token
        // For example, using JWT:
        const decodedUser = jwt.verify(token, process.env.JWT_SECRET);

        // For demonstration, we'll just attach a dummy user
        req.user = decodedUser; // Replace with actual decoded token data
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid authorization token!' });
    }
};

module.exports = authMiddeleware;
