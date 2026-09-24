import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const fadeIn = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay }
});

export default function Home() {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* Hero Section */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--hero-gradient)',
        backgroundSize: '200% 200%', animation: 'gradient-shift 12s ease infinite',
        padding: '100px 20px 60px', position: 'relative', overflow: 'hidden'
      }}>
        {/* Floating decorations */}
        <div style={{ position: 'absolute', top: '15%', left: '10%', fontSize: 60, opacity: 0.15 }} className="animate-float">🌿</div>
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', fontSize: 50, opacity: 0.12, animationDelay: '1s' }} className="animate-float">🌱</div>
        <div style={{ position: 'absolute', top: '60%', left: '5%', fontSize: 40, opacity: 0.1, animationDelay: '2s' }} className="animate-float">🍃</div>

        <div style={{ textAlign: 'center', maxWidth: 700, position: 'relative', zIndex: 2 }}>
          {/* Breathing Circle */}
          <motion.div {...fadeIn()} style={{ marginBottom: 40, display: 'flex', justifyContent: 'center' }}>
            <div style={{ position: 'relative', width: 140, height: 140 }}>
              <div className="animate-breathe" style={{
                width: 140, height: 140, borderRadius: '50%',
                background: 'radial-gradient(circle at 30% 30%, #52B788, #2D6A4F)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 60px rgba(82, 183, 136, 0.4)'
              }}>
                <span style={{ fontSize: 56 }}>🧠</span>
              </div>
              <div style={{
                position: 'absolute', inset: -10, borderRadius: '50%', border: '2px solid #52B788',
                animation: 'pulse-ring 2s infinite', opacity: 0.5
              }} />
            </div>
          </motion.div>

          <motion.h1 {...fadeIn(0.2)} style={{
            fontFamily: 'Lora, serif', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
            color: 'var(--primary-dark)', marginBottom: 16, fontWeight: 700,
            letterSpacing: '-1px'
          }}>
            {t('hero.title')}
          </motion.h1>
          <motion.p {...fadeIn(0.3)} style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)', color: 'var(--text-muted)',
            marginBottom: 40, lineHeight: 1.7, maxWidth: 550, margin: '0 auto 40px'
          }}>
            {t('hero.subtitle')}
          </motion.p>
          <motion.div {...fadeIn(0.4)} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={user ? '/screening' : '/register'}>
              <button className="btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                {t('hero.cta_screening')}
              </button>
            </Link>
            <Link to={user ? '/chat' : '/register'}>
              <button className="btn-secondary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>
                {t('hero.cta_chat')}
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section style={{
        background: 'linear-gradient(135deg, #2D6A4F, #1B4332)',
        padding: '40px 20px', color: 'white'
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto', display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 30, textAlign: 'center'
        }}>
          <StatCard number="1 in 8" label={t('stats.who_stat')} source={t('stats.who_source')} />
          <StatCard number="85%" label={t('stats.gap_stat')} source={t('stats.gap_source')} />
          <StatCard number="70%" label={t('stats.screening_stat', { defaultValue: 'Early screening improves outcomes by up to 70%' })} source="WHO mhGAP" />
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: '80px 20px', background: 'var(--background)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.h2 {...fadeIn()} style={{
            textAlign: 'center', fontFamily: 'Lora, serif', color: 'var(--primary-dark)',
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginBottom: 50
          }}>{t('features.title')}</motion.h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24
          }}>
            <FeatureCard icon="🩺" title={t('features.phq9')} desc={t('features.phq9_desc')} delay={0} />
            <FeatureCard icon="🫀" title={t('features.gad7')} desc={t('features.gad7_desc')} delay={0.1} />
            <FeatureCard icon="🤖" title={t('features.chatbot')} desc={t('features.chatbot_desc')} delay={0.2} />
            <FeatureCard icon="🎙️" title={t('features.voice')} desc={t('features.voice_desc')} delay={0.3} />
            <FeatureCard icon="📊" title={t('features.progress')} desc={t('features.progress_desc')} delay={0.4} />
            <FeatureCard icon="📄" title={t('features.reports')} desc={t('features.reports_desc')} delay={0.5} />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 20px', background: 'var(--how-section-bg)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <motion.h2 {...fadeIn()} style={{
            textAlign: 'center', fontFamily: 'Lora, serif', color: 'var(--primary-dark)',
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginBottom: 50
          }}>
            {t('how_it_works.title', { defaultValue: 'How It Works' })}
          </motion.h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
            <StepCard num="1" emoji="📋" title={t('how_it_works.step1', { defaultValue: 'Take a Screening' })} desc={t('how_it_works.step1_desc', { defaultValue: 'Answer validated questions at your own pace' })} />
            <StepCard num="2" emoji="🤖" title={t('how_it_works.step2', { defaultValue: 'Get AI Insights' })} desc={t('how_it_works.step2_desc', { defaultValue: 'Receive personalized analysis and recommendations' })} />
            <StepCard num="3" emoji="📈" title={t('how_it_works.step3', { defaultValue: 'Track & Grow' })} desc={t('how_it_works.step3_desc', { defaultValue: 'Monitor progress and access resources' })} />
          </div>
        </div>
      </section>

      {/* Trust & Privacy */}
      <section style={{
        padding: '80px 20px',
        background: 'var(--trust-section-bg)'
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <motion.div {...fadeIn()}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
            <h2 style={{
              fontFamily: 'Lora, serif', color: 'var(--primary-dark)',
              fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginBottom: 16
            }}>
              {t('trust.title', { defaultValue: 'Your Privacy, Our Priority' })}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: 40 }}>
              {t('trust.desc', { defaultValue: 'Your data never leaves our secure servers. Built with government-grade security protocols.' })}
            </p>
          </motion.div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20
          }}>
            <TrustBadge icon="🔐" text={t('trust.encrypted', { defaultValue: 'End-to-end encrypted' })} />
            <TrustBadge icon="🚫" text={t('trust.no_tracking', { defaultValue: 'Zero third-party tracking' })} />
            <TrustBadge icon="✅" text={t('trust.gdpr', { defaultValue: 'GDPR compliant' })} />
            <TrustBadge icon="🗑️" text={t('trust.delete', { defaultValue: 'Delete data anytime' })} />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 20px', background: 'var(--background)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.h2 {...fadeIn()} style={{
            textAlign: 'center', fontFamily: 'Lora, serif', color: 'var(--primary-dark)',
            fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', marginBottom: 50
          }}>What People Say</motion.h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24
          }}>
            <Testimonial name="Priya S." location="Mumbai" text="Neuro Sync AI helped me understand my anxiety patterns. The PHQ-9 screening was eye-opening and the AI recommendations were genuinely helpful." />
            <Testimonial name="Amit K." location="Delhi" text="As someone hesitant about therapy, this platform was a safe first step. MindBot helped me open up without judgment." />
            <Testimonial name="Sarah L." location="Bangalore" text="The voice journal feature is incredible. Being able to talk through my feelings and get insights has been transformative for my mental health." />
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ number, label, source }) {
  return (
    <motion.div {...fadeIn(0.1)}>
      <div style={{ fontSize: '2.2rem', fontWeight: 700, fontFamily: 'Lora, serif', marginBottom: 8 }}>{number}</div>
      <div style={{ fontSize: '0.95rem', opacity: 0.9, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{source}</div>
    </motion.div>
  );
}

function FeatureCard({ icon, title, desc, delay }) {
  return (
    <motion.div {...fadeIn(delay)} className="card" style={{ textAlign: 'center', padding: 32 }}>
      <div style={{ fontSize: 42, marginBottom: 16 }}>{icon}</div>
      <h3 style={{ fontFamily: 'Lora, serif', color: 'var(--primary)', fontSize: '1.15rem', marginBottom: 10 }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>{desc}</p>
    </motion.div>
  );
}

function StepCard({ num, emoji, title, desc }) {
  return (
    <motion.div {...fadeIn(num * 0.15)} style={{
      display: 'flex', gap: 24, alignItems: 'center', padding: 24,
      background: 'var(--step-bg)', borderRadius: 16
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontFamily: 'Lora, serif', fontSize: '1.5rem', fontWeight: 700
      }}>{num}</div>
      <div>
        <div style={{ fontSize: 28, marginBottom: 4 }}>{emoji}</div>
        <h3 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', marginBottom: 4 }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{desc}</p>
      </div>
    </motion.div>
  );
}

function TrustBadge({ icon, text }) {
  return (
    <motion.div {...fadeIn(0.1)} style={{
      background: 'var(--trust-badge-bg)', borderRadius: 12, padding: 20,
      textAlign: 'center', backdropFilter: 'blur(10px)'
    }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-dark)' }}>{text}</div>
    </motion.div>
  );
}

function Testimonial({ name, location, text }) {
  return (
    <motion.div {...fadeIn(0.1)} className="card" style={{ padding: 28 }}>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 16 }}>"{text}"</p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--secondary), var(--accent))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: 700, fontSize: '0.9rem'
        }}>{name[0]}</div>
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-dark)', fontSize: '0.9rem' }}>{name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{location}</div>
        </div>
      </div>
    </motion.div>
  );
}
