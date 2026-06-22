const express = require('express');
const router = express.Router();
const { updateLocation, getLiveLocations } = require('../controllers/locationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/update', protect, updateLocation);
router.get('/live', protect, getLiveLocations);

module.exports = router;
