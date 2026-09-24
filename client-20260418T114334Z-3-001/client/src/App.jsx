import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Screening from './pages/Screening';
import PHQ9 from './pages/PHQ9';
import GAD7 from './pages/GAD7';
import Chat from './pages/Chat';
import Games from './pages/Games';
import VoiceRecorder from './pages/VoiceRecorder';
import Dashboard from './pages/Dashboard';
import TherapeuticTools from './pages/TherapeuticTools';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="animate-breathe" style={{
        width: 60, height: 60, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28
      }}>🧠</div>
    </div>
  );
  return user ? children : <Navigate to="/login" />;
}

function AppContent() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/screening" element={<ProtectedRoute><Screening /></ProtectedRoute>} />
          <Route path="/phq9" element={<ProtectedRoute><PHQ9 /></ProtectedRoute>} />
          <Route path="/gad7" element={<ProtectedRoute><GAD7 /></ProtectedRoute>} />
          <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
          <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
          <Route path="/voice" element={<ProtectedRoute><VoiceRecorder /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/tools" element={<ProtectedRoute><TherapeuticTools /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
