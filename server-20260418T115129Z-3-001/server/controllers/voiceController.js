const VoiceNote = require('../models/VoiceNote');
const { analyzeVoiceTranscript } = require('../utils/geminiClient');

// @desc    Upload voice recording
// @route   POST /api/voice/upload
exports.uploadVoice = async (req, res, next) => {
  try {
    const { durationSeconds } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ message: 'No audio file provided' });
    }

    const voiceNote = new VoiceNote({
      userId: req.user._id,
      audioData: req.file.buffer,
      mimeType: req.file.mimetype || 'audio/webm',
      durationSeconds: durationSeconds || 0,
      recordedAt: new Date()
    });

    // Attempt transcription and analysis if API keys are configured
    if (process.env.ASSEMBLYAI_API_KEY) {
      try {
        const { transcribe } = require('../utils/assemblyai');
        const transcript = await transcribe(req.file.buffer);
        voiceNote.transcript = transcript;

        // Analyze with Claude
        const analysis = await analyzeVoiceTranscript(transcript);
        voiceNote.emotionalTone = analysis.emotionalTone || 'neutral';
        voiceNote.detailedDescription = analysis.detailedDescription || 'No description available.';
        voiceNote.improvementSuggestions = analysis.improvementSuggestions || [];
        voiceNote.recommendedTools = analysis.recommendedTools || [];
        voiceNote.riskFlags = analysis.riskFlags || [];
        voiceNote.aiNotes = analysis.notes || '';
      } catch (err) {
        console.error('Voice analysis error:', err.message);
        voiceNote.emotionalTone = 'pending_analysis';
      }
    } else {
      voiceNote.emotionalTone = 'analysis_unavailable';
    }

    await voiceNote.save();
    res.status(201).json({
      _id: voiceNote._id,
      emotionalTone: voiceNote.emotionalTone,
      detailedDescription: voiceNote.detailedDescription,
      improvementSuggestions: voiceNote.improvementSuggestions,
      recommendedTools: voiceNote.recommendedTools,
      riskFlags: voiceNote.riskFlags,
      durationSeconds: voiceNote.durationSeconds,
      recordedAt: voiceNote.recordedAt
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's voice notes
// @route   GET /api/voice/notes
exports.getNotes = async (req, res, next) => {
  try {
    const notes = await VoiceNote.find({ userId: req.user._id })
      .select('-audioData')
      .sort({ recordedAt: -1 });
    res.json(notes);
  } catch (error) {
    next(error);
  }
};

// @desc    Play voice recording
// @route   GET /api/voice/play/:id
exports.playVoice = async (req, res, next) => {
  try {
    const note = await VoiceNote.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('+audioData');

    if (!note || !note.audioData) {
      return res.status(404).json({ message: 'Recording not found' });
    }

    res.set('Content-Type', note.mimeType || 'audio/webm');
    res.send(note.audioData);
  } catch (error) {
    next(error);
  }
};

// @desc    Get voice note with transcript
// @route   GET /api/voice/note/:id
exports.getNote = async (req, res, next) => {
  try {
    const note = await VoiceNote.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).select('+transcript +aiNotes');

    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    next(error);
  }
};
