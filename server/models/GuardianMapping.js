const mongoose = require('mongoose');

const GuardianMappingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  guardianId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  relationship: {
    type: String,
    default: 'Guardian',
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Avoid duplicate mapping of user -> guardian
GuardianMappingSchema.index({ userId: 1, guardianId: 1 }, { unique: true });

module.exports = mongoose.model('GuardianMapping', GuardianMappingSchema);
