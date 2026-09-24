const PDFDocument = require('pdfkit');
const ScreeningSession = require('../models/ScreeningSession');
const ToolSession = require('../models/ToolSession');
const VoiceNote = require('../models/VoiceNote');

// @desc    Generate PDF report
// @route   GET /api/reports/generate/:sessionId
exports.generateReport = async (req, res, next) => {
   try {
      const session = await ScreeningSession.findOne({
         _id: req.params.sessionId,
         userId: req.user._id
      }).select('+aiAnalysis');

      if (!session) return res.status(404).json({ message: 'Session not found' });

      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Neuro Sync AI_Report_${session.type}_${Date.now()}.pdf`);
      doc.pipe(res);

      // Header
      doc.fontSize(24).font('Helvetica-Bold')
         .fillColor('#2D6A4F')
         .text('Neuro Sync AI', { align: 'center' });
      doc.fontSize(10).font('Helvetica')
         .fillColor('#666')
         .text('AI Mental Health Screening Platform', { align: 'center' });
      doc.moveDown(0.5);

      // Government watermark note
      doc.fontSize(8).fillColor('#999')
         .text('Government Public Health Initiative — Confidential Screening Report', { align: 'center' });

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#2D6A4F');
      doc.moveDown();

      // Report Info
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1B2D2A')
         .text('Screening Report', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').fillColor('#333');
      doc.text(`Date: ${new Date(session.completedAt || session.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}`);
      doc.text(`Screening Type: ${session.type === 'PHQ9' ? 'Patient Health Questionnaire (PHQ-9) — Depression' : 'Generalized Anxiety Disorder (GAD-7) — Anxiety'}`);
      doc.text(`Language: ${session.language?.toUpperCase() || 'EN'}`);
      doc.moveDown();

      // Score Summary
      const maxScore = session.type === 'PHQ9' ? 27 : 21;
      const severityColors = {
         minimal: '#52B788',
         mild: '#F4A261',
         moderate: '#E76F51',
         moderately_severe: '#E63946',
         severe: '#9B2226'
      };

      doc.fontSize(16).font('Helvetica-Bold')
         .fillColor(severityColors[session.severity] || '#333')
         .text(`Total Score: ${session.totalScore}/${maxScore}`, { align: 'center' });
      doc.fontSize(14)
         .text(`Severity: ${(session.severity || 'N/A').replace('_', ' ').toUpperCase()}`, { align: 'center' });
      doc.moveDown();

      // Response Breakdown Table
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1B2D2A')
         .text('Response Breakdown', { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(9).font('Helvetica');
      const tableTop = doc.y;

      // Table header
      doc.font('Helvetica-Bold').fillColor('#2D6A4F');
      doc.text('#', 50, tableTop, { width: 30 });
      doc.text('Question', 80, tableTop, { width: 350 });
      doc.text('Score', 430, tableTop, { width: 50 });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#ddd');
      doc.moveDown(0.3);

      // Table rows
      doc.font('Helvetica').fillColor('#333');
      session.responses.forEach((r, i) => {
         if (doc.y > 700) { doc.addPage(); }
         const scoreLabels = ['Not at all', 'Several days', 'More than half the days', 'Nearly every day'];
         doc.text(`${i + 1}`, 50, doc.y, { width: 30 });
         const y = doc.y;
         doc.text(r.questionText || `Question ${r.questionId}`, 80, y, { width: 350 });
         doc.text(`${r.score}/3 (${scoreLabels[r.score] || r.score})`, 430, y, { width: 115 });
         doc.moveDown(0.8);
      });

      doc.moveDown();

      // AI Analysis
      if (session.aiAnalysis) {
         doc.fontSize(12).font('Helvetica-Bold').fillColor('#1B2D2A')
            .text('AI Analysis Summary', { underline: true });
         doc.moveDown(0.5);
         doc.fontSize(10).font('Helvetica').fillColor('#333')
            .text(session.aiAnalysis, { align: 'justify' });
         doc.moveDown();
      }

      // Recommendations
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1B2D2A')
         .text('Recommendations', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').fillColor('#333')
         .text(session.recommendation || 'No specific recommendations at this time.');
      doc.moveDown();

      // Therapeutic Tools Activity (NEW)
      try {
         const tools = await ToolSession.find({ 
            userId: req.user._id, 
            status: 'completed',
            createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
         }).limit(10).sort({ createdAt: -1 });

         if (tools && tools.length > 0) {
            if (doc.y > 600) doc.addPage();
            doc.fontSize(12).font('Helvetica-Bold').fillColor('#1B2D2A')
               .text('Therapeutic Activity Summary (Last 30 Days)', { underline: true });
            doc.moveDown(0.5);
            
            tools.forEach(t => {
               const toolName = (t.toolName || 'tool').replace(/_/g, ' ').toUpperCase();
               doc.fontSize(9).font('Helvetica-Bold').fillColor('#2D6A4F')
                  .text(`${toolName} - ${new Date(t.createdAt).toLocaleDateString()}`);
               doc.fontSize(8).font('Helvetica').fillColor('#666')
                  .text(`Mood: ${t.moodBefore || '--'} -> ${t.moodAfter || '--'} | Duration: ${Math.round(t.durationSecs / 60)} min`);
               doc.moveDown(0.3);
            });
            doc.moveDown();
         }
      } catch (err) {
         console.error('PDF Tool Summary Error:', err);
      }

      // Disclaimer
      if (doc.y > 650) doc.addPage();
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E63946');
      doc.moveDown(0.5);
      doc.fontSize(8).font('Helvetica-BoldOblique').fillColor('#E63946')
         .text('DISCLAIMER: This report is for screening purposes only and does not constitute a clinical diagnosis. Please consult a licensed mental health professional for a comprehensive evaluation.', { align: 'center' });

      doc.moveDown();
      doc.fontSize(8).font('Helvetica').fillColor('#666')
         .text('Crisis Helplines:', { align: 'center' });
      doc.text('iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345 | NIMHANS: 080-46110007', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(7).fillColor('#999')
         .text(`Report generated on ${new Date().toLocaleString('en-IN')} | Neuro Sync AI v1.0`, { align: 'center' });

      doc.end();
   } catch (error) {
      next(error);
   }
};

// @desc    Generate voice journal PDF report
// @route   GET /api/reports/generate-voice/:noteId
exports.generateVoiceReport = async (req, res, next) => {
   try {
      const note = await VoiceNote.findOne({
         _id: req.params.noteId,
         userId: req.user._id
      }).select('+aiNotes +transcript');

      if (!note) return res.status(404).json({ message: 'Recording not found' });

      const doc = new PDFDocument({ margin: 50, size: 'A4' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=VoiceJournal_Report_${Date.now()}.pdf`);
      doc.pipe(res);

      // Header
      doc.fontSize(24).font('Helvetica-Bold')
         .fillColor('#2D6A4F')
         .text('Neuro Sync AI', { align: 'center' });
      doc.fontSize(10).font('Helvetica')
         .fillColor('#666')
         .text('AI Mental Health Screening Platform', { align: 'center' });
      doc.moveDown(0.5);

      // Government watermark note
      doc.fontSize(8).fillColor('#999')
         .text('Government Public Health Initiative — Confidential Screening Report', { align: 'center' });

      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#2D6A4F');
      doc.moveDown();

      // Report Info
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1B2D2A')
         .text('Voice Journal Report', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').fillColor('#333');
      doc.text(`Date: ${new Date(note.recordedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`);
      doc.text(`Duration: ${Math.floor(note.durationSeconds / 60)}m ${note.durationSeconds % 60}s`);
      doc.text(`Primary Emotion: ${(note.emotionalTone || 'N/A').toUpperCase()}`);
      doc.moveDown();

      // Detailed Description
      if (note.detailedDescription) {
         doc.fontSize(12).font('Helvetica-Bold').fillColor('#1B2D2A')
            .text('Emotional State Analysis', { underline: true });
         doc.moveDown(0.5);
         doc.fontSize(10).font('Helvetica').fillColor('#333')
            .text(note.detailedDescription, { align: 'justify' });
         doc.moveDown();
      }

      // Actionable Suggestions
      if (note.improvementSuggestions && note.improvementSuggestions.length > 0) {
         doc.fontSize(12).font('Helvetica-Bold').fillColor('#1B2D2A')
            .text('Actionable Coping Strategies', { underline: true });
         doc.moveDown(0.5);
         doc.fontSize(10).font('Helvetica').fillColor('#333');
         note.improvementSuggestions.forEach((suggestion) => {
            doc.text(`• ${suggestion}`);
            doc.moveDown(0.3);
         });
         doc.moveDown();
      }

      // Recommended Tools
      if (note.recommendedTools && note.recommendedTools.length > 0) {
         doc.fontSize(12).font('Helvetica-Bold').fillColor('#1B2D2A')
            .text('Recommended Therapeutic Exercises', { underline: true });
         doc.moveDown(0.5);
         doc.fontSize(10).font('Helvetica').fillColor('#2D6A4F');
         note.recommendedTools.forEach((tool) => {
            doc.text(`> ${tool}`);
            doc.moveDown(0.3);
         });
         doc.moveDown();
      }

      // Disclaimer
      if (doc.y > 650) doc.addPage();
      doc.moveDown();
      doc.moveTo(50, doc.y).lineTo(545, doc.y).stroke('#E63946');
      doc.moveDown(0.5);
      doc.fontSize(8).font('Helvetica-BoldOblique').fillColor('#E63946')
         .text('DISCLAIMER: This report is for screening purposes only and does not constitute a clinical diagnosis. Please consult a licensed mental health professional for a comprehensive evaluation.', { align: 'center' });

      doc.moveDown();
      doc.fontSize(8).font('Helvetica').fillColor('#666')
         .text('Crisis Helplines:', { align: 'center' });
      doc.text('iCall: 9152987821 | Vandrevala Foundation: 1860-2662-345 | NIMHANS: 080-46110007', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(7).fillColor('#999')
         .text(`Report generated on ${new Date().toLocaleString('en-IN')} | Neuro Sync AI v1.0`, { align: 'center' });

      doc.end();
   } catch (error) {
      next(error);
   }
};
