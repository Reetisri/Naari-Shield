const User = require('../models/User');
const GuardianMapping = require('../models/GuardianMapping');

// @desc    Add a guardian mapping by email
// @route   POST /api/guardian/add
// @access  Private
const addGuardian = async (req, res) => {
  try {
    const { email, relationship } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide guardian email' });
    }

    // Find the guardian user
    const guardian = await User.findOne({ email: email.toLowerCase() });
    if (!guardian) {
      return res.status(404).json({ success: false, message: 'Guardian user not found. They must register first.' });
    }

    if (guardian._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot add yourself as a guardian' });
    }

    // Check if mapping already exists
    const existingMapping = await GuardianMapping.findOne({
      userId: req.user._id,
      guardianId: guardian._id,
    });

    if (existingMapping) {
      return res.status(400).json({ success: false, message: 'This guardian is already linked to your profile' });
    }

    // Create the mapping
    const mapping = await GuardianMapping.create({
      userId: req.user._id,
      guardianId: guardian._id,
      relationship: relationship || 'Guardian',
    });

    res.status(201).json({
      success: true,
      message: 'Guardian linked successfully',
      data: mapping,
    });
  } catch (error) {
    console.error('Add Guardian Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Get linked guardians (if user) or linked users (if guardian)
// @route   GET /api/guardian/list
// @access  Private
const getGuardianList = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole === 'user') {
      // Find all guardians linked to this user
      const mappings = await GuardianMapping.find({ userId: req.user._id })
        .populate('guardianId', 'name email phoneNumber profileImage batteryLevel isCharging')
        .sort('-createdAt');

      const list = mappings.map(m => ({
        mappingId: m._id,
        relationship: m.relationship,
        guardian: m.guardianId,
        createdAt: m.createdAt,
      }));

      return res.json({ success: true, data: list });
    } else {
      // Find all users linked to this guardian
      const mappings = await GuardianMapping.find({ guardianId: req.user._id })
        .populate('userId', 'name email phoneNumber profileImage batteryLevel isCharging')
        .sort('-createdAt');

      const list = mappings.map(m => ({
        mappingId: m._id,
        relationship: m.relationship,
        user: m.userId,
        createdAt: m.createdAt,
      }));

      return res.json({ success: true, data: list });
    }
  } catch (error) {
    console.error('Get Guardian List Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// @desc    Remove a linked guardian
// @route   DELETE /api/guardian/remove/:guardianId
// @access  Private
const removeGuardian = async (req, res) => {
  try {
    const { guardianId } = req.params;

    const mapping = await GuardianMapping.findOneAndDelete({
      userId: req.user._id,
      guardianId,
    });

    if (!mapping) {
      return res.status(404).json({ success: false, message: 'Guardian linkage not found' });
    }

    res.json({ success: true, message: 'Guardian removed successfully' });
  } catch (error) {
    console.error('Remove Guardian Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

module.exports = {
  addGuardian,
  getGuardianList,
  removeGuardian,
};
