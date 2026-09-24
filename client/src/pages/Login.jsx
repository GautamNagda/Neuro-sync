import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
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
        transition={{ duration: 0.5 }}
        className="card" style={{ maxWidth: 440, width: '100%', padding: 40 }}
      >
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🌿</div>
          <h1 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', fontSize: '1.8rem' }}>
            {t('auth.login_title')}
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>{t('auth.login_subtitle')}</p>
        </div>

        {error && (
          <div style={{
            background: 'var(--error-bg)', color: 'var(--danger)', padding: '10px 16px',
            borderRadius: 8, marginBottom: 16, fontSize: '0.9rem', border: '1px solid var(--error-border)'
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>
              {t('auth.email')}
            </label>
            <input
              type="email" className="input-field" required
              placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontWeight: 500, fontSize: '0.9rem' }}>
              {t('auth.password')}
            </label>
            <input
              type="password" className="input-field" required
              placeholder="••••••••" minLength={8}
              value={form.password} onChange={e => setForm({...form, password: e.target.value})}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading}
            style={{ width: '100%', padding: 14, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : t('auth.login_btn')}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {t('auth.no_account')}{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            {t('auth.register_btn')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
