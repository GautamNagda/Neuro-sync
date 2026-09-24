const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadVoice, getNotes, playVoice, getNote } = require('../controllers/voiceController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

router.use(protect);
router.post('/upload', upload.single('audio'), uploadVoice);
router.get('/notes', getNotes);
router.get('/play/:id', playVoice);
router.get('/note/:id', getNote);

module.exports = router;
