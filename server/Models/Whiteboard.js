const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const whiteboardStateSchema = new Schema({
  roomId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the Room
    required: true,
    ref: 'Room'
  },
  state: {
    type: Object, // Store the state as a JSON object
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

const WhiteboardState = mongoose.model('WhiteboardState', whiteboardStateSchema);

module.exports = WhiteboardState;
