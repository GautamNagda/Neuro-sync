import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer style={{
      background: 'linear-gradient(180deg, #1B4332, #0d1912)',
      color: 'white', padding: '60px 20px 30px'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: 40, marginBottom: 40
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #52B788, #95D5B2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18
              }}>🧠</div>
              <span style={{ fontFamily: 'Lora, serif', fontSize: '1.3rem', fontWeight: 700 }}>
                {t('app_name')}
              </span>
            </div>
            <p style={{ color: '#95D5B2', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 300 }}>
              {t('footer.description', { defaultValue: 'A government-initiative AI-powered mental health screening platform.' })}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: '#F4A261', marginBottom: 16, fontFamily: 'Lora, serif', fontSize: '1.1rem' }}>
              {t('footer.quick_links', { defaultValue: 'Quick Links' })}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { to: '/', label: t('nav.home') },
                { to: '/screening', label: t('nav.screening') },
                { to: '/chat', label: t('nav.chat') },
                { to: '/dashboard', label: t('nav.dashboard') }
              ].map((link, i) => (
                <Link key={i} to={link.to} style={{
                  color: '#B7E4C7', textDecoration: 'none', fontSize: '0.9rem',
                  transition: 'color 0.2s'
                }}>
                  → {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Crisis Helplines */}
          <div>
            <h4 style={{ color: '#F4A261', marginBottom: 16, fontFamily: 'Lora, serif', fontSize: '1.1rem' }}>
              {t('footer.helplines', { defaultValue: 'Crisis Helplines' })}
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <HelplineItem icon="📞" text="iCall: 9152987821" />
              <HelplineItem icon="📞" text="Vandrevala Foundation: 1860-2662-345" />
              <HelplineItem icon="📞" text="NIMHANS: 080-46110007" />
              <HelplineItem icon="🚨" text="Emergency: 112" />
            </div>
          </div>
        </div>

        {/* WHO Reference & Disclaimer */}
        <div style={{
          borderTop: '1px solid rgba(82, 183, 136, 0.3)',
          paddingTop: 20, textAlign: 'center'
        }}>
          <p style={{ color: '#74C69D', fontSize: '0.8rem', marginBottom: 8 }}>
            Built on WHO guidelines | PHQ-9 (Kroenke et al., 2001) | GAD-7 (Spitzer et al., 2006)
          </p>
          <p style={{ color: '#52B788', fontSize: '0.75rem', marginBottom: 12 }}>
            {t('footer.disclaimer', { defaultValue: 'This platform is for screening purposes only and does not provide clinical diagnosis.' })}
          </p>
          <p style={{ color: '#5A7A6E', fontSize: '0.75rem' }}>
            {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}

function HelplineItem({ icon, text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#B7E4C7', fontSize: '0.9rem' }}>
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}
