// Step 1: Import the connectToDatabase function from db.js
const connectToDatabase = require('./db');
const authRouter = require('./routes/auth');
connectToDatabase();

const express = require('express');
const app = express();
app.use(express.json());
// Step 2: Call the connectToDatabase function to establish the connection

app.use('/api/auth',authRouter );

app.listen(3000, () => {    
    console.log('Server is running on port 3000');
});
