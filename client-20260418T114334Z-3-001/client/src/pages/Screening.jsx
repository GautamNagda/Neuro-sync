import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Screening() {
  const { t } = useTranslation();

  return (
    <div style={{
      minHeight: '100vh', paddingTop: 100, padding: '100px 20px 60px',
      background: 'var(--page-gradient-vertical)'
    }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: 50 }}>
          <h1 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', fontSize: '2.2rem', marginBottom: 12 }}>
            {t('screening.title')}
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto' }}>
            Choose a validated screening tool to assess your mental wellness. Your responses are private and secure.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Link to="/phq9" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 32, textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🩺</div>
                <h2 style={{ fontFamily: 'Lora, serif', color: 'var(--primary)', marginBottom: 8 }}>
                  {t('screening.phq9_title')}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
                  9 questions · ~3 minutes · Measures depression severity
                </p>
                <div className="badge badge-minimal">WHO Validated</div>
              </div>
            </Link>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Link to="/gad7" style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 32, textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🫀</div>
                <h2 style={{ fontFamily: 'Lora, serif', color: 'var(--primary)', marginBottom: 8 }}>
                  {t('screening.gad7_title')}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
                  7 questions · ~2 minutes · Measures anxiety severity
                </p>
                <div className="badge badge-minimal">Evidence Based</div>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
