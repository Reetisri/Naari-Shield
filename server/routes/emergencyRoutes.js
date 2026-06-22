const express = require('express');
const router = express.Router();
const {
  triggerEmergency,
  resolveEmergency,
  getEmergencyHistory,
  getCurrentRisk,
  getActiveEmergencies,
} = require('../controllers/emergencyController');
const { protect } = require('../middleware/authMiddleware');

router.post('/trigger', protect, triggerEmergency);
router.post('/resolve', protect, resolveEmergency);
router.get('/history', protect, getEmergencyHistory);
router.get('/active', protect, getActiveEmergencies);
router.get('/risk/current', protect, getCurrentRisk);

module.exports = router;
