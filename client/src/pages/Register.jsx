import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const LANGUAGES = [
  { code: 'en', name: 'English' }, { code: 'hi', name: 'हिन्दी' },
  { code: 'bn', name: 'বাংলা' }, { code: 'ta', name: 'தமிழ்' },
  { code: 'te', name: 'తెలుగు' }, { code: 'mr', name: 'मराठी' },
  { code: 'fr', name: 'Français' }, { code: 'es', name: 'Español' },
  { code: 'ar', name: 'العربية' }
];

export default function Register() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', dob: '', language: 'en' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--page-gradient)',
      padding: '100px 20px 40px'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="card" style={{ maxWidth: 440, width: '100%', padding: 40 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌱</div>
          <h1 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', fontSize: '1.8rem' }}>
            {t('auth.register_title')}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{t('auth.register_subtitle')}</p>
        </div>

        {error && (
          <div style={{
            background: 'var(--error-bg)', color: 'var(--danger)', padding: '10px 16px',
            borderRadius: 8, marginBottom: 16, fontSize: '0.9rem', border: '1px solid var(--error-border)'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>{t('auth.name')}</label>
            <input type="text" className="input-field" required placeholder="Your full name"
              value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>{t('auth.email')}</label>
            <input type="email" className="input-field" required placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>{t('auth.password')}</label>
            <input type="password" className="input-field" required placeholder="Min 8 characters" minLength={8}
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>{t('auth.dob')}</label>
            <input type="date" className="input-field"
              value={form.dob} onChange={e => setForm({...form, dob: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>{t('auth.language')}</label>
            <select className="input-field" value={form.language}
              onChange={e => setForm({...form, language: e.target.value})}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', padding: 14, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : t('auth.register_btn')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {t('auth.have_account')}{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('auth.login_btn')}</Link>
        </p>
      </motion.div>
    </div>
  );
}
