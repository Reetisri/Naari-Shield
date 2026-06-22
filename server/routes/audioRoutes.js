const express = require('express');
const router = express.Router();
const { uploadAudio } = require('../controllers/audioController');
const { protect } = require('../middleware/authMiddleware');

router.post('/upload', protect, uploadAudio);

module.exports = router;
