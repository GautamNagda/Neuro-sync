const express = require('express');
const router = express.Router();
const { sendMessage, getSessions, getSession } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/send', sendMessage);
router.get('/sessions', getSessions);
router.get('/session/:id', getSession);

module.exports = router;
