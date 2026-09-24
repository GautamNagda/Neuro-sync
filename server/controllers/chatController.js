const ChatSession = require('../models/ChatSession');
const { chatWithMindBot } = require('../utils/geminiClient');

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end my life', 'self-harm', 'self harm',
  'cutting myself', 'want to die', 'better off dead', 'no reason to live',
  'hurt myself', 'ending it all', 'not worth living', 'take my life'
];

const detectCrisis = (text) => {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some(kw => lower.includes(kw));
};

// @desc    Send message to MindBot
// @route   POST /api/chat/send
exports.sendMessage = async (req, res, next) => {
  try {
    const { message, sessionId, language } = req.body;
    let session;

    const userCrisis = detectCrisis(message);

    if (sessionId) {
      session = await ChatSession.findOne({ _id: sessionId, userId: req.user._id }).select('+messages');
      if (!session) return res.status(404).json({ message: 'Session not found' });
    } else {
      session = new ChatSession({ userId: req.user._id, messages: [] });
    }

    session.messages.push({ role: 'user', content: message, timestamp: new Date() });
    session.messageCount += 1;

    // Get AI response
    const aiResponse = await chatWithMindBot(
      session.messages.map(m => ({ role: m.role, content: m.content })),
      language || 'en'
    );

    const botCrisis = aiResponse.startsWith('[CRISIS_DETECTED]');
    const cleanResponse = aiResponse.replace('[CRISIS_DETECTED]', '').trim();

    session.messages.push({ role: 'assistant', content: cleanResponse, timestamp: new Date() });
    session.messageCount += 1;
    session.lastActive = new Date();

    if (userCrisis || botCrisis) {
      session.crisisTriggered = true;
      session.riskLevel = 'high';
    }

    await session.save();

    res.json({
      sessionId: session._id,
      response: cleanResponse,
      crisisDetected: userCrisis || botCrisis,
      messageCount: session.messageCount,
      riskLevel: session.riskLevel
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chat sessions
// @route   GET /api/chat/sessions
exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user._id })
      .sort({ lastActive: -1 })
      .limit(20);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single chat session with messages
// @route   GET /api/chat/session/:id
exports.getSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('+messages');
    
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    next(error);
  }
};
