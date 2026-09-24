const mongoose = require('mongoose');

const toolSessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  toolName: { 
    type: String, 
    enum: [
      'reflect_your_day', 
      'jacobson_relaxation', 
      'cbt_cycle', 
      'managing_worries', 
      'organise_your_day'
    ], 
    required: true 
  },
  category: { 
    type: String, 
    enum: ['sleep', 'anxiety', 'stress'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['started', 'completed', 'abandoned'], 
    default: 'started' 
  },
  data: { 
    type: mongoose.Schema.Types.Mixed 
  },   // tool-specific payload
  moodBefore: { 
    type: Number, 
    min: 1, 
    max: 10 
  },
  moodAfter: { 
    type: Number, 
    min: 1, 
    max: 10 
  },
  durationSecs: { 
    type: Number 
  },
  triggeredBy: { 
    type: String, 
    enum: ['manual', 'post_screening', 'chatbot', 'dashboard'] 
  },
  screeningRef: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ScreeningSession' 
  },
  completedAt: { 
    type: Date 
  },
}, {
  timestamps: true
});

// data field storage details for reference:
// - reflect_your_day   → { prompts: [{question, answer}], mood: String, timestamp }
// - jacobson_relaxation→ { muscleGroups: [{name, tensionLevel, completed}], totalCycles: Number }
// - cbt_cycle          → { situation: String, thought: String, feeling: String, behavior: String, aiSummary: String }
// - managing_worries    → { worries: [{text, category:'controllable'|'uncontrollable', suggestion: String}] }
// - organise_your_day  → { tasks: [{title, priority:'high'|'medium'|'low', completed: Boolean, completedAt}] }

const ToolSession = mongoose.model('ToolSession', toolSessionSchema);

module.exports = ToolSession;
