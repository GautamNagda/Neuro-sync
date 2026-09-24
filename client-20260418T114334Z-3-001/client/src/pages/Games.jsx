import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

export default function Games() {
  const { t, i18n } = useTranslation();
  const [activeGame, setActiveGame] = useState(null);
  const [scenarios, setScenarios] = useState([]);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [responses, setResponses] = useState([]);
  const [result, setResult] = useState(null);
  const [journalText, setJournalText] = useState('');
  const [loading, setLoading] = useState(false);

  const games = [
    { id: 'decision_room', icon: '🏢', title: t('games.decision_room'), desc: t('games.decision_room_desc') },
    { id: 'social_compass', icon: '🧭', title: t('games.social_compass'), desc: t('games.social_compass_desc') },
    { id: 'mirror_journal', icon: '📝', title: t('games.mirror_journal'), desc: t('games.mirror_journal_desc') }
  ];

  const startGame = async (gameType) => {
    try {
      const { data } = await api.get(`/games/scenarios/${gameType}`);
      setScenarios(data);
      setActiveGame(gameType);
      setCurrentScenario(0);
      setResponses([]);
      setResult(null);
    } catch (err) { console.error(err); }
  };

  const selectOption = (optionId) => {
    const scenario = scenarios[currentScenario];
    setResponses([...responses, { scenarioId: scenario.id, userResponse: optionId }]);
    if (currentScenario < scenarios.length - 1) {
      setTimeout(() => setCurrentScenario(currentScenario + 1), 300);
    } else {
      submitGame([...responses, { scenarioId: scenario.id, userResponse: optionId }]);
    }
  };

  const submitJournal = () => {
    if (!journalText.trim()) return;
    const resp = [{ scenarioId: 'mj_1', userResponse: journalText }];
    setResponses(resp);
    submitGame(resp);
  };

  const submitGame = async (finalResponses) => {
    setLoading(true);
    try {
      const { data } = await api.post('/games/submit', {
        gameType: activeGame,
        responses: finalResponses,
        language: i18n.language
      });
      setResult(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Game selection
  if (!activeGame) {
    return (
      <div style={{
        minHeight: '100vh', paddingTop: 100, padding: '100px 20px 60px',
        background: 'var(--page-gradient-vertical)'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 50 }}>
            <h1 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', fontSize: '2.2rem', marginBottom: 12 }}>{t('games.title')}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{t('games.subtitle')}</p>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {games.map((game, i) => (
              <motion.div key={game.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="card" style={{ padding: 32, textAlign: 'center' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>{game.icon}</div>
                  <h3 style={{ fontFamily: 'Lora, serif', color: 'var(--primary)', marginBottom: 8 }}>{game.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 20 }}>{game.desc}</p>
                  <button onClick={() => startGame(game.id)} className="btn-primary" style={{ width: '100%' }}>
                    {t('games.start_game')}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Result view
  if (result) {
    const analysis = result.aiAnalysis || {};
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--page-gradient)', padding: '100px 20px 40px'
      }}>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="card" style={{ maxWidth: 500, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', marginBottom: 20 }}>{t('games.game_complete')}</h2>
          {analysis.severity && (
            <div className={`badge badge-${analysis.severity}`} style={{ marginBottom: 16, fontSize: '0.9rem', padding: '6px 20px' }}>
              {analysis.severity.toUpperCase()} Risk
            </div>
          )}
          {analysis.notes && (
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 16 }}>{analysis.notes}</p>
          )}
          {analysis.riskIndicators?.length > 0 && (
            <div style={{ textAlign: 'left', marginBottom: 20 }}>
              <p style={{ fontWeight: 600, marginBottom: 8 }}>Observations:</p>
              {analysis.riskIndicators.map((ind, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  <span>•</span><span>{ind}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => { setActiveGame(null); setResult(null); }} className="btn-secondary" style={{ width: '100%' }}>
            Back to Games
          </button>
        </motion.div>
      </div>
    );
  }

  // Mirror Journal
  if (activeGame === 'mirror_journal') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--page-gradient)', padding: '100px 20px 40px'
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card" style={{ maxWidth: 600, width: '100%', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12, textAlign: 'center' }}>📝</div>
          <h2 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', textAlign: 'center', marginBottom: 8 }}>
            The Mirror Journal
          </h2>
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginBottom: 24, fontSize: '0.95rem' }}>
            Write 3 sentences about how your week has been going.
          </p>
          <textarea value={journalText} onChange={e => setJournalText(e.target.value)}
            placeholder="Write freely about your thoughts and feelings..."
            rows={6} className="input-field" style={{ resize: 'vertical', marginBottom: 16 }} />
          <button onClick={submitJournal} className="btn-primary" disabled={loading || !journalText.trim()}
            style={{ width: '100%', opacity: (loading || !journalText.trim()) ? 0.6 : 1 }}>
            {loading ? 'Analyzing...' : t('games.submit_response')}
          </button>
        </motion.div>
      </div>
    );
  }

  // Scenario Game
  const scenario = scenarios[currentScenario];
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', background: 'var(--page-gradient)',
      padding: '100px 20px 40px'
    }}>
      <div style={{ maxWidth: 600, width: '100%', marginBottom: 20 }}>
        <div style={{ height: 6, background: 'var(--progress-track)', borderRadius: 99, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${((currentScenario + 1) / scenarios.length) * 100}%` }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #2D6A4F, #52B788)', borderRadius: 99 }} />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={currentScenario}
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}
          className="card" style={{ maxWidth: 600, width: '100%', padding: 40 }}
        >
          <h3 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', fontSize: '1.2rem', marginBottom: 24, lineHeight: 1.5 }}>
            {scenario?.text}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {scenario?.options?.map(opt => (
              <motion.button key={opt.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => selectOption(opt.id)}
                style={{
                  padding: '16px 20px', borderRadius: 12, border: '2px solid var(--border)',
                  background: 'var(--surface)', cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem',
                  color: 'var(--text-dark)', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s'
                }}>
                <strong style={{ color: 'var(--primary)', marginRight: 8 }}>{opt.id}.</strong> {opt.text}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
