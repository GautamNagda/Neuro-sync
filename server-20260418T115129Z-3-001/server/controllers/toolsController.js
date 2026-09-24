const ToolSession = require('../models/ToolSession');
const { analyzeCBT, categorizeWorry } = require('../utils/geminiClient');

// @desc    Start a new tool session
// @route   POST /api/tools/session/start
exports.startSession = async (req, res, next) => {
  try {
    const { toolName, category, moodBefore, triggeredBy, screeningRef } = req.body;
    
    const session = await ToolSession.create({
      userId: req.user._id,
      toolName,
      category,
      moodBefore,
      triggeredBy: triggeredBy || 'manual',
      screeningRef,
      status: 'started'
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

// @desc    Update session data mid-flow
// @route   PUT /api/tools/session/:id
exports.updateSession = async (req, res, next) => {
  try {
    const { data, status } = req.body;
    const session = await ToolSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { data, status: status || 'started' },
      { new: true }
    );

    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    next(error);
  }
};

// @desc    Complete tool session
// @route   PUT /api/tools/session/:id/complete
exports.completeSession = async (req, res, next) => {
  try {
    const { data, moodAfter, durationSecs } = req.body;
    const session = await ToolSession.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { 
        data, 
        moodAfter, 
        durationSecs, 
        status: 'completed',
        completedAt: new Date()
      },
      { new: true }
    );

    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tool sessions for logged-in user
// @route   GET /api/tools/sessions/me
exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await ToolSession.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

// @desc    Get aggregated stats for dashboard charts
// @route   GET /api/tools/sessions/me/stats
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // 1. Tool usage count per tool (for horizontal bar chart)
    const usageByTool = await ToolSession.aggregate([
      { $match: { userId: userId, status: 'completed' } },
      { $group: { _id: '$toolName', count: { $sum: 1 } } }
    ]);

    // 2. Mood improvement per tool (for grouped bar chart)
    const moodStats = await ToolSession.aggregate([
      { $match: { userId: userId, status: 'completed', moodBefore: { $exists: true }, moodAfter: { $exists: true } } },
      { $group: { 
          _id: '$toolName', 
          avgBefore: { $avg: '$moodBefore' }, 
          avgAfter: { $avg: '$moodAfter' } 
      } }
    ]);

    res.json({
      usageByTool: usageByTool.reduce((acc, curr) => ({ ...acc, [curr._id]: curr.count }), {}),
      moodStats: moodStats.reduce((acc, curr) => ({ 
        ...acc, 
        [curr._id]: { 
          avgBefore: parseFloat(curr.avgBefore.toFixed(1)), 
          avgAfter: parseFloat(curr.avgAfter.toFixed(1)) 
        } 
      }), {})
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Analyze CBT Cycle with Gemini
// @route   POST /api/tools/cbt/analyse
exports.analyzeCBTCycle = async (req, res, next) => {
  try {
    const { situation, thought, feeling, behavior } = req.body;
    const analysis = await analyzeCBT(situation, thought, feeling, behavior);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
};

// @desc    Categorize Worry with Gemini
// @route   POST /api/tools/worries/categorise
exports.categorizeUserWorry = async (req, res, next) => {
  try {
    const { worry } = req.body;
    const categorization = await categorizeWorry(worry);
    res.json(categorization);
  } catch (error) {
    next(error);
  }
};
