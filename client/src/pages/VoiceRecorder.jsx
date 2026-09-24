import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const TOOL_ICONS = {
  'Reflect Your Day': '📔',
  'Muscle Relaxation': '🧘',
  'CBT Builder': '🧠',
  'Worry Tree': '🌲',
  'Day Organiser': '📅',
};

const RISK_COLOR = {
  low: { bg: '#d1fae5', color: '#065f46', label: 'Low Risk' },
  moderate: { bg: '#fef3c7', color: '#92400e', label: 'Moderate Risk' },
  high: { bg: '#fee2e2', color: '#991b1b', label: 'High Risk' },
};

export default function VoiceRecorder() {
  const { t } = useTranslation();
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch (err) {
      alert('Microphone access is required for voice recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const uploadAndAnalyze = async () => {
    if (!audioBlob) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('durationSeconds', duration);
      const { data } = await api.post('/voice/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('Analysis failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const downloadReport = async () => {
    if (!result?._id) return;
    setDownloading(true);
    try {
      const response = await api.get(`/reports/generate-voice/${result._id}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `VoiceJournal_Report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Could not generate PDF report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const riskStyle = result?.riskLevel ? RISK_COLOR[result.riskLevel] || RISK_COLOR.low : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--page-gradient)',
      padding: '100px 20px 60px',
    }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div key="result"
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              {/* Header Card */}
              <div className="card" style={{ padding: '36px 40px', marginBottom: 20, textAlign: 'center' }}>
                <div style={{ fontSize: 56, marginBottom: 12 }}>
                  {result.riskLevel === 'high' ? '⚠️' : result.riskLevel === 'moderate' ? '🟡' : '✅'}
                </div>
                <h2 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', marginBottom: 8, fontSize: '1.7rem' }}>
                  Voice Journal Analyzed
                </h2>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 }}>
                  <span style={{
                    padding: '6px 20px', borderRadius: 999, fontWeight: 700,
                    fontSize: '1rem', background: 'var(--primary)', color: '#fff',
                    textTransform: 'capitalize', letterSpacing: 1
                  }}>
                    {result.emotionalTone || 'neutral'}
                  </span>
                  <span style={{
                    padding: '6px 16px', borderRadius: 999, fontWeight: 600,
                    background: riskStyle?.bg, color: riskStyle?.color
                  }}>
                    {riskStyle?.label || 'Analyzed'}
                  </span>
                  <span style={{
                    padding: '6px 16px', borderRadius: 999,
                    background: 'var(--badge-bg-default)', color: 'var(--text-muted)', fontWeight: 600
                  }}>
                    {duration}s recorded
                  </span>
                </div>
              </div>

              {/* Detailed Description */}
              {result.detailedDescription && (
                <motion.div className="card" style={{ padding: '28px 32px', marginBottom: 16 }}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <span style={{ fontSize: 22 }}>💬</span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
                      How You're Feeling
                    </h3>
                  </div>
                  <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>
                    {result.detailedDescription}
                  </p>
                </motion.div>
              )}

              {/* Improvement Suggestions */}
              {result.improvementSuggestions?.length > 0 && (
                <motion.div className="card" style={{ padding: '28px 32px', marginBottom: 16 }}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <span style={{ fontSize: 22 }}>🌱</span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
                      Coping Strategies & Suggestions
                    </h3>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {result.improvementSuggestions.map((s, i) => (
                      <li key={i} style={{
                        display: 'flex', gap: 12, alignItems: 'flex-start',
                        padding: '10px 0', borderBottom: i < result.improvementSuggestions.length - 1 ? '1px solid var(--border-subtle, #f0f0f0)' : 'none'
                      }}>
                        <span style={{
                          minWidth: 24, height: 24, borderRadius: '50%',
                          background: 'var(--primary)', color: '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700, flexShrink: 0
                        }}>{i + 1}</span>
                        <span style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{s}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Risk Flags */}
              {result.riskFlags?.length > 0 && (
                <motion.div className="card" style={{ padding: '28px 32px', marginBottom: 16, borderLeft: '4px solid #f59e0b' }}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <span style={{ fontSize: 22 }}>🔍</span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
                      Key Observations
                    </h3>
                  </div>
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
                    {result.riskFlags.map((flag, i) => (
                      <li key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <span style={{ color: '#f59e0b' }}>•</span><span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Recommended Tools */}
              {result.recommendedTools?.length > 0 && (
                <motion.div className="card" style={{ padding: '28px 32px', marginBottom: 20 }}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <span style={{ fontSize: 22 }}>🛠️</span>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>
                      Recommended Therapeutic Tools
                    </h3>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {result.recommendedTools.map((tool, i) => (
                      <div key={i} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 18px', borderRadius: 12,
                        background: 'linear-gradient(135deg, #e0f2fe, #f0fdf4)',
                        border: '1px solid #bae6fd', fontWeight: 600,
                        fontSize: '0.9rem', color: 'var(--primary-dark)'
                      }}>
                        <span>{TOOL_ICONS[tool] || '✨'}</span>
                        <span>{tool}</span>
                      </div>
                    ))}
                  </div>
                  <p style={{ margin: '14px 0 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    Go to <strong>Therapeutic Toolkit</strong> in the navigation to use these tools.
                  </p>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={downloadReport}
                  disabled={downloading}
                  className="btn-primary"
                  style={{ flex: 1, minWidth: 180, opacity: downloading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                >
                  {downloading ? (
                    <><span>⏳</span> Generating PDF...</>
                  ) : (
                    <><span>📄</span> Download PDF Report</>
                  )}
                </button>
                <button
                  onClick={() => { setResult(null); setAudioBlob(null); setDuration(0); }}
                  className="btn-secondary"
                  style={{ flex: 1, minWidth: 140 }}
                >
                  🎙️ Record Another
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="recorder"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="card" style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>{recording ? '🔴' : '🎙️'}</div>
                <h2 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', marginBottom: 8 }}>{t('voice.title')}</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: 30 }}>{t('voice.subtitle')}</p>

                {/* Timer */}
                <div style={{
                  fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Lora, serif',
                  color: recording ? 'var(--danger)' : 'var(--primary)',
                  marginBottom: 30
                }}>
                  {formatTime(duration)}
                </div>

                {/* Waveform visualization */}
                {recording && (
                  <div style={{ display: 'flex', gap: 3, justifyContent: 'center', marginBottom: 30, height: 40, alignItems: 'center' }}>
                    {Array.from({ length: 20 }, (_, i) => (
                      <motion.div key={i}
                        animate={{ height: [10, Math.random() * 40 + 10, 10] }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                        style={{ width: 4, borderRadius: 99, background: 'var(--secondary)' }}
                      />
                    ))}
                  </div>
                )}

                {/* Controls */}
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  {!recording && !audioBlob && (
                    <button onClick={startRecording} className="btn-primary"
                      style={{ padding: '16px 48px', fontSize: '1.1rem' }}>
                      {t('voice.start_recording')}
                    </button>
                  )}
                  {recording && (
                    <button onClick={stopRecording} className="btn-accent"
                      style={{ padding: '16px 48px', fontSize: '1.1rem' }}>
                      {t('voice.stop_recording')}
                    </button>
                  )}
                  {audioBlob && !recording && (
                    <>
                      <button onClick={uploadAndAnalyze} className="btn-primary"
                        disabled={uploading} style={{ padding: '16px 48px', opacity: uploading ? 0.7 : 1 }}>
                        {uploading ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>⏳</motion.span>
                            Analyzing your recording...
                          </span>
                        ) : t('voice.upload')}
                      </button>
                      <button onClick={() => { setAudioBlob(null); setDuration(0); }}
                        className="btn-secondary" style={{ padding: '16px 24px' }}>
                        Retry
                      </button>
                    </>
                  )}
                </div>

                {audioBlob && !uploading && !recording && (
                  <p style={{ marginTop: 20, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    ✅ Recording ready ({duration}s) — click "Upload & Analyze" to get your full report
                  </p>
                )}

                {/* Info: What this does */}
                <div style={{ marginTop: 32, padding: '16px 20px', borderRadius: 12, background: 'rgba(45,106,79,0.06)', border: '1px dashed rgba(45,106,79,0.2)' }}>
                  <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    🔒 <strong>Private & Encrypted</strong> — Your voice journal is transcribed, analyzed for emotional patterns, and you receive personalized suggestions and a downloadable PDF report.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
