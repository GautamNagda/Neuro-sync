import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Line, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, RadialLinearScale, Title, Tooltip, Legend, Filler
} from 'chart.js';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, RadialLinearScale, Title, Tooltip, Legend, Filler
);

export default function Dashboard() {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gameSessions, setGameSessions] = useState([]);
  const [toolStats, setToolStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [screenRes, gameRes, toolRes] = await Promise.all([
          api.get('/screening?limit=50'),
          api.get('/games/history').catch(() => ({ data: [] })),
          api.get('/tools/sessions/me/stats').catch(() => ({ data: null }))
        ]);
        setSessions(screenRes.data.sessions || []);
        setGameSessions(gameRes.data || []);
        setToolStats(toolRes?.data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const phq9Sessions = sessions.filter(s => s.type === 'PHQ9');
  const gad7Sessions = sessions.filter(s => s.type === 'GAD7');
  const lastPHQ9 = phq9Sessions[0];
  const lastGAD7 = gad7Sessions[0];

  // Chart data
  const phq9ChartData = {
    labels: phq9Sessions.slice(0, 6).reverse().map(s => new Date(s.completedAt || s.createdAt).toLocaleDateString()),
    datasets: [{
      label: 'PHQ-9 Score',
      data: phq9Sessions.slice(0, 6).reverse().map(s => s.totalScore),
      borderColor: '#2D6A4F', backgroundColor: 'rgba(45, 106, 79, 0.1)',
      tension: 0.4, fill: true, pointRadius: 6, pointBackgroundColor: '#2D6A4F'
    }]
  };

  const gad7ChartData = {
    labels: gad7Sessions.slice(0, 6).reverse().map(s => new Date(s.completedAt || s.createdAt).toLocaleDateString()),
    datasets: [{
      label: 'GAD-7 Score',
      data: gad7Sessions.slice(0, 6).reverse().map(s => s.totalScore),
      borderColor: '#F4A261', backgroundColor: 'rgba(244, 162, 97, 0.1)',
      tension: 0.4, fill: true, pointRadius: 6, pointBackgroundColor: '#F4A261'
    }]
  };

  // Tool usage chart data
  const toolUsageData = toolStats ? {
    labels: Object.keys(toolStats.usageByTool).map(id => id.replace(/_/g, ' ')),
    datasets: [{
      label: 'Times Used',
      data: Object.values(toolStats.usageByTool),
      backgroundColor: 'rgba(82, 183, 136, 0.6)',
      borderColor: '#2D6A4F',
      borderWidth: 1
    }]
  } : null;

  const moodProgressData = toolStats ? {
    labels: Object.keys(toolStats.moodStats).map(id => id.replace(/_/g, ' ')),
    datasets: [
      {
        label: 'Before',
        data: Object.values(toolStats.moodStats).map(s => s.avgBefore),
        backgroundColor: '#F4A261'
      },
      {
        label: 'After',
        data: Object.values(toolStats.moodStats).map(s => s.avgAfter),
        backgroundColor: '#2D6A4F'
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: isDark ? 'rgba(82, 183, 136, 0.08)' : '#f0f0f0' },
        ticks: { color: isDark ? '#8FBFA5' : '#666' }
      },
      x: {
        grid: { display: false },
        ticks: { color: isDark ? '#8FBFA5' : '#666' }
      }
    }
  };

  const exportData = async () => {
    try {
      const response = await api.get('/user/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Neuro Sync AI_Export_${Date.now()}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) { console.error(err); }
  };

  const downloadPDF = async (sessionId, type) => {
    try {
      const response = await api.get(`/reports/generate/${sessionId}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `Neuro_Sync_AI_Report_${type}_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF Download Error:', err);
      alert('Failed to download PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 70 }}>
        <div className="animate-breathe" style={{
          width: 60, height: 60, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2D6A4F, #52B788)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28
        }}>🧠</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', paddingTop: 90, padding: '90px 20px 60px',
      background: 'var(--background)'
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, flexWrap: 'wrap', gap: 12 }}>
            <h1 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', fontSize: '2rem' }}>
              {t('dashboard.title')}
            </h1>
            <button onClick={exportData} className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
              📥 {t('dashboard.export_data', { defaultValue: 'Export All Data' })}
            </button>
          </div>
        </motion.div>

        {sessions.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="card" style={{ textAlign: 'center', padding: 60 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🌱</div>
            <h2 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', marginBottom: 8 }}>
              {t('dashboard.no_data')}
            </h2>
          </motion.div>
        ) : (
          <>
            {/* Overview Cards */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 30
            }}>
              <OverviewCard icon="🩺" label={t('dashboard.last_phq9')}
                value={lastPHQ9 ? `${lastPHQ9.totalScore}/27` : '--'}
                severity={lastPHQ9?.severity} />
              <OverviewCard icon="🫀" label={t('dashboard.last_gad7')}
                value={lastGAD7 ? `${lastGAD7.totalScore}/21` : '--'}
                severity={lastGAD7?.severity} />
              <OverviewCard icon="📊" label={t('dashboard.total_sessions')}
                value={sessions.length} />
              <OverviewCard icon="🌱" label={t('dashboard.streak')}
                value={`${calculateStreak(sessions)} days`} />
            </div>

            {/* Charts */}
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 30
            }}>
              {phq9Sessions.length > 0 && (
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: 'Lora, serif', color: 'var(--primary)', marginBottom: 16, fontSize: '1rem' }}>
                    PHQ-9 — {t('dashboard.progress')}
                  </h3>
                  <Line data={phq9ChartData} options={chartOptions} />
                </div>
              )}
              {gad7Sessions.length > 0 && (
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: 'Lora, serif', color: 'var(--accent)', marginBottom: 16, fontSize: '1rem' }}>
                    GAD-7 — {t('dashboard.progress')}
                  </h3>
                  <Line data={gad7ChartData} options={chartOptions} />
                </div>
              )}
            </div>

            {/* Tool Progress Charts */}
            {toolStats && Object.keys(toolStats.usageByTool).length > 0 && (
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 20, marginBottom: 30
              }}>
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: 'Lora, serif', color: 'var(--primary)', marginBottom: 16, fontSize: '1rem' }}>
                    Therapeutic Tool Usage
                  </h3>
                  <Bar data={toolUsageData} options={{ ...chartOptions, indexAxis: 'y' }} />
                </div>
                <div className="card" style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', marginBottom: 16, fontSize: '1rem' }}>
                    Mood Improvement (Avg)
                  </h3>
                  <Bar data={moodProgressData} options={chartOptions} />
                </div>
              </div>
            )}

            {/* Screening History */}
            <div className="card" style={{ padding: 24, marginBottom: 30 }}>
              <h3 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', marginBottom: 16, fontSize: '1.1rem' }}>
                {t('dashboard.history')}
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--soft)' }}>
                      <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)' }}>Date</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)' }}>Type</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)' }}>Score</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)' }}>Severity</th>
                      <th style={{ textAlign: 'left', padding: '10px 12px', color: 'var(--text-muted)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.slice(0, 10).map(session => (
                      <tr key={session._id} style={{ borderBottom: '1px solid var(--table-row-border)' }}>
                        <td style={{ padding: '10px 12px' }}>
                          {new Date(session.completedAt || session.createdAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: '10px 12px', fontWeight: 600 }}>{session.type}</td>
                        <td style={{ padding: '10px 12px' }}>
                          {session.totalScore}/{session.type === 'PHQ9' ? 27 : 21}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span className={`badge badge-${session.severity}`}>
                            {session.severity?.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <button onClick={() => downloadPDF(session._id, session.type)}
                            style={{
                              background: 'none', border: 'none', color: 'var(--primary)',
                              cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem'
                            }}>📄 PDF</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recommendations */}
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', marginBottom: 16, fontSize: '1.1rem' }}>
                {t('dashboard.recommendations', { defaultValue: 'Recommendations' })}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
                <RecommendationCard icon="🏥" title="Professional Help"
                  links={[
                    { label: 'iCall Counselling', url: 'https://icallhelpline.org' },
                    { label: 'NIMHANS', url: 'https://nimhans.ac.in' },
                    { label: 'Vandrevala Foundation', url: 'https://vandrevalafoundation.com' }
                  ]} />
                <RecommendationCard icon="📚" title="WHO Self-Help Resources"
                  links={[
                    { label: 'WHO mhGAP Guide', url: 'https://www.who.int/teams/mental-health-and-substance-use/treatment-care/mental-health-gap-action-programme' },
                    { label: 'Stress Management', url: 'https://www.who.int/publications/i/item/9789240003927' }
                  ]} />
                <RecommendationCard icon="💡" title="Daily Wellness"
                  links={[
                    { label: 'Mindfulness Exercises' },
                    { label: 'Sleep Hygiene Tips' },
                    { label: 'Physical Activity Guide' }
                  ]} />
                <RecommendationCard icon="🧘" title="Try AI Tools"
                  links={[
                    { label: 'Reflect Your Day', url: '/tools?open=reflect_your_day' },
                    { label: 'Muscle Relaxation', url: '/tools?open=jacobson_relaxation' },
                    { label: 'CBT Cycle Builder', url: '/tools?open=cbt_cycle' }
                  ]} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function OverviewCard({ icon, label, value, severity }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="card" style={{ padding: 20, textAlign: 'center' }}>
      <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Lora, serif', color: 'var(--primary-dark)' }}>
        {value}
      </div>
      {severity && (
        <span className={`badge badge-${severity}`} style={{ marginTop: 8 }}>
          {severity.replace('_', ' ')}
        </span>
      )}
    </motion.div>
  );
}

function RecommendationCard({ icon, title, links }) {
  return (
    <div style={{ background: 'var(--rec-bg)', borderRadius: 12, padding: 20 }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <h4 style={{ fontFamily: 'Lora, serif', color: 'var(--primary-dark)', marginBottom: 12, fontSize: '0.95rem' }}>{title}</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {links.map((link, i) => (
          <a key={i} href={link.url || '#'} target="_blank" rel="noopener noreferrer"
            style={{ color: 'var(--primary)', fontSize: '0.85rem', textDecoration: 'none' }}>
            → {link.label}
          </a>
        ))}
      </div>
    </div>
  );
}

function calculateStreak(sessions) {
  if (!sessions.length) return 0;
  let streak = 1;
  const dates = sessions.map(s => new Date(s.completedAt || s.createdAt).toDateString());
  const uniqueDates = [...new Set(dates)];
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = (new Date(uniqueDates[i - 1]) - new Date(uniqueDates[i])) / (1000 * 60 * 60 * 24);
    if (diff <= 1) streak++;
    else break;
  }
  return streak;
}
