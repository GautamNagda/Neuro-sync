import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────
   Emergency contacts – India
───────────────────────────────────────────────────────────── */
const CONTACTS = [
  {
    id: 'kiran',
    emoji: '🤝',
    label: 'Kiran Mental Health Helpline',
    sublabel: 'Free • 24/7 • Multilingual',
    number: '18005990019',
    display: '1800-599-0019',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.10)',
    border: 'rgba(59,130,246,0.25)',
    btnText: 'Call Helpline',
  },
  {
    id: 'police',
    emoji: '🚔',
    label: 'Police Emergency',
    sublabel: 'Immediate help • Always available',
    number: '100',
    display: '100',
    color: '#6366F1',
    bg: 'rgba(99,102,241,0.10)',
    border: 'rgba(99,102,241,0.25)',
    btnText: 'Call Police',
  },
  {
    id: 'ambulance',
    emoji: '🚑',
    label: 'Ambulance',
    sublabel: 'Medical emergency • Nationwide',
    number: '102',
    display: '102 / 108',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.10)',
    border: 'rgba(16,185,129,0.25)',
    btnText: 'Call Ambulance',
  },
];

/* ─────────────────────────────────────────────────────────────
   Main Component
───────────────────────────────────────────────────────────── */
export default function CrisisModal({ isOpen, onClose }) {
  const closeRef = useRef(null);

  /* Trap focus & prevent background scroll */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => closeRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Emergency Support"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
            overflowY: 'auto',
          }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 280 }}
            className="crisis-modal-card"
          >
            {/* ── Pulse beacon ── */}
            <div className="crisis-beacon-wrap">
              <div className="crisis-beacon-ring" />
              <div className="crisis-beacon-ring crisis-beacon-ring-2" />
              <div className="crisis-beacon-core">💙</div>
            </div>

            {/* ── Headline ── */}
            <h1 className="crisis-headline">You Are Not Alone</h1>
            <p className="crisis-subline">
              Help is available <strong>right now</strong>. Reaching out is a sign of strength.
            </p>

            {/* ── Divider ── */}
            <div className="crisis-divider" />

            {/* ── Contact cards ── */}
            <div className="crisis-contacts">
              {CONTACTS.map((c) => (
                <ContactCard key={c.id} contact={c} />
              ))}
            </div>

            {/* ── Talk to someone ── */}
            <div className="crisis-trust-box">
              <span className="crisis-trust-icon">🤗</span>
              <div>
                <p className="crisis-trust-title">Talk to Someone You Trust</p>
                <p className="crisis-trust-body">
                  A friend, family member, teacher, or colleague — sharing how you feel
                  can bring tremendous relief. You don't have to face this alone.
                </p>
              </div>
            </div>

            {/* ── Privacy note ── */}
            <p className="crisis-privacy">
              🔒 Your responses are private and will never be shared without your consent.
            </p>

            {/* ── Close button ── */}
            <button
              ref={closeRef}
              onClick={onClose}
              className="crisis-close-btn"
              aria-label="Close emergency support panel"
            >
              I understand — take me back
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────
   Contact Card
───────────────────────────────────────────────────────────── */
function ContactCard({ contact }) {
  const { emoji, label, sublabel, number, display, color, bg, border, btnText } = contact;
  return (
    <div className="crisis-contact-card" style={{ background: bg, borderColor: border }}>
      <div className="crisis-contact-left">
        <span className="crisis-contact-emoji">{emoji}</span>
        <div>
          <p className="crisis-contact-label">{label}</p>
          <p className="crisis-contact-sublabel">{sublabel}</p>
          <p className="crisis-contact-number" style={{ color }}>{display}</p>
        </div>
      </div>
      <a
        href={`tel:${number}`}
        className="crisis-call-btn"
        style={{ background: color }}
        aria-label={`${btnText} – ${display}`}
      >
        📞 {btnText}
      </a>
    </div>
  );
}
