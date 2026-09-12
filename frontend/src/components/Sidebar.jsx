import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { animate } from 'animejs';

const Sidebar = () => {
  const { user, screen, setScreen, logoutUser } = useAuth();
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (sidebarRef.current) {
      animate(sidebarRef.current, {
        translateX: [-40, 0],
        opacity: [0, 1],
        duration: 700,
        ease: 'outCubic'
      });
    }
  }, []);

  const rankPercentile = user ? Math.min(Math.max(((user.rank || 1500) - 800) / 1600 * 100, 0), 100) : 0;
  
  const getBadgeTitle = (rank) => {
    if (rank >= 2150) return { title: 'Guardian 🛡️', color: 'bg-danger text-white' };
    if (rank >= 1850) return { title: 'Knight ⚔️', color: 'bg-amber-glow' };
    return { title: 'Contestant 🧩', color: 'bg-orange-glow' };
  };

  const badgeInfo = getBadgeTitle(user?.rank || 1500);

  return (
    <div ref={sidebarRef} className="sidebar-panel d-flex flex-column justify-content-between">
      <div>
        {/* Increased distance around O(Py) logo (gap-4, mb-5, padding) */}
        <div className="d-flex align-items-center gap-4 mb-5 pt-2 ps-1">
          <div className="p-3 rounded-3 bg-orange-glow me-1">
            <i className="bi bi-code-slash fs-2 text-orange-bright"></i>
          </div>
          <div>
            <h4 className="fw-extrabold m-0 text-white font-mono" style={{ letterSpacing: '0.04em' }}>
              O(Py) Examiner
            </h4>
            <small className="text-orange font-mono fw-bold" style={{ fontSize: '0.75rem', letterSpacing: '0.08em' }}>
              LEETCODE EDITION
            </small>
          </div>
        </div>

        <hr className="border-secondary mb-4 opacity-50" />

        {user ? (
          <div className="mb-4">
            {/* Profile Card: Clickable to jump to User Profile Details */}
            <div 
              className="stat-card mb-4 text-start p-4 cursor-pointer" 
              style={{ cursor: 'pointer' }}
              onClick={() => setScreen('profile')}
              title="Click to view & edit User Details"
            >
              <div className="d-flex align-items-center gap-4 mb-3 ps-1">
                <div className="me-2">
                  <i className="bi bi-person-circle fs-1 text-orange"></i>
                </div>
                <div>
                  <small className="text-offwhite d-block font-mono fw-semibold mb-0.5" style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                    {user.is_admin ? 'INSTRUCTOR / ADMIN' : 'STUDENT PROFILE'}
                  </small>
                  <span className="fw-bold text-white fs-5 font-mono">{user.username}</span>
                </div>
              </div>

              <div className="mt-3 pt-2">
                <div className="d-flex justify-content-between align-items-center mb-1.5">
                  <small className="text-offwhite font-mono fw-semibold">LeetCode Rating</small>
                  <span className="badge bg-dark border border-orange text-orange fw-bold font-mono px-2.5 py-1 fs-6">
                    {user.rank || 1500}
                  </span>
                </div>
                <div className="mb-2.5">
                  <span className={`badge ${badgeInfo.color} px-2.5 py-1 font-mono small`}>
                    {badgeInfo.title}
                  </span>
                </div>
                <div className="progress" style={{ height: '7px', backgroundColor: '#27272a' }}>
                  <div 
                    className="progress-bar" 
                    style={{ 
                      width: `${rankPercentile}%`, 
                      background: 'linear-gradient(90deg, #f97316, #ff8c00, #fbbf24)' 
                    }}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3.5 pt-2.5 border-top border-secondary-subtle">
                <small className="text-offwhite font-mono fw-semibold">Questions Solved</small>
                <span className="fw-bold text-success font-mono fs-6">{user.questions_solved || 0}</span>
              </div>
            </div>

            <nav className="nav flex-column gap-2.5 font-mono">
              {user.is_admin && (
                <button 
                  onClick={() => setScreen('admin')} 
                  className={`nav-link-custom border-0 text-start ${screen === 'admin' ? 'active' : ''}`}
                >
                  <i className="bi bi-shield-lock-fill text-orange fs-5"></i>
                  Admin Panel
                </button>
              )}
              <button 
                onClick={() => setScreen('profile')} 
                className={`nav-link-custom border-0 text-start ${screen === 'profile' ? 'active' : ''}`}
              >
                <i className="bi bi-person-badge-fill text-orange fs-5"></i>
                My Profile Details
              </button>
              <button 
                onClick={() => setScreen('start_test')} 
                className={`nav-link-custom border-0 text-start ${screen === 'start_test' ? 'active' : ''}`}
              >
                <i className="bi bi-grid-1x2-fill text-orange fs-5"></i>
                Dashboard / Tests
              </button>
              <button 
                onClick={() => setScreen('workspace')} 
                className={`nav-link-custom border-0 text-start ${screen === 'workspace' ? 'active' : ''}`}
              >
                <i className="bi bi-terminal-fill text-orange fs-5"></i>
                Coding Workspace
              </button>
            </nav>
          </div>
        ) : (
          <div className="alert alert-warning bg-dark text-warning border-secondary font-mono small">
            <i className="bi bi-info-circle me-2"></i>
            Please log in or register to access DSA tests.
          </div>
        )}
      </div>

      {user && (
        <button 
          onClick={logoutUser} 
          className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 rounded-3 py-2.5 font-mono mt-3"
        >
          <i className="bi bi-box-arrow-right fs-5"></i>
          Logout Session
        </button>
      )}
    </div>
  );
};

export default Sidebar;
