const express = require('express');
const router = express.Router();
const { generateReport, generateVoiceReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/generate/:sessionId', generateReport);
router.get('/generate-voice/:noteId', generateVoiceReport);

module.exports = router;
