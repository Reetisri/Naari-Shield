const mongoose = require('mongoose');

const LocationHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  emergencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Emergency',
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('LocationHistory', LocationHistorySchema);
