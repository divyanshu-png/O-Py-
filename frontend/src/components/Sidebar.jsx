import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { animate } from 'animejs';

const Sidebar = () => {
  const { user, screen, setScreen, logoutUser } = useAuth();
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (sidebarRef.current) {
      animate(sidebarRef.current, {
        translateX: [-50, 0],
        opacity: [0, 1],
        duration: 800,
        ease: 'outCubic'
      });
    }
  }, []);

  const rankPercentile = user ? Math.min(Math.max(((user.rank || 1500) - 800) / 1600 * 100, 0), 100) : 0;
  
  const getBadgeTitle = (rank) => {
    if (rank >= 2150) return { title: 'Guardian 🛡️', color: 'bg-danger' };
    if (rank >= 1850) return { title: 'Knight ⚔️', color: 'bg-warning text-dark' };
    return { title: 'Contestant 🧩', color: 'bg-primary' };
  };

  const badgeInfo = getBadgeTitle(user?.rank || 1500);

  return (
    <div ref={sidebarRef} className="sidebar-panel d-flex flex-column justify-content-between">
      <div>
        <div className="d-flex align-items-center gap-2 mb-4">
          <i className="bi bi-code-slash fs-2 text-purple-light"></i>
          <h4 className="fw-bold m-0 text-white">O(Py) DSA System</h4>
        </div>

        <hr className="border-secondary mb-4" />

        {user ? (
          <div className="mb-4">
            <div className="stat-card mb-3 text-start">
              <div className="d-flex align-items-center gap-2 mb-2">
                <i className="bi bi-person-circle fs-4 text-purple-light"></i>
                <div>
                  <small className="text-secondary d-block">
                    {user.is_admin ? 'Instructor / Admin' : 'Logged in Student'}
                  </small>
                  <span className="fw-bold text-white fs-6">{user.username}</span>
                </div>
              </div>
              <div className="mt-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small className="text-secondary">LeetCode Rating</small>
                  <span className="badge bg-purple-dark text-purple-light fw-bold px-2 py-1">
                    {user.rank || 1500}
                  </span>
                </div>
                <div className="mb-2">
                  <span className={`badge ${badgeInfo.color} px-2 py-0.5 small`}>
                    {badgeInfo.title}
                  </span>
                </div>
                <div className="progress" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <div 
                    className="progress-bar bg-gradient-purple" 
                    style={{ 
                      width: `${rankPercentile}%`, 
                      background: 'linear-gradient(90deg, #8b5cf6, #ec4899)' 
                    }}
                  />
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top border-secondary-subtle">
                <small className="text-secondary">Questions Solved</small>
                <span className="fw-bold text-success">{user.questions_solved || 0}</span>
              </div>
            </div>

            <nav className="nav flex-column gap-2">
              {user.is_admin && (
                <button 
                  onClick={() => setScreen('admin')} 
                  className={`nav-link-custom border-0 text-start ${screen === 'admin' ? 'active' : ''}`}
                >
                  <i className="bi bi-shield-lock-fill"></i>
                  Admin Panel
                </button>
              )}
              <button 
                onClick={() => setScreen('start_test')} 
                className={`nav-link-custom border-0 text-start ${screen === 'start_test' ? 'active' : ''}`}
              >
                <i className="bi bi-house-door-fill"></i>
                Dashboard / Start Test
              </button>
              <button 
                onClick={() => setScreen('workspace')} 
                className={`nav-link-custom border-0 text-start ${screen === 'workspace' ? 'active' : ''}`}
              >
                <i className="bi bi-terminal-fill"></i>
                Coding Workspace
              </button>
            </nav>
          </div>
        ) : (
          <div className="alert alert-info bg-dark text-info border-secondary">
            <i className="bi bi-info-circle me-2"></i>
            Please log in or register to access DSA tests.
          </div>
        )}
      </div>

      {user && (
        <button 
          onClick={logoutUser} 
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 rounded-3 py-2"
        >
          <i className="bi bi-box-arrow-right"></i>
          Logout Session
        </button>
      )}
    </div>
  );
};

export default Sidebar;
