import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { animate } from 'animejs';
import StarfieldBackground from './StarfieldBackground';
import MorphTransition from './MorphTransition';

const LoginLanding = () => {
  const { loginUser, setScreen } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'register', 'admin'
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Particle Morph Transition State
  const [morphing, setMorphing] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [pendingScreen, setPendingScreen] = useState('start_test');

  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      animate(cardRef.current, {
        scale: [0.96, 1],
        opacity: [0, 1],
        duration: 600,
        ease: 'outExpo'
      });
    }
  }, [activeTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password.trim()) {
      setError('Please provide both username and password.');
      return;
    }

    setLoading(true);
    let endpoint = '/api/login/';
    if (activeTab === 'register') endpoint = '/api/register/';
    if (activeTab === 'admin') endpoint = '/api/admin/login/';

    try {
      const res = await axios.post(endpoint, {
        username: username.trim(),
        password: password.trim()
      });

      if (res.data && res.data.status === 'success') {
        const userData = (activeTab === 'admin' || res.data.is_admin) 
          ? { ...res.data, is_admin: true }
          : res.data;

        const targetScreen = (activeTab === 'admin' || res.data.is_admin) ? 'admin' : 'start_test';

        // Trigger morph animation transition before full login switch
        setPendingUser(userData);
        setPendingScreen(targetScreen);
        setMorphing(true);
      } else {
        setError(res.data.message || 'Operation failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server or network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleMorphComplete = () => {
    if (pendingUser) {
      loginUser(pendingUser);
      setScreen(pendingScreen);
    }
  };

  if (morphing) {
    return <MorphTransition username={pendingUser?.username || username} onComplete={handleMorphComplete} />;
  }

  return (
    <div className="position-relative min-vh-100 d-flex flex-column align-items-center justify-content-center p-3">
      {/* Goal 2: Animated Starfield Background */}
      <StarfieldBackground />

      <div className="main-header text-center w-100 mb-4 position-relative" style={{ maxWidth: '750px', zIndex: 1 }}>
        <div className="d-flex align-items-center justify-content-center gap-3 mb-2">
          <span className="badge bg-orange-glow px-3 py-1 font-mono text-uppercase">O(Py) Examiner v2.0</span>
        </div>
        <h1 className="fw-extrabold display-5 text-white mb-2 font-mono">
          🐍 <span className="text-orange-bright">O(Py)</span> DSA Platform
        </h1>
        <p className="text-muted fs-5 mb-0">
          Professional LeetCode & HackerRank Style Adaptive Assessment System
        </p>
      </div>

      <div ref={cardRef} className="rounded-box w-100 position-relative" style={{ maxWidth: '480px', zIndex: 1 }}>
        <div className="d-flex rounded-3 bg-dark p-1 mb-4 border border-secondary">
          <button
            className={`btn flex-fill py-2 fw-semibold rounded-2 border-0 ${activeTab === 'login' ? 'btn-gradient-primary' : 'text-secondary'}`}
            onClick={() => { setActiveTab('login'); setError(''); }}
          >
            🔐 Student Login
          </button>
          <button
            className={`btn flex-fill py-2 fw-semibold rounded-2 border-0 ${activeTab === 'register' ? 'btn-gradient-primary' : 'text-secondary'}`}
            onClick={() => { setActiveTab('register'); setError(''); }}
          >
            📝 Register
          </button>
          <button
            className={`btn flex-fill py-2 fw-semibold rounded-2 border-0 ${activeTab === 'admin' ? 'btn-gradient-primary' : 'text-secondary'}`}
            onClick={() => { setActiveTab('admin'); setError(''); }}
          >
            🛡️ Admin
          </button>
        </div>

        <h3 className="fw-bold mb-4 text-white text-center font-mono">
          {activeTab === 'login' && 'Student Authentication'}
          {activeTab === 'register' && 'Register New Student'}
          {activeTab === 'admin' && 'Instructor / Admin Login'}
        </h3>

        {error && (
          <div className="alert alert-danger border-danger bg-dark text-danger py-2.5 text-center rounded-3 mb-3">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-muted fw-semibold small text-uppercase font-mono">
              {activeTab === 'admin' ? 'Admin Username' : 'Username'}
            </label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-orange">
                <i className="bi bi-person-fill"></i>
              </span>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                placeholder={activeTab === 'admin' ? 'e.g. admin' : 'Enter username (e.g. alex_coder)'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-muted fw-semibold small text-uppercase font-mono">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-orange">
                <i className="bi bi-lock-fill"></i>
              </span>
              <input
                type="password"
                className="form-control bg-dark text-white border-secondary"
                placeholder={activeTab === 'admin' ? 'e.g. admin123' : 'Enter password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-gradient-primary w-100 py-3 fs-6 d-flex align-items-center justify-content-center gap-2 font-mono"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span>
                Authenticating...
              </>
            ) : (
              <>
                {activeTab === 'login' && 'Sign In to Platform'}
                {activeTab === 'register' && 'Create Account & Enter'}
                {activeTab === 'admin' && 'Access Admin Console'}
                <i className="bi bi-arrow-right-circle-fill fs-5"></i>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-top border-secondary text-center">
          <small className="text-muted">
            Demo Student Account: <code className="text-orange">alex_coder</code> / <code className="text-orange">pass123</code> | Admin: <code className="text-orange">admin</code> / <code className="text-orange">admin123</code>
          </small>
        </div>
      </div>
    </div>
  );
};

export default LoginLanding;
