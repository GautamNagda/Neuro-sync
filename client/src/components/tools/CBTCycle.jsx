import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const EMOTIONS = [
  'Anxious', 'Sad', 'Angry', 'Ashamed', 'Fearful', 'Hopeful', 
  'Confused', 'Overwhelmed', 'Guilty', 'Lonely', 'Frustrated', 
  'Numb', 'Relieved', 'Irritable', 'Worried', 'Helpless'
];

export default function CBTCycle({ sessionId, onComplete, onCancel }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0); // 0: MoodBefore, 1: Situation, 2: Thought, 3: Feeling, 4: Behaviour, 5: AI Summary
  const [data, setData] = useState({
    situation: '',
    thought: '',
    feeling: [],
    behavior: ''
  });
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const [moodBefore, setMoodBefore] = useState(5);
  const startTime = useRef(Date.now());

  const handleStart = async (selectedMood) => {
    setMoodBefore(selectedMood);
    setLoading(true);
    try {
      if (!currentSessionId) {
        const { data: session } = await api.post('/tools/session/start', {
          toolName: 'cbt_cycle',
          category: 'anxiety',
          moodBefore: selectedMood,
          triggeredBy: sessionId ? 'post_screening' : 'manual'
        });
        setCurrentSessionId(session._id);
      }
      setStep(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      getAISummary();
    }
  };

  const toggleEmotion = (emotion) => {
    setData(prev => ({
      ...prev,
      feeling: prev.feeling.includes(emotion)
        ? prev.feeling.filter(e => e !== emotion)
        : [...prev.feeling, emotion]
    }));
  };

  const getAISummary = async () => {
    setLoading(true);
    setStep(5);
    try {
      const { data: analysis } = await api.post('/tools/cbt/analyse', {
        situation: data.situation,
        thought: data.thought,
        feeling: data.feeling.join(', '),
        behavior: data.behavior
      });
      setAiResult(analysis);
      
      const durationSecs = Math.round((Date.now() - startTime.current) / 1000);
      await api.put(`/tools/session/${currentSessionId}/complete`, {
        data: { ...data, aiSummary: analysis },
        durationSecs
      });
    } catch (err) {
      console.error(err);
      setAiResult({
        validation: "I understand you're going through a lot right now. It's valid to feel this way.",
        distortion: "Possible overgeneralization",
        reframe: "Consider that this is a single moment in time, not a permanent state.",
        experiment: "Try to observe your thoughts objectively for the next few hours."
      });
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    minHeight: '450px',
    background: 'var(--surface)',
    color: 'var(--text-dark)',
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 15px 35px var(--shadow)',
    fontFamily: "'DM Sans', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    maxWidth: '600px',
    width: '100%',
    border: '1px solid var(--border)',
    backdropFilter: 'blur(20px)'
  };

  const headerStyle = {
    fontFamily: "'Lora', serif",
    color: 'var(--text-dark)',
    fontSize: '1.6rem',
    marginBottom: '24px',
    textAlign: 'center'
  };

  return (
    <div style={cardStyle}>
       {/* Progress Dot Bar */}
       {step > 0 && (
         <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 30 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{ 
                width: 10, height: 10, borderRadius: '50%', 
                background: step >= i ? 'var(--primary)' : 'var(--border)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: step === i ? 'scale(1.2)' : 'scale(1)'
              }} />
            ))}
         </div>
       )}

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="mood" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
            <h2 style={headerStyle}>{t('tools.mood_before')}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(m => (
                <button
                  key={m}
                  onClick={() => handleStart(m)}
                  style={{
                    width: 44, height: 44, borderRadius: '50%', border: '1.5px solid var(--border)',
                    background: moodBefore === m ? 'var(--primary)' : 'var(--surface-elevated)',
                    color: moodBefore === m ? 'white' : 'var(--text-dark)', cursor: 'pointer',
                    fontSize: '1rem', fontWeight: 600, transition: 'all 0.2s'
                  }}
                  onMouseOver={e => moodBefore !== m && (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onMouseOut={e => moodBefore !== m && (e.currentTarget.style.borderColor = 'var(--border)')}
                >
                  {m}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="situation" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <h2 style={headerStyle}>{t('tools.cbt_situation')}</h2>
            <textarea
              value={data.situation}
              onChange={(e) => setData({ ...data, situation: e.target.value })}
              placeholder="..."
              className="input-field"
              style={{ width: '100%', minHeight: '150px', borderRadius: 16, padding: 18, fontSize: '1rem' }}
            />
            <button onClick={handleNext} disabled={!data.situation.trim()} className="btn-primary" style={{ marginTop: 24, width: '100%' }}>
              {t('common.next', { defaultValue: 'Next' })}
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="thought" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <h2 style={headerStyle}>{t('tools.cbt_thought')}</h2>
            <textarea
              value={data.thought}
              onChange={(e) => setData({ ...data, thought: e.target.value })}
              placeholder="..."
              className="input-field"
              style={{ width: '100%', minHeight: '150px', borderRadius: 16, padding: 18, fontSize: '1rem' }}
            />
            <button onClick={handleNext} disabled={!data.thought.trim()} className="btn-primary" style={{ marginTop: 24, width: '100%' }}>
              Next
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="feeling" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <h2 style={headerStyle}>{t('tools.cbt_feeling')}</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {EMOTIONS.map(e => (
                <button
                  key={e}
                  onClick={() => toggleEmotion(e)}
                  style={{
                    padding: '10px 20px', borderRadius: '30px', border: '1.5px solid',
                    borderColor: data.feeling.includes(e) ? 'var(--primary)' : 'var(--border)',
                    background: data.feeling.includes(e) ? 'var(--soft)' : 'var(--surface-elevated)',
                    color: data.feeling.includes(e) ? 'var(--primary-dark)' : 'var(--text-dark)',
                    fontSize: '0.9rem', cursor: 'pointer', transition: 'all 0.2s',
                    fontWeight: data.feeling.includes(e) ? 600 : 400
                  }}
                >
                  {e}
                </button>
              ))}
            </div>
            <button onClick={handleNext} disabled={data.feeling.length === 0} className="btn-primary" style={{ marginTop: 24, width: '100%' }}>
              Next
            </button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="behavior" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
            <h2 style={headerStyle}>{t('tools.cbt_behavior')}</h2>
            <textarea
              value={data.behavior}
              onChange={(e) => setData({ ...data, behavior: e.target.value })}
              placeholder="..."
              className="input-field"
              style={{ width: '100%', minHeight: '150px', borderRadius: 16, padding: 18, fontSize: '1rem' }}
            />
            <button onClick={handleNext} disabled={!data.behavior.trim()} className="btn-primary" style={{ marginTop: 24, width: '100%' }}>
              Get AI Analysis
            </button>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={headerStyle}>CBT Analysis</h2>
            {loading ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="animate-breathe" style={{ fontSize: 40 }}>🤖</div>
              </div>
            ) : aiResult ? (
               <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div style={{ background: 'var(--soft)', padding: 18, borderRadius: 16, border: '1px solid var(--border)' }}>
                     <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Emotional Validation</h4>
                     <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-dark)' }}>{aiResult.validation}</p>
                  </div>
                  <div style={{ background: 'var(--background)', padding: 18, borderRadius: 16, border: '1px solid var(--warning)', opacity: 0.9 }}>
                     <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem', color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cognitive Distortion</h4>
                     <p style={{ margin: 0, fontSize: '1rem', fontStyle: 'italic', color: 'var(--text-dark)' }}>{aiResult.distortion}</p>
                  </div>
                  <div style={{ background: 'var(--soft)', padding: 18, borderRadius: 16, border: '1px solid var(--primary-light)' }}>
                     <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Alternative Reframe</h4>
                     <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-dark)' }}>{aiResult.reframe}</p>
                  </div>
                  <div style={{ background: 'var(--surface-elevated)', padding: 18, borderRadius: 16, border: '1px solid var(--primary)', boxShadow: '0 4px 12px var(--shadow)' }}>
                     <h4 style={{ margin: '0 0 6px', fontSize: '0.85rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Daily Experiment</h4>
                     <p style={{ margin: 0, fontSize: '1rem', color: 'var(--text-dark)' }}>{aiResult.experiment}</p>
                  </div>
                  <button onClick={onComplete} className="btn-primary" style={{ marginTop: 10, width: '100%' }}>Complete & Close</button>
               </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={onCancel} style={{ position: 'absolute', top: 20, right: 20, color: '#ccc', background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
    </div>
  );
}
