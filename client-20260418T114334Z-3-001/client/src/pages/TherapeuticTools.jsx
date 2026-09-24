import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

// Tool Components
import ReflectYourDay from '../components/tools/ReflectYourDay';
import JacobsonRelaxation from '../components/tools/JacobsonRelaxation';
import CBTCycle from '../components/tools/CBTCycle';
import ManagingWorries from '../components/tools/ManagingWorries';
import OrganiseYourDay from '../components/tools/OrganiseYourDay';

const TOOLS = [
  {
    id: 'reflect_your_day',
    title: 'tools.reflect_title',
    description: 'tools.reflect_desc',
    icon: '📓',
    category: 'sleep',
    color: '#0D1B2A',
    component: ReflectYourDay
  },
  {
    id: 'jacobson_relaxation',
    title: 'tools.jacobson_title',
    description: 'tools.jacobson_desc',
    icon: '🧘',
    category: 'sleep',
    color: '#0f4c5c',
    component: JacobsonRelaxation
  },
  {
    id: 'cbt_cycle',
    title: 'tools.cbt_title',
    description: 'tools.cbt_desc',
    icon: '🧠',
    category: 'anxiety',
    color: 'var(--primary)',
    component: CBTCycle
  },
  {
    id: 'managing_worries',
    title: 'tools.worries_title',
    description: 'tools.worries_desc',
    icon: '🌳',
    category: 'anxiety',
    color: '#f0f2f5',
    component: ManagingWorries
  },
  {
    id: 'organise_your_day',
    title: 'tools.organise_title',
    description: 'tools.organise_desc',
    icon: '📅',
    category: 'stress',
    color: '#1A1A1A',
    component: OrganiseYourDay
  }
];

const CATEGORIES = ['all', 'sleep', 'anxiety', 'stress'];

