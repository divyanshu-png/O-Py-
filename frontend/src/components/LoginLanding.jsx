import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { animate } from 'animejs';

const LoginLanding = () => {
  const { loginUser, setScreen } = useAuth();
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'register', 'admin'
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      animate(cardRef.current, {
        scale: [0.95, 1],
        opacity: [0, 1],
        duration: 700,
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
        if (activeTab === 'admin' || res.data.is_admin) {
          loginUser({
            ...res.data,
            is_admin: true
          });
          setScreen('admin');
        } else {
          loginUser(res.data);
        }
      } else {
        setError(res.data.message || 'Operation failed.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server or network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex flex-column align-items-center justify-content-center min-vh-100">
      <div className="main-header text-center w-100 mb-4" style={{ maxWidth: '750px' }}>
        <h1 className="fw-bold display-5 text-white mb-2">
          🐍 O(Py) - DSA Examiner Landing
        </h1>
        <p className="text-secondary fs-5 mb-0">
          LeetCode-Style Python Assessment & Evaluation System
        </p>
      </div>

      <div ref={cardRef} className="rounded-box w-100" style={{ maxWidth: '500px' }}>
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

        <h3 className="fw-bold mb-4 text-white text-center">
          {activeTab === 'login' && 'Student Login'}
          {activeTab === 'register' && 'Create Student Account'}
          {activeTab === 'admin' && 'Instructor / Admin Login'}
        </h3>

        {error && (
          <div className="alert alert-danger border-danger-subtle bg-danger-subtle text-danger py-2 text-center rounded-3 mb-3">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-secondary fw-medium">
              {activeTab === 'admin' ? 'Admin Username' : 'Username'}
            </label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <i className="bi bi-person"></i>
              </span>
              <input
                type="text"
                className="form-control bg-dark text-white border-secondary"
                placeholder={activeTab === 'admin' ? 'e.g. admin' : 'Enter username'}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label text-secondary fw-medium">Password</label>
            <div className="input-group">
              <span className="input-group-text bg-dark border-secondary text-secondary">
                <i className="bi bi-lock"></i>
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
            className="btn btn-gradient-primary w-100 py-2.5 fs-6 d-flex align-items-center justify-content-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm"></span>
                Processing...
              </>
            ) : (
              <>
                {activeTab === 'login' && 'Log In'}
                {activeTab === 'register' && 'Register Account'}
                {activeTab === 'admin' && 'Access Admin Panel'}
                <i className="bi bi-arrow-right-short fs-4"></i>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginLanding;
