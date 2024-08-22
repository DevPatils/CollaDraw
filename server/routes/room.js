const express = require('express');
const roomrouter = express.Router();
const Room = require('../Models/Rooms'); // Assuming your Room model is here
const fetchuser = require('../middleware/fetchUser'); // Your authentication middleware

// Create Room Route
roomrouter.post('/create', fetchuser, async (req, res) => {
    const { roomName, maxParticipants, password } = req.body;

    try {
        // Create new room with the logged-in user as the host
        const newRoom = new Room({
            roomName,
            hostUserId: req.user._id, // Use the ID from the authenticated user
            maxParticipants,
            password
        });

        // Save the new room to the database
        await newRoom.save();

        // Respond with success message and room details if needed
        res.status(201).json({ message: 'Room created successfully!', room: newRoom });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


//Route to delete a room by creator
roomrouter.delete('/delete/:id', fetchuser, async (req, res) => {
    const roomId = req.params.id;

    try {
        // Find the room by its ID
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Check if the user is the host of the room
        if (room.hostUserId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You are not authorized to delete this room' });
        }

        // Delete the room
        await Room.findByIdAndDelete(roomId);

        res.status(200).json({ message: 'Room deleted successfully' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// Join Room Route
roomrouter.post('/join', fetchuser, async (req, res) => {
    const { roomId, password } = req.body;

    try {
        // Find the room by its ID
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        if (room.password) {
            const isMatch = password === room.password; 
            if (!isMatch) {
                return res.status(401).json({ error: 'Incorrect room password' });
            }
        }

        if (room.maxParticipants && room.participants.length >= room.maxParticipants) {
            return res.status(403).json({ error: 'Room is full' });
        }

        // Check if the user is already in the room
        const isAlreadyParticipant = room.participants.some(
            (participant) => participant.userId.toString() === req.user._id.toString()
        );

        if (isAlreadyParticipant) {
            return res.status(400).json({ error: 'You are already in this room' });
        }

        // Add the user to the room's participants
        room.participants.push({ userId: req.user._id });
        await room.save();

        res.status(200).json({ message: 'Joined room successfully', room });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

//getall rooms route
roomrouter.get('/getallrooms', fetchuser, async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// leave room route
roomrouter.post('/leave', fetchuser, async (req, res) => {
    const { roomId } = req.body;

    try {
        // Find the room by its ID
        const room = await Room.findById(roomId);

        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Check if the user is in the room
        const participantIndex = room.participants.findIndex(
            (participant) => participant.userId.toString() === req.user._id.toString()
        );

        if (participantIndex === -1) {
            return res.status(400).json({ error: 'You are not in this room' });
        }

        // Remove the user from the participants list
        room.participants.splice(participantIndex, 1);

        // If the user is the host and there are other participants, transfer host role or delete room
        if (room.hostUserId.toString() === req.user._id.toString()) {
            if (room.participants.length > 0) {
                // Transfer host role to the first participant (or choose another method)
                room.hostUserId = room.participants[0].userId;
            } else {
                // If no participants are left, delete the room
                await Room.findByIdAndDelete(roomId);
                return res.status(200).json({ message: 'Room deleted as you were the last participant' });
            }
        }

        // Save the updated room
        await room.save();

        res.status(200).json({ message: 'Left room successfully', room });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = roomrouter;
