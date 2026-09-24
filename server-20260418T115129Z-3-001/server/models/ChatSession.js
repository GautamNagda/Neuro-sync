const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: {
    type: [{
      role: { type: String, enum: ['user', 'assistant'], required: true },
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now }
    }],
    select: false
  },
  sessionStart: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  riskLevel: {
    type: String,
    enum: ['none', 'low', 'moderate', 'high'],
    default: 'none'
  },
  crisisTriggered: {
    type: Boolean,
    default: false
  },
  messageCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
