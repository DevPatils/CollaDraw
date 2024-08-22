const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  roomName: {
    type: String,
    required: true,
    trim: true
  },
  hostUserId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User model
    required: true,
    ref: 'User'
  },
  participants: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the User model
        ref: 'User'
      },
      joinedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  maxParticipants: {
    type: Number,
    default: 10 // Set a default or allow dynamic input
  },
  password: {
    type: String, // Use bcrypt to hash passwords if rooms are password-protected
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

roomSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Rooms = mongoose.model('Rooms', roomSchema);

module.exports = Rooms;
