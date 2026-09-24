import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import CrisisModal from '../components/CrisisModal';

const OPTIONS = [0, 1, 2, 3];

export default function GAD7() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [consent, setConsent] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);

  const questions = Array.from({ length: 7 }, (_, i) => ({
    id: `q${i + 1}`,
    text: t(`gad7_questions.q${i + 1}`)
  }));

  if (!consent) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--page-gradient)', padding: '100px 20px 40px'
      }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="card" style={{ maxWidth: 500, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
          <h2 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', marginBottom: 12 }}>
            {t('screening.consent_title')}
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.7 }}>
            {t('screening.consent_text')}
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => navigate('/screening')} className="btn-secondary" style={{ flex: 1 }}>
              {t('screening.consent_decline')}
            </button>
            <button onClick={() => setConsent(true)} className="btn-primary" style={{ flex: 1 }}>
              {t('screening.consent_agree')}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (result) {
    const isCrisisLevel = result.severity === 'severe' || result.totalScore >= 15;
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--page-gradient)', padding: '100px 20px 40px'
      }}>
        {/* Emergency Crisis Modal */}
        <CrisisModal isOpen={showCrisis} onClose={() => setShowCrisis(false)} />

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="card" style={{ maxWidth: 500, padding: 40, textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', marginBottom: 20 }}>
            {t('screening.results_title')}
          </h2>
          <div style={{ fontSize: 56, marginBottom: 16 }}>
            {result.severity === 'minimal' ? '🌟' : result.severity === 'mild' ? '🌤️' : result.severity === 'moderate' ? '⛅' : '🌧️'}
          </div>
          <div style={{ fontSize: '3rem', fontWeight: 700, fontFamily: 'Lora, serif', color: 'var(--primary)' }}>
            {result.totalScore}/21
          </div>
          <div className={`badge badge-${result.severity}`} style={{ marginBottom: 20, fontSize: '1rem', padding: '8px 24px' }}>
            {t(`severity.${result.severity}`)}
          </div>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24 }}>{result.recommendation}</p>

          {/* ── Crisis banner for high-risk users ── */}
          {isCrisisLevel && (
            <motion.div
              initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              style={{
                background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(99,102,241,0.12))',
                border: '1.5px solid rgba(59,130,246,0.3)',
                borderRadius: 14, padding: '16px 20px', marginBottom: 20,
                display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left'
              }}
            >
              <span style={{ fontSize: 28, flexShrink: 0 }}>💙</span>
              <div>
                <p style={{ fontWeight: 700, color: '#3B82F6', fontSize: '0.95rem', marginBottom: 4 }}>
                  Your wellbeing matters
                </p>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Your anxiety levels are elevated. Please consider speaking to a professional.
                </p>
              </div>
              <button
                onClick={() => setShowCrisis(true)}
                style={{
                  flexShrink: 0, background: '#3B82F6', color: 'white',
                  border: 'none', borderRadius: 10, padding: '8px 14px',
                  fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
              >
                Get Help
              </button>
            </motion.div>
          )}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button onClick={() => window.open(`/api/reports/generate/${result._id}`, '_blank')} className="btn-accent">
              Download PDF Report
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">View Dashboard</button>
          </div>

          {/* Tool Recommendations */}
          <div style={{ marginTop: 30, paddingTop: 30, borderTop: '1px solid var(--border)' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              {t('screening.suggested_tools', { defaultValue: 'Based on your anxiety level, these might help:' })}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              {result.severity !== 'minimal' && (
                <>
                  <button onClick={() => navigate('/tools?open=managing_worries')} className="badge badge-primary" style={{ cursor: 'pointer', border: 'none' }}>
                    🌳 Worry Tree
                  </button>
                  <button onClick={() => navigate('/tools?open=cbt_cycle')} className="badge badge-accent" style={{ cursor: 'pointer', border: 'none' }}>
                    🧠 CBT Builder
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const handleSelect = (score) => {
    setAnswers({ ...answers, [questions[currentQ].id]: score });
    if (currentQ < questions.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const responses = questions.map(q => ({
        questionId: q.id, score: answers[q.id] || 0, questionText: q.text
      }));
      const { data } = await api.post('/screening', {
        type: 'GAD7', responses, language: i18n.language
      });
      setResult(data);

      // ── Crisis detection ──
      const totalScore = responses.reduce((sum, r) => sum + r.score, 0);
      if (totalScore >= 15 || data.severity === 'severe') {
        setTimeout(() => setShowCrisis(true), 600);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const progress = ((currentQ + 1) / questions.length) * 100;
  const q = questions[currentQ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', background: 'var(--page-gradient)',
      padding: '100px 20px 40px'
    }}>
      <div style={{ width: '100%', maxWidth: 600, marginBottom: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {t('screening.question_of', { current: currentQ + 1, total: 7 })}
          </span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 6, background: 'var(--progress-track)', borderRadius: 99, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${progress}%` }} style={{
            height: '100%', background: 'linear-gradient(90deg, #2D6A4F, #52B788)', borderRadius: 99
          }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentQ}
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          className="card" style={{ maxWidth: 600, width: '100%', padding: 40 }}
        >
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            {t('screening.instructions')}
          </p>
          <h2 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', fontSize: '1.3rem', marginBottom: 28, lineHeight: 1.5 }}>
            {q.text}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {OPTIONS.map(score => (
              <motion.button key={score} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(score)}
                style={{
                  padding: '16px 20px', borderRadius: 12, border: '2px solid',
                  borderColor: answers[q.id] === score ? 'var(--primary)' : 'var(--border)',
                  background: answers[q.id] === score ? 'var(--soft)' : 'var(--surface)',
                  cursor: 'pointer', textAlign: 'left', fontSize: '0.95rem',
                  fontWeight: answers[q.id] === score ? 600 : 400,
                  color: 'var(--text-dark)', fontFamily: 'DM Sans, sans-serif'
                }}
              >
                {t(`screening.options.${score}`)}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div style={{ display: 'flex', gap: 12, marginTop: 20, maxWidth: 600, width: '100%' }}>
        {currentQ > 0 && (
          <button onClick={() => setCurrentQ(currentQ - 1)} className="btn-secondary" style={{ flex: 1 }}>
            {t('screening.previous')}
          </button>
        )}
        {currentQ === questions.length - 1 && answers[q.id] !== undefined && (
          <button onClick={handleSubmit} className="btn-primary" disabled={loading}
            style={{ flex: 1, opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : t('screening.submit')}
          </button>
        )}
      </div>
    </div>
  );
}
