const jwt = require('jsonwebtoken');
const Users = require('../Models/Users'); 
const JWT_SECRET = 'collashhhh';

const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token'); 

    if (!token) {
        return res.status(401).json({ error: 'No token provided, authorization denied' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Fetch the user by ID from the payload
        const user = await Users.findById(decoded.userId).select('-password'); // Exclude the password

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Attach the user to the request object
        req.user = user;
        next(); // Pass control to the next middleware/route handler
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Token is not valid' });
    }
};

module.exports = fetchUser;
