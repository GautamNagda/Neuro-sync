const express = require('express');
const router = express.Router();
const { getScenarios, submitResponse, getHistory } = require('../controllers/gameController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/scenarios/:gameType', getScenarios);
router.post('/submit', submitResponse);
router.get('/history', getHistory);

module.exports = router;
