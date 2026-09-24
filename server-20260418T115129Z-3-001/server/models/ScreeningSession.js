const mongoose = require('mongoose');

const screeningSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['PHQ9', 'GAD7', 'COMBINED'],
    required: true
  },
  responses: [{
    questionId: String,
    score: { type: Number, min: 0, max: 3 },
    questionText: String
  }],
  totalScore: {
    type: Number,
    default: 0
  },
  severity: {
    type: String,
    enum: ['minimal', 'mild', 'moderate', 'moderately_severe', 'severe']
  },
  recommendation: String,
  completedAt: Date,
  voiceNoteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VoiceNote',
    default: null
  },
  aiAnalysis: {
    type: String,
    select: false
  },
  language: {
    type: String,
    default: 'en'
  },
  isComplete: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

// Calculate severity based on type and score
screeningSessionSchema.methods.calculateSeverity = function() {
  const score = this.totalScore;
  if (this.type === 'PHQ9') {
    if (score <= 4) return 'minimal';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    if (score <= 19) return 'moderately_severe';
    return 'severe';
  } else if (this.type === 'GAD7') {
    if (score <= 4) return 'minimal';
    if (score <= 9) return 'mild';
    if (score <= 14) return 'moderate';
    return 'severe';
  }
  return 'minimal';
};

module.exports = mongoose.model('ScreeningSession', screeningSessionSchema);
