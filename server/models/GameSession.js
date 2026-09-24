const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameType: {
    type: String,
    enum: ['decision_room', 'social_compass', 'mirror_journal'],
    required: true
  },
  responses: [{
    scenarioId: String,
    scenarioText: String,
    userResponse: String,
    timestamp: { type: Date, default: Date.now }
  }],
  aiAnalysis: {
    riskIndicators: [String],
    severity: {
      type: String,
      enum: ['low', 'moderate', 'high']
    },
    notes: String
  },
  completedAt: Date,
  language: {
    type: String,
    default: 'en'
  }
}, { timestamps: true });

module.exports = mongoose.model('GameSession', gameSessionSchema);