export default function TherapeuticTools() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('all');
  const [openTool, setOpenTool] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const toolId = searchParams.get('open');
    if (toolId) {
      const tool = TOOLS.find(t => t.id === toolId);
      if (tool) setOpenTool(tool);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, statsRes] = await Promise.all([
        api.get('/tools/sessions/me'),
        api.get('/tools/sessions/me/stats')
      ]);
      setHistory(sessionsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenTool = (tool) => {
    setOpenTool(tool);
    setSearchParams({ open: tool.id });
  };

  const handleCloseTool = () => {
    setOpenTool(null);
    setSearchParams({});
    fetchData(); // Refresh stats/history
  };

  const filteredTools = activeCategory === 'all' 
    ? TOOLS 
    : TOOLS.filter(t => t.category === activeCategory);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--background)', padding: '100px 20px 40px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: 50 }}>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Lora', serif", color: 'var(--primary-dark)', fontSize: '2.5rem', marginBottom: 12 }}
          >
            Therapeutic Toolkit
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            style={{ color: 'var(--text-muted)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto 30px' }}
          >
            Evidence-based tools to help you manage anxiety, improve sleep, and reduce stress.
          </motion.p>

          {/* Category Filter */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 50 }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '12px 28px', borderRadius: '30px', border: 'none',
                  background: activeCategory === cat ? 'var(--primary)' : 'var(--glass-bg)',
                  backdropFilter: 'blur(10px)',
                  color: activeCategory === cat ? 'white' : 'var(--text-dark)',
                  fontWeight: 600, cursor: 'pointer', textTransform: 'capitalize',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: activeCategory === cat ? '0 8px 20px var(--shadow)' : '0 4px 10px var(--shadow)',
                  border: '1.5px solid',
                  borderColor: activeCategory === cat ? 'var(--primary-light)' : 'var(--glass-border)'
                }}
                onMouseOver={e => ! (activeCategory === cat) && (e.currentTarget.style.transform = 'translateY(-2px)')}
                onMouseOut={e => ! (activeCategory === cat) && (e.currentTarget.style.transform = 'translateY(0)')}
              >
                {t(`tools.category_${cat}`, { defaultValue: cat })}
              </button>
            ))}
          </div>
        </header>

        {/* Tools Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
          gap: 30, 
          marginBottom: 80 
        }}>
          {filteredTools.map((tool, idx) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              onClick={() => handleOpenTool(tool)}
              className="card-premium"
              style={{
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 20,
                position: 'relative', overflow: 'hidden'
              }}
            >
              {/* Decorative Background Element */}
              <div style={{ 
                position: 'absolute', top: -20, right: -20, width: 100, height: 100, 
                borderRadius: '50%', background: 'var(--soft)', opacity: 0.3, zIndex: 0 
              }} />

              <div style={{ 
                width: 70, height: 70, borderRadius: 18, background: 'var(--surface-elevated)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36,
                boxShadow: '0 8px 16px var(--shadow)', zIndex: 1
              }}>
                {tool.icon}
              </div>
              <div style={{ zIndex: 1 }}>
                <h3 style={{ fontFamily: "'Lora', serif", fontSize: '1.5rem', color: 'var(--primary-dark)', marginBottom: 12 }}>
                  {t(tool.title)}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7 }}>
                  {t(tool.description)}
                </p>
              </div>
              <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 12, zIndex: 1 }}>
                <span style={{ 
                  padding: '6px 16px', borderRadius: 99, background: 'var(--soft)',
                  fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {tool.category}
                </span>
                <span style={{ 
                  marginLeft: 'auto', fontSize: '0.95rem', color: 'var(--primary)', 
                  fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 
                }}>
                  Start Session <span style={{ transition: 'transform 0.2s' }}>→</span>
                </span>
              </div>
            </motion.div>
          ))}
        </div>

         {/* History / Recent Activity */}
         {history.length > 0 && (
           <section style={{ maxWidth: 900, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 30 }}>
                <div style={{ width: 40, height: 2, background: 'var(--primary)', borderRadius: 2 }} />
                <h2 style={{ fontFamily: "'Lora', serif", color: 'var(--text-dark)', margin: 0, fontSize: '1.8rem' }}>Recent Activity</h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                 {history.slice(0, 5).map(session => (
                    <motion.div 
                      key={session._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="card"
                      style={{ 
                        padding: '20px 28px', borderRadius: 20, 
                        display: 'flex', alignItems: 'center', gap: 20,
                        border: '1px solid var(--border)',
                        background: 'var(--surface)'
                      }}
                    >
                       <div style={{ 
                         width: 50, height: 50, borderRadius: 14, background: 'var(--soft)',
                         display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 
                       }}>
                         {TOOLS.find(t => t.id === session.toolName)?.icon || '📝'}
                       </div>
                       <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem', color: 'var(--text-dark)' }}>
                            {t(TOOLS.find(t => t.id === session.toolName)?.title || 'Tool')}
                          </h4>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              {new Date(session.createdAt).toLocaleDateString()}
                            </span>
                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--border)' }} />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              {Math.round(session.durationSecs / 60)} min session
                            </span>
                          </div>
                       </div>
                       <div style={{ textAlign: 'right', background: 'var(--soft)', padding: '8px 16px', borderRadius: 12 }}>
                          <div style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Mood Change</div>
                          <span style={{ fontSize: '1rem', color: 'var(--primary-dark)', fontWeight: 700 }}>
                            {session.moodBefore} → {session.moodAfter}
                          </span>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </section>
         )}
      </div>

      {/* Tool Modal Overlay */}
      <AnimatePresence>
        {openTool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: 20,
              backdropFilter: 'blur(5px)'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={{ width: '100%', maxWidth: openTool.id === 'managing_worries' ? 800 : 600 }}
              onClick={e => e.stopPropagation()}
            >
              <openTool.component 
                sessionId={null} 
                onComplete={handleCloseTool} 
                onCancel={handleCloseTool} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
