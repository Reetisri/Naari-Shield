const mongoose = require('mongoose');

const EmergencySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  emergencyStatus: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active',
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  batteryLevel: {
    type: Number,
    default: 100,
  },
  riskScore: {
    type: Number,
    default: 50,
  },
  audioUrl: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
  },
});

module.exports = mongoose.model('Emergency', EmergencySchema);
