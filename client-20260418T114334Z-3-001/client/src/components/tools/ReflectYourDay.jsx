import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const PROMPTS = [
  'tools.reflect_prompt_1',
  'tools.reflect_prompt_2',
  'tools.reflect_prompt_3'
];

export default function ReflectYourDay({ sessionId, onComplete, onCancel }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0); // 0: Mood before, 1-3: Prompts, 4: Finished
  const [mood, setMood] = useState(5);
  const [answers, setAnswers] = useState(['', '', '']);
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const startTime = useEffect(() => Date.now(), []);

  const handleStart = async (selectedMood) => {
    setMood(selectedMood);
    setLoading(true);
    try {
      if (!currentSessionId) {
        const { data } = await api.post('/tools/session/start', {
          toolName: 'reflect_your_day',
          category: 'sleep',
          moodBefore: selectedMood,
          triggeredBy: sessionId ? 'post_screening' : 'manual'
        });
        setCurrentSessionId(data._id);
      }
      setStep(1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      submitSession();
    }
  };

  const submitSession = async () => {
    setLoading(true);
    try {
      const durationSecs = Math.round((Date.now() - startTime) / 1000);
      await api.put(`/tools/session/${currentSessionId}/complete`, {
        data: {
          prompts: PROMPTS.map((p, i) => ({
            question: t(p),
            answer: answers[i]
          })),
          mood: mood,
          timestamp: new Date()
        },
        durationSecs
      });
      setStep(4);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '400px',
    background: 'var(--surface)',
    color: 'var(--text-dark)',
    padding: '40px 30px',
    borderRadius: '24px',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: "'DM Sans', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    boxShadow: '0 10px 40px var(--shadow)',
    border: '1px solid var(--border)',
    backdropFilter: 'blur(20px)'
  };

  const promptStyle = {
    fontFamily: "'Lora', serif",
    fontSize: '1.7rem',
    marginBottom: '28px',
    lineHeight: '1.4',
    textAlign: 'center',
    color: 'var(--text-dark)'
  };

  return (
    <div style={containerStyle}>
      {/* Background Stars Decoration */}
      <div style={{ position: 'absolute', top: 20, right: 30, fontSize: 24, opacity: 0.3 }}>🌙</div>
      <div style={{ position: 'absolute', bottom: 40, left: 20, fontSize: 12, opacity: 0.2 }}>✨</div>
      <div style={{ position: 'absolute', top: 100, left: 40, fontSize: 10, opacity: 0.1 }}>✨</div>

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="mood" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
            <h2 style={promptStyle}>{t('tools.mood_before')}</h2>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 24 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(m => (
                <button
                  key={m}
                  onClick={() => handleStart(m)}
                  style={{
                    width: 44, height: 44, borderRadius: '50%', border: '1.5px solid var(--border)',
                    background: mood === m ? 'var(--primary)' : 'var(--surface-elevated)',
                    color: mood === m ? 'white' : 'var(--text-dark)', cursor: 'pointer',
                    fontSize: '1rem', fontWeight: 600, transition: 'all 0.2s'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step >= 1 && step <= 3 && (
          <motion.div key={`step-${step}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#778DA9', marginBottom: 12 }}>
              {step} / 3
            </p>
            <h2 style={promptStyle}>{t(PROMPTS[step - 1])}</h2>
            <div style={{ position: 'relative' }}>
              <textarea
                value={answers[step - 1]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[step - 1] = e.target.value.slice(0, 300);
                  setAnswers(newAnswers);
                }}
                placeholder="..."
                style={{
                  width: '100%', minHeight: '160px', background: 'var(--input-bg)',
                  border: '1.5px solid var(--border)', borderRadius: '16px', padding: '18px',
                  color: 'var(--text-dark)', fontSize: '1rem', resize: 'none', marginBottom: '8px'
                }}
              />
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#778DA9' }}>
                {answers[step - 1].length} / 300
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 30 }}>
              <button onClick={onCancel} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                {t('common.cancel', { defaultValue: 'Cancel' })}
              </button>
              <button
                onClick={handleNext}
                disabled={!answers[step - 1].trim() || loading}
                className="btn-primary"
                style={{ padding: '12px 36px' }}
              >
                {step === 3 ? (loading ? '...' : t('common.submit', { defaultValue: 'Finish' })) : t('common.next', { defaultValue: 'Next' })}
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="finish" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🌌</div>
            <h2 style={promptStyle}>{t('tools.reflect_confirm')}</h2>
            <p style={{ color: '#778DA9', marginBottom: 30 }}>{t('tools.session_saved')}</p>
            <button onClick={onComplete} className="btn-primary" style={{ background: '#415A77', border: 'none', padding: '12px 40px', borderRadius: '8px' }}>
              {t('common.close', { defaultValue: 'Close' })}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
