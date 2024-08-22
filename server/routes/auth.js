const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Users = require('../Models/Users'); // Update the path as needed
const { body, validationResult } = require('express-validator');
const fetchUser = require('../middleware/fetchUser');
const authRouter = express.Router();

// Replace with your secret key (use an environment variable for security)
const JWT_SECRET = 'collashhhh';


// Signup route
authRouter.post('/signup',[
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
] ,async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await Users.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new Users({
            name,
            email,
            password: hashedPassword
        });

        // Save the user to the database
        await newUser.save();

        // Generate a JWT token
        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email , password : newUser.password }, // Payload
            JWT_SECRET // Secret key
        );

        // Respond with success message and JWT token
        res.status(201).json({ message: 'User created successfully!', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Login route
authRouter.post('/login',[
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
], async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const existingUser = await Users.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check if the password is correct
        const passwordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!passwordCorrect) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email },
            JWT_SECRET
        );

        // Respond with success message and JWT token
        res.json({ message: 'Login successful!', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// route for logging out the user : login required
authRouter.get('/logout', fetchUser, async (req, res) => {
    try {
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// route for getting user details : login required
authRouter.get('/getUser', fetchUser, async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Forget password route
authRouter.post('/forgetPassword',[
    body('email', 'Please include a valid email').isEmail()
], async (req, res) => {
    const { email } = req.body;

    try {
        
        const existingUser = await Users.findOne({ email  });

        if (!existingUser) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: existingUser._id, email: existingUser.email },
            JWT_SECRET
        );

       
        res.json({ message: 'Token generated successfully!', token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = authRouter;
