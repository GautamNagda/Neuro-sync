const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const ScreeningSession = require('../models/ScreeningSession');
const ChatSession = require('../models/ChatSession');
const VoiceNote = require('../models/VoiceNote');
const GameSession = require('../models/GameSession');

// @desc    Delete user account and all data (GDPR compliance)
// @route   DELETE /api/user/me
router.delete('/me', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      ScreeningSession.deleteMany({ userId }),
      ChatSession.deleteMany({ userId }),
      VoiceNote.deleteMany({ userId }),
      GameSession.deleteMany({ userId }),
      User.findByIdAndDelete(userId)
    ]);

    res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
    res.json({ message: 'Account and all associated data deleted successfully' });
  } catch (error) {
    next(error);
  }
});

// @desc    Export all user data as JSON (data portability)
// @route   GET /api/user/export
router.get('/export', protect, async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [user, screenings, chats, voiceNotes, games] = await Promise.all([
      User.findById(userId),
      ScreeningSession.find({ userId }).select('+aiAnalysis'),
      ChatSession.find({ userId }).select('+messages'),
      VoiceNote.find({ userId }).select('+transcript +aiNotes -audioData'),
      GameSession.find({ userId })
    ]);

    const exportData = {
      exportDate: new Date().toISOString(),
      platform: 'Neuro Sync AI',
      user: {
        name: user.name,
        email: user.email,
        language: user.language,
        createdAt: user.createdAt
      },
      screeningSessions: screenings,
      chatSessions: chats,
      voiceNotes,
      gameSessions: games
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=Neuro Sync AI_Data_Export_${Date.now()}.json`);
    res.json(exportData);
  } catch (error) {
    next(error);
  }
});

// @desc    Update user profile
// @route   PUT /api/user/profile
router.put('/profile', protect, async (req, res, next) => {
  try {
    const { name, language, dob } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, language, dob },
      { new: true, runValidators: true }
    );
    res.json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
