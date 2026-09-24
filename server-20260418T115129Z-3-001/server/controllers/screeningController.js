const ScreeningSession = require('../models/ScreeningSession');

// @desc    Create screening session
// @route   POST /api/screening
exports.createSession = async (req, res, next) => {
  try {
    const { type, responses, language } = req.body;
    
    const totalScore = responses.reduce((sum, r) => sum + r.score, 0);
    
    const session = new ScreeningSession({
      userId: req.user._id,
      type,
      responses,
      totalScore,
      language: language || req.user.language || 'en',
      isComplete: true,
      completedAt: new Date()
    });

    session.severity = session.calculateSeverity();
    session.recommendation = getRecommendation(session.severity, type);

    // AI Analysis
    try {
      const { analyzeScreening } = require('../utils/geminiClient');
      const analysis = await analyzeScreening(
        type,
        responses,
        totalScore,
        session.severity
      );
      session.aiAnalysis = analysis.summary;
      // We could also store keyFindings/recommendations if we add them to the model
    } catch (err) {
      console.error('Screening analysis error:', err.message);
    }

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

// @desc    Save partial screening (save & continue later)
// @route   POST /api/screening/save-progress
exports.saveProgress = async (req, res, next) => {
  try {
    const { type, responses, language, sessionId } = req.body;
    
    if (sessionId) {
      const session = await ScreeningSession.findOneAndUpdate(
        { _id: sessionId, userId: req.user._id },
        { responses, language },
        { new: true }
      );
      return res.json(session);
    }

    const session = await ScreeningSession.create({
      userId: req.user._id,
      type,
      responses,
      language: language || 'en',
      isComplete: false
    });
    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all screening sessions for user
// @route   GET /api/screening
exports.getSessions = async (req, res, next) => {
  try {
    const { type, page = 1, limit = 10 } = req.query;
    const query = { userId: req.user._id, isComplete: true };
    if (type) query.type = type;

    const sessions = await ScreeningSession.find(query)
      .sort({ completedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ScreeningSession.countDocuments(query);

    res.json({
      sessions,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single screening session
// @route   GET /api/screening/:id
exports.getSession = async (req, res, next) => {
  try {
    const session = await ScreeningSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('+aiAnalysis');
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.json(session);
  } catch (error) {
    next(error);
  }
};

// @desc    Get incomplete session
// @route   GET /api/screening/incomplete/:type
exports.getIncomplete = async (req, res, next) => {
  try {
    const session = await ScreeningSession.findOne({
      userId: req.user._id,
      type: req.params.type,
      isComplete: false
    }).sort({ updatedAt: -1 });

    res.json(session);
  } catch (error) {
    next(error);
  }
};

function getRecommendation(severity, type) {
  const recs = {
    minimal: 'Your screening indicates minimal symptoms. Continue maintaining your mental wellness through regular self-care activities.',
    mild: 'Your screening suggests mild symptoms. Consider incorporating stress-management techniques, regular exercise, and mindfulness practices.',
    moderate: 'Your screening indicates moderate symptoms. We recommend consulting with a mental health professional for a comprehensive evaluation.',
    moderately_severe: 'Your screening suggests moderately severe symptoms. Please seek professional mental health support promptly. Contact your healthcare provider or a mental health helpline.',
    severe: 'Your screening indicates severe symptoms. It is strongly recommended to seek immediate professional help. Contact a crisis helpline: iCall (9152987821) or Vandrevala Foundation (1860-2662-345).'
  };
  return recs[severity] || recs.minimal;
}
