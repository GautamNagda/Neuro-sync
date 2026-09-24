import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import CrisisModal from '../components/CrisisModal';

const emotionToolMap = [
  { keywords: ['sleep', 'insomnia', 'night', 'tired', 'restless'], tool: 'jacobson_relaxation', name: 'Muscle Relaxation' },
  { keywords: ['worry', 'worried', 'anxious', 'anxiety', 'panic', 'fear'], tool: 'managing_worries', name: 'Worry Tree' },
  { keywords: ['stress', 'busy', 'overwhelmed', 'work', 'deadline'], tool: 'organise_your_day', name: 'Day Organiser' },
  { keywords: ['thought', 'think', 'upset', 'feeling', 'distorted'], tool: 'cbt_cycle', name: 'CBT Builder' },
  { keywords: ['journal', 'reflect', 'day', 'evening', 'mood'], tool: 'reflect_your_day', name: 'Daily Reflection' }
];

export default function Chat() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: t('chat.welcome'), timestamp: new Date() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [crisisOpen, setCrisisOpen] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const detectToolNeeded = (text) => {
    const lower = text.toLowerCase();
    return emotionToolMap.find(item => item.keywords.some(kw => lower.includes(kw)));
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim(), timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setSuggestion(null);

    try {
      const { data } = await api.post('/chat/send', {
        message: userMsg.content,
        sessionId,
        language: i18n.language
      });
      setSessionId(data.sessionId);
      
      const newAssistantMsg = { role: 'assistant', content: data.response, timestamp: new Date() };
      setMessages(prev => [...prev, newAssistantMsg]);
      
      if (data.crisisDetected) setCrisisOpen(true);

      // Detect if we should suggest a tool based on user or AI message
      const toolMatch = detectToolNeeded(userMsg.content) || detectToolNeeded(data.response);
      if (toolMatch) {
         setSuggestion(toolMatch);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'I apologize, I\'m having trouble connecting. Please try again.', timestamp: new Date() }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      paddingTop: 70, background: 'var(--background)'
    }}>
      <CrisisModal isOpen={crisisOpen} onClose={() => setCrisisOpen(false)} />

      {/* Header */}
      <header style={{
        padding: '20px 24px', background: scrolled ? 'var(--nav-scrolled-bg)' : 'var(--surface)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)', display: 'flex',
        alignItems: 'center', gap: 16, sticky: 'top', zIndex: 10
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: '16px',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          boxShadow: '0 4px 12px var(--shadow)'
        }}>🤖</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontFamily: 'Lora, serif', color: 'var(--text-dark)', fontSize: '1.25rem', margin: 0, fontWeight: 700 }}>
            {t('chat.title')}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4CAF50' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>
              AI Therapeutic Assistant • Online
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--soft)', padding: '6px 16px', borderRadius: 99, fontSize: '0.75rem',
          color: 'var(--primary)', fontWeight: 700, border: '1px solid var(--border)'
        }}>
          <span>🔒</span> {t('chat.private_badge')}
        </div>
      </header>

      {/* Messages */}
      <div style={{
        flex: 1, overflow: 'auto', padding: 20,
        display: 'flex', flexDirection: 'column', gap: 16,
        maxWidth: 800, width: '100%', margin: '0 auto'
      }}>
        {messages.map((msg, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '80%', padding: '16px 20px', borderRadius: 20,
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, var(--primary), var(--primary-light))'
                : 'var(--surface-elevated)',
              color: msg.role === 'user' ? 'white' : 'var(--text-dark)',
              boxShadow: '0 4px 15px var(--shadow)',
              borderBottomRightRadius: msg.role === 'user' ? 4 : 20,
              borderBottomLeftRadius: msg.role === 'user' ? 20 : 4,
              border: msg.role === 'assistant' ? '1.5px solid var(--border)' : 'none'
            }}>
              <p style={{ margin: 0, lineHeight: 1.7, fontSize: '1rem', whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </p>
              <p style={{
                margin: '6px 0 0', fontSize: '0.65rem',
                opacity: 0.6, textAlign: 'right'
              }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </motion.div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div style={{ display: 'flex', gap: 6, padding: '12px 18px', alignSelf: 'flex-start' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: '50%', background: 'var(--secondary)',
                animation: `bounce-dot 1.4s ${i * 0.2}s infinite ease-in-out both`
              }} />
            ))}
          </div>
        )}

        {/* Tool Suggestion Card */}
        {suggestion && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="card-premium"
            style={{
              alignSelf: 'flex-start', padding: '24px', borderRadius: 24,
              maxWidth: '85%', marginTop: 12, border: '1.5px solid var(--primary-light)',
              display: 'flex', flexDirection: 'column', gap: 16
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ 
                width: 48, height: 48, borderRadius: 12, background: 'var(--soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
              }}>💡</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-dark)' }}>
                  A helpful tool is available
                </p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Based on our conversation, the <strong>{suggestion.name}</strong> might help you feel better right now.
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => setSuggestion(null)} 
                className="btn-secondary"
                style={{ flex: 1, padding: '10px', borderRadius: 12, border: '1.5px solid var(--border)', background: 'none', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}
              >
                Not now
              </button>
              <button 
                onClick={() => navigate(`/tools?open=${suggestion.tool}`)}
                className="btn-primary" 
                style={{ flex: 1.5, padding: '10px', borderRadius: 12, fontSize: '0.9rem' }}
              >
                Try {suggestion.name} →
              </button>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px 20px', background: 'var(--surface)',
        borderTop: '1px solid var(--border)'
      }}>
        <div style={{
          maxWidth: 800, margin: '0 auto', display: 'flex', gap: 12
        }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t('chat.placeholder')}
            className="input-field"
            style={{ flex: 1 }}
          />
          <button onClick={sendMessage} className="btn-primary"
            disabled={loading || !input.trim()}
            style={{ padding: '12px 24px', opacity: (loading || !input.trim()) ? 0.5 : 1 }}>
            {t('chat.send')}
          </button>
        </div>
      </div>
    </div>
  );
}
