const GameSession = require('../models/GameSession');
const { analyzeGameResponse } = require('../utils/geminiClient');

const SCENARIOS = {
  decision_room: [
    {
      id: 'dr_1',
      text: 'You receive critical feedback on a project you worked hard on. Your deadline is tomorrow. What do you do?',
      options: [
        { id: 'A', text: 'Stay up all night redoing everything from scratch' },
        { id: 'B', text: 'Review the feedback, prioritize changes, and ask for a short extension if needed' },
        { id: 'C', text: 'Feel overwhelmed and consider not submitting at all' }
      ]
    },
    {
      id: 'dr_2',
      text: 'Your team is celebrating a successful project. You contributed significantly but weren\'t publicly acknowledged. How do you react?',
      options: [
        { id: 'A', text: 'Speak up calmly and mention your contributions' },
        { id: 'B', text: 'Say nothing but feel resentful and withdraw from future projects' },
        { id: 'C', text: 'Assume your work doesn\'t matter and that you\'ll never be recognized' }
      ]
    }
  ],
  social_compass: [
    {
      id: 'sc_1',
      text: 'A friend invites you to a gathering with people you don\'t know well. How do you feel?',
      options: [
        { id: 'A', text: 'Excited to meet new people and socialize' },
        { id: 'B', text: 'Nervous but willing to go for a short time' },
        { id: 'C', text: 'Dread and anxiety — you make an excuse to stay home' }
      ]
    },
    {
      id: 'sc_2',
      text: 'During a group conversation, you realize everyone is looking at you to share your opinion. What happens?',
      options: [
        { id: 'A', text: 'You share your thoughts confidently' },
        { id: 'B', text: 'Your heart races but you manage to say something brief' },
        { id: 'C', text: 'You freeze, mumble, and feel embarrassed for the rest of the day' }
      ]
    }
  ],
  mirror_journal: [
    {
      id: 'mj_1',
      text: 'Write 3 sentences about how your week has been going.',
      type: 'freetext'
    }
  ]
};

// @desc    Get game scenarios
// @route   GET /api/games/scenarios/:gameType
exports.getScenarios = (req, res) => {
  const { gameType } = req.params;
  const scenarios = SCENARIOS[gameType];
  if (!scenarios) return res.status(404).json({ message: 'Game not found' });
  res.json(scenarios);
};

// @desc    Submit game response
// @route   POST /api/games/submit
exports.submitResponse = async (req, res, next) => {
  try {
    const { gameType, responses } = req.body;

    // Get AI analysis
    let aiAnalysis = { riskIndicators: [], severity: 'low', notes: 'Analysis pending' };
    
    try {
      const scenarios = SCENARIOS[gameType];
      const responseDetails = responses.map(r => {
        const scenario = scenarios.find(s => s.id === r.scenarioId);
        return {
          scenario: scenario?.text || r.scenarioId,
          response: r.userResponse
        };
      });

      const aiAnalysisResult = await analyzeGameResponse(
        gameType,
        JSON.stringify(responseDetails.map(r => r.scenario)),
        JSON.stringify(responseDetails.map(r => r.response))
      );
      
      aiAnalysis = aiAnalysisResult;
    } catch (err) {
      console.error('Game analysis error:', err.message);
    }

    const session = await GameSession.create({
      userId: req.user._id,
      gameType,
      responses: responses.map(r => ({
        scenarioId: r.scenarioId,
        scenarioText: SCENARIOS[gameType]?.find(s => s.id === r.scenarioId)?.text || '',
        userResponse: r.userResponse
      })),
      aiAnalysis,
      completedAt: new Date(),
      language: req.body.language || 'en'
    });

    res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

// @desc    Get game history
// @route   GET /api/games/history
exports.getHistory = async (req, res, next) => {
  try {
    const sessions = await GameSession.find({ userId: req.user._id })
      .sort({ completedAt: -1 })
      .limit(20);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};
