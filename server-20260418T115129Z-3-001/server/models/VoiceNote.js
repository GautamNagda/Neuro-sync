const mongoose = require('mongoose');

const voiceNoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gridfsFileId: {
    type: mongoose.Schema.Types.ObjectId
  },
  audioData: {
    type: Buffer,
    select: false
  },
  mimeType: {
    type: String,
    default: 'audio/webm'
  },
  transcript: {
    type: String,
    select: false
  },
  emotionalTone: String,
  detailedDescription: String,
  improvementSuggestions: [String],
  recommendedTools: [String],
  riskFlags: [String],
  aiNotes: {
    type: String,
    select: false
  },
  recordedAt: {
    type: Date,
    default: Date.now
  },
  durationSeconds: Number
}, { timestamps: true });

module.exports = mongoose.model('VoiceNote', voiceNoteSchema);
