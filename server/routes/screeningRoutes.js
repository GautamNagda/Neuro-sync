const express = require('express');
const router = express.Router();
const { createSession, getSessions, getSession, saveProgress, getIncomplete } = require('../controllers/screeningController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/', createSession);
router.post('/save-progress', saveProgress);
router.get('/', getSessions);
router.get('/incomplete/:type', getIncomplete);
router.get('/:id', getSession);

module.exports = router;
