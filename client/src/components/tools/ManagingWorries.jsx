import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

export default function ManagingWorries({ sessionId, onComplete, onCancel }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0); // 0: MoodBefore, 1: Add Worry, 2: Board
  const [worry, setWorry] = useState('');
  const [worries, setWorries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const [moodBefore, setMoodBefore] = useState(5);
  const startTime = useRef(Date.now());

  const handleStart = async (selectedMood) => {
    setMoodBefore(selectedMood);
    setLoading(true);
    try {
      if (!currentSessionId) {
        const { data } = await api.post('/tools/session/start', {
          toolName: 'managing_worries',
          category: 'anxiety',
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

  const addWorry = async () => {
    if (!worry.trim()) return;
    setLoading(true);
    try {
      const { data: analysis } = await api.post('/tools/worries/categorise', { worry });
      
      const newWorry = {
        id: Date.now(),
        text: worry,
        category: analysis.category,
        suggestion: analysis.suggestion
      };
      
      const updatedWorries = [...worries, newWorry];
      setWorries(updatedWorries);
      setWorry('');
      setStep(2);
      
      // Update session data
      await api.put(`/tools/session/${currentSessionId}`, {
        data: { worries: updatedWorries }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const durationSecs = Math.round((Date.now() - startTime.current) / 1000);
      await api.put(`/tools/session/${currentSessionId}/complete`, {
        data: { worries },
        durationSecs
      });
      onComplete();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '520px',
    background: 'var(--surface)',
    color: 'var(--text-dark)',
    padding: '40px',
    borderRadius: '24px',
    fontFamily: "'DM Sans', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    maxWidth: '850px',
    width: '100%',
    boxShadow: '0 20px 50px var(--shadow)',
    border: '1px solid var(--border)',
    backdropFilter: 'blur(20px)'
  };

  const headerStyle = {
    fontFamily: "'Lora', serif",
    color: 'var(--text-dark)',
    fontSize: '1.7rem',
    marginBottom: '24px',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
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
                >
                  {m}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="add" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} style={{ textAlign: 'center' }}>
            <h2 style={headerStyle}>What is on your mind?</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 28, fontSize: '1.05rem' }}>Type one worry that is currently bothering you.</p>
            <div style={{ display: 'flex', gap: 12, maxWidth: 600, margin: '0 auto' }}>
              <input
                value={worry}
                onChange={e => setWorry(e.target.value)}
                placeholder="I am worried about..."
                className="input-field"
                style={{ flex: 1 }}
              />
              <button 
                onClick={addWorry} 
                className="btn-primary" 
                disabled={!worry.trim() || loading}
                style={{ padding: '0 32px' }}
              >
                {loading ? '...' : 'Categorise'}
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ ...headerStyle, margin: 0 }}>Worry Tree Board</h2>
              <button onClick={() => setStep(1)} className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                + Add Worry
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: 24, flex: 1, minHeight: 300 }}>
              {/* Controllable Column */}
              <div style={{ flex: 1, background: 'var(--soft)', borderRadius: 20, padding: 20, border: '1px solid var(--border)' }}>
                <h4 style={{ color: 'var(--primary)', fontSize: '0.95rem', fontWeight: 700, textAlign: 'center', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span>✓</span> Controllable
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {worries.filter(w => w.category === 'controllable').map(w => (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={w.id} style={{ background: 'var(--surface-elevated)', padding: 16, borderRadius: 16, boxShadow: '0 4px 12px var(--shadow)', border: '1px solid var(--border)' }}>
                      <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{w.text}</p>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontStyle: 'italic', background: 'var(--soft)', padding: '6px 10px', borderRadius: 8 }}>
                        {w.suggestion}
                      </div>
                    </motion.div>
                  ))}
                  {worries.filter(w => w.category === 'controllable').length === 0 && (
                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 40, opacity: 0.6 }}>Add things you can act on</p>
                  )}
                </div>
              </div>

              {/* Uncontrollable Column */}
              <div style={{ flex: 1, background: 'var(--background)', borderRadius: 20, padding: 20, border: '1px solid var(--border)', opacity: 0.9 }}>
                <h4 style={{ color: 'var(--accent)', fontSize: '0.95rem', fontWeight: 700, textAlign: 'center', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span>☁️</span> Uncontrollable
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {worries.filter(w => w.category === 'uncontrollable').map(w => (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} key={w.id} style={{ background: 'var(--surface-elevated)', padding: 16, borderRadius: 16, boxShadow: '0 4px 12px var(--shadow)', border: '1px solid var(--border)' }}>
                      <p style={{ margin: '0 0 8px', fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.95rem' }}>{w.text}</p>
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent)', fontStyle: 'italic', background: 'var(--background)', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
                        {w.suggestion}
                      </div>
                    </motion.div>
                  ))}
                  {worries.filter(w => w.category === 'uncontrollable').length === 0 && (
                    <p style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 40, opacity: 0.6 }}>Worries outside your control</p>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 30 }}>
               <button onClick={handleFinish} className="btn-primary" style={{ padding: '14px 60px', borderRadius: 16 }} disabled={loading}>
                 Finish & Save
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={onCancel} style={{ position: 'absolute', top: 20, right: 20, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
    </div>
  );
}
