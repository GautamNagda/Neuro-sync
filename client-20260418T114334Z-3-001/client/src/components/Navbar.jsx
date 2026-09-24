import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'తెలుగు', flag: '🇮🇳' },
  { code: 'mr', name: 'मराठी', flag: '🇮🇳' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' }
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const changeLanguage = (code) => {
    i18n.changeLanguage(code);
    document.documentElement.dir = code === 'ar' ? 'rtl' : 'ltr';
    setLangOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const currentLang = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      width: '100%', zIndex: 1000,
      background: scrolled ? 'var(--nav-scrolled-bg)' : 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      padding: '0 40px',
      boxShadow: scrolled ? '0 4px 20px var(--shadow)' : 'none'
    }}>
      <div style={{
        maxWidth: '100%', margin: '0 auto', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
        height: 70
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, boxShadow: '0 4px 10px var(--shadow)'
          }}>🧠</div>
          <span style={{
            fontFamily: 'Lora, serif', fontSize: '1.5rem', fontWeight: 700,
            color: 'var(--primary)', letterSpacing: '-0.5px', whiteSpace: 'nowrap'
          }}>{t('app_name')}</span>
        </Link>

        {/* Desktop Nav */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 24,
          '@media (max-width: 768px)': { display: 'none' }
        }} className="desktop-nav">
          <NavLink to="/" label={t('nav.home')} active={location.pathname === '/'} />
          {user && (
            <>
              <NavLink to="/screening" label={t('nav.screening')} active={location.pathname.includes('screening') || location.pathname.includes('phq9') || location.pathname.includes('gad7')} />
              <NavLink to="/chat" label={t('nav.chat')} active={location.pathname === '/chat'} />
              <NavLink to="/games" label={t('nav.games')} active={location.pathname === '/games'} />
              <NavLink to="/voice" label={t('nav.voice')} active={location.pathname === '/voice'} />
              <NavLink to="/tools" label={t('nav.tools')} active={location.pathname === '/tools'} />
              <NavLink to="/dashboard" label={t('nav.dashboard')} active={location.pathname === '/dashboard'} />
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="theme-toggle-knob">
              {isDark ? '🌙' : '☀️'}
            </div>
          </button>

          {/* Language Dropdown */}
          <div style={{ position: 'relative' }}>
            <button onClick={() => setLangOpen(!langOpen)} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--lang-btn-bg)', cursor: 'pointer', fontSize: '0.85rem',
              fontFamily: 'DM Sans, sans-serif', color: 'var(--text-dark)'
            }}>
              {currentLang.flag} {currentLang.name}
              <span style={{ fontSize: 10 }}>▼</span>
            </button>
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: 8,
                    background: 'var(--lang-dropdown-bg)', borderRadius: 12, padding: 8,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)', minWidth: 160, zIndex: 100,
                    border: '1px solid var(--border)'
                  }}
                >
                  {LANGUAGES.map(lang => (
                    <button key={lang.code} onClick={() => changeLanguage(lang.code)} style={{
                      display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                      padding: '8px 12px', border: 'none', borderRadius: 8,
                      background: i18n.language === lang.code ? 'var(--soft)' : 'transparent',
                      cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'DM Sans, sans-serif',
                      textAlign: 'left', color: 'var(--text-dark)'
                    }}>
                      {lang.flag} {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Auth Buttons */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {user.name}
              </span>
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/login"><button className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>{t('nav.login')}</button></Link>
              <Link to="/register"><button className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>{t('nav.register')}</button></Link>
            </div>
          )}
        </div>

        {/* Mobile: Theme toggle + Hamburger */}
        <div className="mobile-controls" style={{ display: 'none', alignItems: 'center', gap: 12 }}>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="theme-toggle-knob">
              {isDark ? '🌙' : '☀️'}
            </div>
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 24, color: 'var(--primary)'
          }}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{
              overflow: 'hidden', background: 'var(--mobile-menu-bg)',
              backdropFilter: 'blur(20px)', padding: '0 20px'
            }}
            className="mobile-menu"
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 20 }}>
              <MobileLink to="/" label={t('nav.home')} />
              {user && (
                <>
                  <MobileLink to="/screening" label={t('nav.screening')} />
                  <MobileLink to="/chat" label={t('nav.chat')} />
                  <MobileLink to="/games" label={t('nav.games')} />
                  <MobileLink to="/voice" label={t('nav.voice')} />
                  <MobileLink to="/tools" label={t('nav.tools')} />
                  <MobileLink to="/dashboard" label={t('nav.dashboard')} />
                </>
              )}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 0' }}>
                {LANGUAGES.map(lang => (
                  <button key={lang.code} onClick={() => changeLanguage(lang.code)} style={{
                    padding: '4px 10px', borderRadius: 6, border: '1px solid var(--border)',
                    background: i18n.language === lang.code ? 'var(--secondary)' : 'var(--lang-btn-bg)',
                    color: i18n.language === lang.code ? 'white' : 'var(--text-dark)',
                    cursor: 'pointer', fontSize: '0.75rem'
                  }}>
                    {lang.flag} {lang.name}
                  </button>
                ))}
              </div>
              {user ? (
                <button onClick={handleLogout} className="btn-secondary" style={{ marginTop: 8 }}>{t('nav.logout')}</button>
              ) : (
                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <Link to="/login" style={{ flex: 1 }}><button className="btn-secondary" style={{ width: '100%' }}>{t('nav.login')}</button></Link>
                  <Link to="/register" style={{ flex: 1 }}><button className="btn-primary" style={{ width: '100%' }}>{t('nav.register')}</button></Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-controls { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link to={to} style={{
      textDecoration: 'none', color: active ? 'var(--primary)' : 'var(--text-muted)',
      fontWeight: active ? 600 : 500, fontSize: '0.9rem',
      padding: '8px 12px',
      borderRadius: 10,
      background: active ? 'var(--soft)' : 'transparent',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center'
    }} className="nav-link-hover">
      {label}
    </Link>
  );
}

function MobileLink({ to, label }) {
  return (
    <Link to={to} style={{
      textDecoration: 'none', color: 'var(--text-dark)',
      padding: '10px 0', borderBottom: '1px solid var(--border)', fontSize: '0.95rem'
    }}>
      {label}
    </Link>
  );
}
