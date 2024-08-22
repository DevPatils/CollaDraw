const express = require('express');
const boardouter = express.Router();
const WhiteboardState = require('../Models/Whiteboard');    
const fetchuser = require('../middleware/fetchUser');

// Save Whiteboard State Route
boardouter.post('/saveState', fetchuser, async (req, res) => {
    const { roomId, state } = req.body;

    try {
        // Find existing state by roomId
        let whiteboardState = await WhiteboardState.findOne({ roomId });

        if (whiteboardState) {
            // Update the existing state
            whiteboardState.state = state;
            whiteboardState.updatedAt = Date.now();
        } else {
            // Create a new state entry if none exists
            whiteboardState = new WhiteboardState({
                roomId,
                state
            });
        }

        // Save the state to the database
        await whiteboardState.save();

        res.status(200).json({ message: 'Whiteboard state saved successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = boardouter;