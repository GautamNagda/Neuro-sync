import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const MUSCLE_GROUPS = [
  { id: 'hands', name: 'Hands', instruction: 'Clench your fists as tight as possible...' },
  { id: 'arms', name: 'Arms', instruction: 'Biceps and triceps - bend your arms at the elbows...' },
  { id: 'shoulders', name: 'Shoulders', instruction: 'Raise your shoulders towards your ears...' },
  { id: 'face', name: 'Face', instruction: 'Squeeze your eyes shut and clench your jaw...' },
  { id: 'abdomen', name: 'Abdomen', instruction: 'Tighten your stomach muscles...' },
  { id: 'legs', name: 'Legs', instruction: 'Flex your toes and tighten your calf/thigh muscles...' }
];

const TENSE_TIME = 7;
const RELAX_TIME = 15;

export default function JacobsonRelaxation({ sessionId, onComplete, onCancel }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0); // 0: Start, 1: Tense, 2: Relax, 3: Completed
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timer, setTimer] = useState(0);
  const [moodAfter, setMoodAfter] = useState(5);
  const [currentSessionId, setCurrentSessionId] = useState(sessionId);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const timerRef = useRef(null);
  const startTime = useRef(Date.now());

  useEffect(() => {
    return () => {
      stopAudio();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startAudio = () => {
    if (!audioEnabled) return;
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      oscillatorRef.current = audioCtxRef.current.createOscillator();
      const gainNode = audioCtxRef.current.createGain();
      
      oscillatorRef.current.type = 'sine';
      oscillatorRef.current.frequency.setValueAtTime(220, audioCtxRef.current.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioCtxRef.current.currentTime);
      
      oscillatorRef.current.connect(gainNode);
      gainNode.connect(audioCtxRef.current.destination);
      oscillatorRef.current.start();
    } catch (err) {
      console.error('Audio failed:', err);
    }
  };

  const stopAudio = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (err) {}
      oscillatorRef.current = null;
    }
  };

  const startSession = async () => {
    try {
      if (!currentSessionId) {
        const { data } = await api.post('/tools/session/start', {
          toolName: 'jacobson_relaxation',
          category: 'sleep',
          triggeredBy: sessionId ? 'post_screening' : 'manual'
        });
        setCurrentSessionId(data._id);
      }
      startTime.current = Date.now();
      beginStep(0, 1);
    } catch (err) {
      console.error(err);
    }
  };

  const beginStep = (idx, type) => {
    setCurrentIdx(idx);
    setStep(type);
    setTimer(type === 1 ? TENSE_TIME : RELAX_TIME);
    
    if (type === 1) startAudio();
    else stopAudio();

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleStepEnd(idx, type);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleStepEnd = (idx, type) => {
    if (type === 1) {
      // Finished tensing, move to relax
      beginStep(idx, 2);
    } else {
      // Finished relaxing, move to next group or complete
      if (idx < MUSCLE_GROUPS.length - 1) {
        beginStep(idx + 1, 1);
      } else {
        setStep(3);
        stopAudio();
      }
    }
  };

  const finishSession = async (finalMood) => {
    try {
      const durationSecs = Math.round((Date.now() - startTime.current) / 1000);
      await api.put(`/tools/session/${currentSessionId}/complete`, {
        data: {
          muscleGroups: MUSCLE_GROUPS.map(m => ({ name: m.name, completed: true })),
          totalCycles: 1
        },
        moodAfter: finalMood,
        durationSecs
      });
      onComplete();
    } catch (err) {
      console.error(err);
    }
  };

  const containerStyle = {
    minHeight: '450px',
    background: 'var(--surface)',
    color: 'var(--text-dark)',
    padding: '40px 30px',
    borderRadius: '24px',
    fontFamily: "'DM Sans', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    boxShadow: '0 10px 40px var(--shadow)',
    position: 'relative',
    border: '1px solid var(--border)',
    backdropFilter: 'blur(20px)'
  };

  const group = MUSCLE_GROUPS[currentIdx];

  return (
    <div style={containerStyle}>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '2.2rem', marginBottom: 20, color: 'var(--text-dark)' }}>Relax Your Body</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 30, maxWidth: 400, margin: '0 auto' }}>
              Release physical tension through guided progressive muscle relaxation. 
              Find a comfortable seat or lie down.
            </p>
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <input type="checkbox" checked={audioEnabled} onChange={e => setAudioEnabled(e.target.checked)} id="audio-toggle" />
              <label htmlFor="audio-toggle" style={{ fontSize: '0.8rem', opacity: 0.8 }}>Sound Cues (220Hz Tone)</label>
            </div>
            <button onClick={startSession} className="btn-primary" 
              style={{ padding: '14px 44px', borderRadius: '30px', fontSize: '1.1rem' }}>
              Start Session
            </button>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div key="tense" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ color: 'var(--accent)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' }}>TENSE</h3>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '2.2rem', marginBottom: 12, color: 'var(--text-dark)' }}>{group.name}</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: 40, color: 'var(--text-dark)' }}>{group.instruction}</p>
            
            <div style={{ width: 120, height: 120, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="6" />
                  <motion.circle cx="60" cy="60" r="50" fill="none" stroke="var(--primary)" strokeWidth="6"
                    initial={{ pathLength: 1 }}
                    animate={{ pathLength: timer / TENSE_TIME }}
                    transition={{ duration: 1, ease: "linear" }}
                    strokeLinecap="round"
                  />
               </svg>
               <span style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--text-dark)' }}>{timer}</span>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="relax" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <h3 style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 700, letterSpacing: 2, marginBottom: 16, textTransform: 'uppercase' }}>RELAX</h3>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '2.2rem', marginBottom: 12, color: 'var(--text-dark)' }}>{group.name}</h2>
            <p style={{ fontSize: '1.1rem', marginBottom: 40, color: 'var(--text-muted)' }}>Let all the tension go...</p>
            
            <div style={{ width: 180, height: 180, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <motion.div 
                 animate={{ scale: [1, 1.4, 1] }}
                 transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                 style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', background: 'var(--soft)', opacity: 0.2 }}
               />
               <motion.div 
                 animate={{ scale: [1, 1.2, 1] }}
                 transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                 style={{ position: 'absolute', width: '80%', height: '80%', borderRadius: '50%', background: 'var(--soft)', opacity: 0.4 }}
               />
               <span style={{ fontSize: '2.5rem', fontWeight: 700, zIndex: 2, color: 'var(--text-dark)' }}>{timer}</span>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="finish" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🕯️</div>
            <h2 style={{ fontFamily: "'Lora', serif", fontSize: '2.2rem', marginBottom: 12, color: 'var(--text-dark)' }}>Deeply Relaxed</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 30 }}>How do you feel after this exercise?</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 30, flexWrap: 'wrap' }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(m => (
                <button
                  key={m}
                  onClick={() => finishSession(m)}
                  style={{
                    width: 44, height: 44, borderRadius: '50%', border: '1.5px solid var(--border)',
                    background: moodAfter === m ? 'var(--primary)' : 'var(--surface-elevated)',
                    color: moodAfter === m ? 'white' : 'var(--text-dark)', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
            
            <button onClick={() => finishSession(moodAfter)} className="btn-primary" 
              style={{ padding: '12px 48px', borderRadius: '30px' }}>
              Complete Exercise
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={onCancel} style={{ position: 'absolute', top: 20, left: 20, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 600 }}>
        ✕ Exit
      </button>
    </div>
  );
}
