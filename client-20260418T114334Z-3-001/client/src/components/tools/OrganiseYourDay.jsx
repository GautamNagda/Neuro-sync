import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

export default function OrganiseYourDay({ sessionId, onComplete, onCancel }) {
  const { t } = useTranslation();
  const [step, setStep] = useState(0); // 0: MoodBefore, 1: Task Entry, 2: Final Summary
  const [task, setTask] = useState('');
  const [priority, setPriority] = useState('medium');
  const [tasks, setTasks] = useState([]);
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
          toolName: 'organise_your_day',
          category: 'stress',
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

  const addTask = async () => {
    if (!task.trim()) return;
    const newTask = {
      id: Date.now(),
      title: task,
      priority,
      completed: false
    };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    setTask('');
    setPriority('medium');
    
    // Auto-save progress
    try {
      await api.put(`/tools/session/${currentSessionId}`, {
        data: { tasks: updatedTasks }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const toggleTask = async (id) => {
    const updatedTasks = tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date() : null } : t
    );
    setTasks(updatedTasks);
    try {
      await api.put(`/tools/session/${currentSessionId}`, {
        data: { tasks: updatedTasks }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const removeTask = async (id) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    try {
      await api.put(`/tools/session/${currentSessionId}`, {
        data: { tasks: updatedTasks }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      const durationSecs = Math.round((Date.now() - startTime.current) / 1000);
      await api.put(`/tools/session/${currentSessionId}/complete`, {
        data: { tasks },
        durationSecs
      });
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '550px',
    background: 'var(--surface)',
    color: 'var(--text-dark)',
    padding: '40px',
    borderRadius: '24px',
    fontFamily: "'DM Sans', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    maxWidth: '700px',
    width: '100%',
    boxShadow: '0 25px 50px var(--shadow)',
    border: '1px solid var(--border)',
    backdropFilter: 'blur(20px)'
  };

  const headerStyle = {
    fontFamily: "'Lora', serif",
    color: 'var(--text-dark)',
    fontSize: '1.7rem',
    marginBottom: '28px',
    textAlign: 'center'
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityMap = { high: 0, medium: 1, low: 2 };
    return priorityMap[a.priority] - priorityMap[b.priority];
  });

  return (
    <div style={containerStyle}>
      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="mood" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', marginTop: 50 }}>
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
          <motion.div key="entry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h2 style={headerStyle}>Organise Your Day</h2>
            
            <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
               <input
                 value={task}
                 onChange={e => setTask(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && addTask()}
                 placeholder="What needs to be done?"
                 className="input-field"
                 style={{ flex: 1 }}
               />
               <select 
                 value={priority} 
                 onChange={e => setPriority(e.target.value)}
                 style={{ background: 'var(--input-bg)', border: '1.5px solid var(--border)', borderRadius: 14, padding: '0 16px', color: 'var(--text-dark)', fontWeight: 600 }}
               >
                 <option value="high">High</option>
                 <option value="medium">Medium</option>
                 <option value="low">Low</option>
               </select>
               <button onClick={addTask} disabled={!task.trim()} className="btn-primary" style={{ padding: '0 28px' }}>
                 Add
               </button>
            </div>

            <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12, paddingRight: 8 }}>
               {sortedTasks.map(t => (
                 <motion.div 
                   key={t.id} 
                   layout 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   style={{ 
                     background: 'var(--surface-elevated)', padding: '16px 20px', borderRadius: 16, 
                     display: 'flex', alignItems: 'center', gap: 16, border: '1px solid var(--border)',
                     boxShadow: '0 4px 12px var(--shadow)'
                   }}
                 >
                    <input 
                      type="checkbox" 
                      checked={t.completed} 
                      onChange={() => toggleTask(t.id)} 
                      style={{ width: 22, height: 22, cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                    <div style={{ flex: 1 }}>
                       <p style={{ margin: '0 0 2px', fontSize: '1rem', fontWeight: 600, textDecoration: t.completed ? 'line-through' : 'none', color: t.completed ? 'var(--text-muted)' : 'var(--text-dark)' }}>
                         {t.title}
                       </p>
                       <span style={{ 
                         fontSize: '0.7rem', 
                         color: t.priority === 'high' ? 'var(--danger)' : t.priority === 'medium' ? 'var(--warning)' : 'var(--primary)', 
                         textTransform: 'uppercase', 
                         fontWeight: 800,
                         letterSpacing: '0.5px'
                        }}>
                         {t.priority} Priority
                       </span>
                    </div>
                    <button onClick={() => removeTask(t.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 8, fontSize: '1.1rem' }}>✕</button>
                 </motion.div>
               ))}
               {tasks.length === 0 && (
                 <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', opacity: 0.5, color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: 64, marginBottom: 16 }}>✍️</div>
                    <p style={{ fontSize: '1.1rem' }}>Your task list is empty.</p>
                    <p style={{ fontSize: '0.9rem' }}>Add some tasks to get started!</p>
                 </div>
               )}
            </div>

            <div style={{ paddingTop: 24, borderTop: '1px solid var(--border)', marginTop: 24 }}>
               <button onClick={handleFinish} className="btn-primary" style={{ width: '100%', padding: '16px' }} disabled={loading}>
                 Save Progress & Finish
               </button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div key="summary" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', marginTop: 50 }}>
             <div style={{ fontSize: 72, marginBottom: 28 }}>🌟</div>
             <h2 style={headerStyle}>Great Plan!</h2>
             <p style={{ color: 'var(--text-muted)', marginBottom: 40, fontSize: '1.1rem' }}>Your day's plan has been saved. Take it one task at a time.</p>
             <button onClick={onComplete} className="btn-primary" style={{ padding: '14px 60px' }}>
               Back to Tools
             </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={onCancel} style={{ position: 'absolute', top: 20, right: 20, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
    </div>
  );
}
