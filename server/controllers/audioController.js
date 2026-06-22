const fs = require('fs');
const path = require('path');
const multer = require('multer');
const Emergency = require('../models/Emergency');

// Create upload directory path
const uploadDir = path.join(__dirname, '..', 'uploads', 'audio');

// Ensure directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Save as: audio-userId-timestamp.webm
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '.webm';
    cb(null, `audio-${req.user._id}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
}).single('audio');

// @desc    Upload emergency audio clip
// @route   POST /api/audio/upload
// @access  Private
const uploadAudio = (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('Multer Upload Error:', err.message);
      return res.status(400).json({ success: false, message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an audio file' });
    }

    try {
      // Find active emergency for the user
      const activeEmergency = await Emergency.findOne({
        userId: req.user._id,
        emergencyStatus: 'active',
      });

      if (!activeEmergency) {
        // Clean up file if no active emergency
        fs.unlinkSync(req.file.path);
        return res.status(400).json({
          success: false,
          message: 'No active SOS alert found. Audio evidence must link to an active emergency.',
        });
      }

      // Save relative path: e.g., /uploads/audio/filename.webm
      const relativePath = `/uploads/audio/${req.file.filename}`;
      activeEmergency.audioUrl = relativePath;
      await activeEmergency.save();

      res.json({
        success: true,
        message: 'Emergency audio uploaded and linked successfully',
        data: {
          emergencyId: activeEmergency._id,
          audioUrl: relativePath,
        },
      });
    } catch (error) {
      console.error('Upload Audio Database Link Error:', error.message);
      // Try cleaning up the file if DB transaction failed
      try {
        fs.unlinkSync(req.file.path);
      } catch (fErr) {}
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  });
};

module.exports = {
  uploadAudio,
};
