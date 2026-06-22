const express = require('express');
const router = express.Router();
const {
  addGuardian,
  getGuardianList,
  removeGuardian,
} = require('../controllers/guardianController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/add', addGuardian);
router.get('/list', getGuardianList);
router.delete('/remove/:guardianId', removeGuardian);

module.exports = router;
