const User = require('../models/User');
const Emergency = require('../models/Emergency');
const LocationHistory = require('../models/LocationHistory');
const GuardianMapping = require('../models/GuardianMapping');

// @desc    Update user's live location and battery status
// @route   POST /api/location/update
// @access  Private
const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude, batteryLevel, isCharging } = req.body;

    // Update battery status if provided
    const userUpdate = {};
    if (batteryLevel !== undefined) userUpdate.batteryLevel = batteryLevel;
    if (isCharging !== undefined) userUpdate.isCharging = isCharging;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdate);
    }

    // Check if there is an active emergency
    const activeEmergency = await Emergency.findOne({
      userId: req.user._id,
      emergencyStatus: 'active',
    });

    if (activeEmergency && latitude !== undefined && longitude !== undefined) {
      // Update coordinates in the Emergency record itself
      activeEmergency.latitude = latitude;
      activeEmergency.longitude = longitude;
      if (batteryLevel !== undefined) activeEmergency.batteryLevel = batteryLevel;
      await activeEmergency.save();

      // Log coordinates in LocationHistory
      await LocationHistory.create({
        userId: req.user._id,
        emergencyId: activeEmergency._id,
        latitude,
        longitude,
      });
    }

    res.json({
      success: true,
      message: 'Location/telemetry updated successfully',
      data: {
        isEmergencyActive: !!activeEmergency,
      },
    });
  } catch (error) {
    console.error('Update Location Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get live tracking for linked users (Guardian access)
// @route   GET /api/location/live
// @access  Private
const getLiveLocations = async (req, res) => {
  try {
    if (req.user.role !== 'guardian') {
      return res.status(403).json({ success: false, message: 'Access restricted to guardians' });
    }

    // Find linked users
    const mappings = await GuardianMapping.find({ guardianId: req.user._id });
    const userIds = mappings.map(m => m.userId);

    // Get active emergencies
    const activeEmergencies = await Emergency.find({
      userId: { $in: userIds },
      emergencyStatus: 'active',
    }).populate('userId', 'name email phoneNumber profileImage batteryLevel isCharging');

    // For each emergency, fetch the location history sequence
    const liveTrackingData = [];
    for (const emergency of activeEmergencies) {
      const history = await LocationHistory.find({ emergencyId: emergency._id })
        .sort('timestamp');

      liveTrackingData.push({
        emergency,
        history,
      });
    }

    res.json({ success: true, data: liveTrackingData });
  } catch (error) {
    console.error('Get Live Locations Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  updateLocation,
  getLiveLocations,
};
