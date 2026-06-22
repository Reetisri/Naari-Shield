const Emergency = require('../models/Emergency');
const LocationHistory = require('../models/LocationHistory');
const GuardianMapping = require('../models/GuardianMapping');
const User = require('../models/User');
const { calculateRiskScore } = require('../utils/riskAssessor');
const { sendEmergencyEmail } = require('../utils/emailService');

// @desc    Trigger a new emergency SOS
// @route   POST /api/emergency/trigger
// @access  Private
const triggerEmergency = async (req, res) => {
  try {
    const { latitude, longitude, batteryLevel, riskScore } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Please provide current coordinates' });
    }

    // Resolve any active emergency for this user first
    await Emergency.updateMany(
      { userId: req.user._id, emergencyStatus: 'active' },
      { emergencyStatus: 'resolved', resolvedAt: new Date() }
    );

    // Create new emergency
    const emergency = await Emergency.create({
      userId: req.user._id,
      latitude,
      longitude,
      batteryLevel: batteryLevel || req.user.batteryLevel || 100,
      riskScore: riskScore || 50,
      emergencyStatus: 'active',
    });

    // Save initial coordinates in LocationHistory
    await LocationHistory.create({
      userId: req.user._id,
      emergencyId: emergency._id,
      latitude,
      longitude,
    });

    // Fetch linked guardians and send email alerts in the background
    try {
      const mappings = await GuardianMapping.find({ userId: req.user._id }).populate('guardianId');
      mappings.forEach(m => {
        if (m.guardianId && m.guardianId.email) {
          sendEmergencyEmail(
            m.guardianId.email,
            m.guardianId.name,
            req.user.name,
            latitude,
            longitude
          ).catch(err => {
            console.error(`Background email dispatch failed to ${m.guardianId.email}:`, err.message);
          });
        }
      });
    } catch (emailFetchError) {
      console.error('Failed to fetch linked guardians for email dispatch:', emailFetchError.message);
    }

    res.status(201).json({
      success: true,
      message: 'SOS emergency triggered successfully',
      data: emergency,
    });
  } catch (error) {
    console.error('Trigger Emergency Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Resolve an active emergency SOS
// @route   POST /api/emergency/resolve
// @access  Private
const resolveEmergency = async (req, res) => {
  try {
    const result = await Emergency.updateMany(
      { userId: req.user._id, emergencyStatus: 'active' },
      { emergencyStatus: 'resolved', resolvedAt: new Date() }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: 'No active SOS alert found for this user' });
    }

    res.json({
      success: true,
      message: 'SOS emergency resolved successfully',
      data: result,
    });
  } catch (error) {
    console.error('Resolve Emergency Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get emergency alerts history (User's own, or Guardian's linked users)
// @route   GET /api/emergency/history
// @access  Private
const getEmergencyHistory = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole === 'user') {
      const history = await Emergency.find({ userId: req.user._id })
        .sort('-createdAt')
        .limit(20);
      res.json({ success: true, data: history });
    } else {
      // Guardian: Find all linked users
      const mappings = await GuardianMapping.find({ guardianId: req.user._id });
      const userIds = mappings.map(m => m.userId);

      const history = await Emergency.find({ userId: { $in: userIds } })
        .populate('userId', 'name email phoneNumber profileImage')
        .sort('-createdAt')
        .limit(20);

      res.json({ success: true, data: history });
    }
  } catch (error) {
    console.error('Get Emergency History Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get risk profile dashboard data
// @route   GET /api/risk/current
// @access  Private
const getCurrentRisk = async (req, res) => {
  try {
    const targetUserId = req.query.userId || req.user._id;

    // Check mapping if a guardian is fetching someone else's risk
    if (targetUserId.toString() !== req.user._id.toString()) {
      const mappingExists = await GuardianMapping.findOne({
        userId: targetUserId,
        guardianId: req.user._id,
      });
      if (!mappingExists && req.user.role !== 'guardian') {
        return res.status(403).json({ success: false, message: 'Forbidden: Access to this user data is denied' });
      }
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const activeEmergency = await Emergency.findOne({ userId: targetUserId, emergencyStatus: 'active' });
    
    // Find last movement
    const lastLocation = await LocationHistory.findOne({ userId: targetUserId }).sort('-timestamp');
    const lastTime = lastLocation ? lastLocation.timestamp : user.createdAt;

    const riskData = calculateRiskScore(
      user.batteryLevel,
      !!activeEmergency,
      lastTime
    );

    res.json({
      success: true,
      data: {
        userId: user._id,
        batteryLevel: user.batteryLevel,
        isCharging: user.isCharging,
        isEmergencyActive: !!activeEmergency,
        lastActiveLocation: lastLocation,
        risk: riskData,
      },
    });
  } catch (error) {
    console.error('Get Current Risk Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get active emergencies (useful for guardian dashboard updates)
// @route   GET /api/emergency/active
// @access  Private
const getActiveEmergencies = async (req, res) => {
  try {
    if (req.user.role !== 'guardian') {
      return res.status(403).json({ success: false, message: 'Access restricted to guardians' });
    }

    // Find linked users
    const mappings = await GuardianMapping.find({ guardianId: req.user._id });
    const userIds = mappings.map(m => m.userId);

    const activeEmergencies = await Emergency.find({
      userId: { $in: userIds },
      emergencyStatus: 'active',
    }).populate('userId', 'name email phoneNumber profileImage batteryLevel isCharging');

    res.json({ success: true, data: activeEmergencies });
  } catch (error) {
    console.error('Get Active Emergencies Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  triggerEmergency,
  resolveEmergency,
  getEmergencyHistory,
  getCurrentRisk,
  getActiveEmergencies,
};
