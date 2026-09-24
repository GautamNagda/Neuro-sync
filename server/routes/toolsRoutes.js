const express = require('express');
const router = express.Router();
const { 
  startSession, 
  updateSession, 
  completeSession, 
  getSessions, 
  getStats, 
  analyzeCBTCycle, 
  categorizeUserWorry 
} = require('../controllers/toolsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/session/start', startSession);
router.put('/session/:id', updateSession);
router.put('/session/:id/complete', completeSession);
router.get('/sessions/me', getSessions);
router.get('/sessions/me/stats', getStats);
router.post('/cbt/analyse', analyzeCBTCycle);
router.post('/worries/categorise', categorizeUserWorry);

module.exports = router;
