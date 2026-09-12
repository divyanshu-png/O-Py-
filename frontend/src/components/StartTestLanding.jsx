import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import AssignedAssessments from './AssignedAssessments';
import { animate, stagger } from 'animejs';

const StartTestLanding = ({ onStartAssessment }) => {
  const { user, setScreen, refreshProfile } = useAuth();
  const containerRef = useRef(null);

  useEffect(() => {
    refreshProfile();
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll('.animate-item');
      if (items.length > 0) {
        animate(items, {
          translateY: [25, 0],
          opacity: [0, 1],
          delay: stagger(90),
          duration: 750,
          ease: 'outCubic'
        });
      }
    }
  }, []);

  const getBadgeTitle = (rank) => {
    if (rank >= 2150) return { title: 'Guardian 🛡️', color: 'bg-danger text-white' };
    if (rank >= 1850) return { title: 'Knight ⚔️', color: 'bg-amber-glow' };
    return { title: 'Contestant 🧩', color: 'bg-orange-glow' };
  };

  const badgeInfo = getBadgeTitle(user?.rank || 1500);

  return (
    <div ref={containerRef} className="container-fluid py-4">
      <div className="main-header animate-item d-flex justify-content-between align-items-center flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-orange-glow px-3 py-1 font-mono text-uppercase">Student Dashboard</span>
          </div>
          <h1 className="fw-bold display-6 text-white mb-1 font-mono">
            🚀 DSA Assessment Center
          </h1>
          <p className="text-muted fs-5 mb-0">
            Welcome back, <strong className="text-orange-bright">{user?.username}</strong>!
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className={`badge ${badgeInfo.color} px-3 py-2 fs-6 font-mono`}>
            {badgeInfo.title}
          </span>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6 animate-item">
          <div className="rounded-box h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="p-2 rounded-3 bg-orange-glow">
                  <i className="bi bi-play-circle-fill fs-3 text-orange-bright"></i>
                </div>
                <h4 className="fw-bold text-white mb-0 font-mono">Adaptive Practice Test</h4>
              </div>
              <p className="text-muted">
                Launch an AI-generated Python challenge calibrated to your current ELO rating level ({user?.rank || 1500}).
              </p>
            </div>
            
            <button
              onClick={() => setScreen('workspace')}
              className="btn btn-gradient-primary w-100 py-3 fs-5 fw-bold d-flex align-items-center justify-content-center gap-2 mt-3 font-mono"
            >
              🚀 Launch Practice Test Now
              <i className="bi bi-arrow-right-circle-fill"></i>
            </button>
          </div>
        </div>

        <div className="col-lg-6 animate-item">
          <div className="rounded-box h-100">
            <h4 className="fw-bold text-white mb-4 font-mono">📊 LeetCode Performance Metrics</h4>
            <div className="row g-3">
              <div className="col-6">
                <div className="stat-card">
                  <span className="text-muted small d-block mb-1 font-mono">LeetCode ELO Rating</span>
                  <span className="display-6 fw-bold text-orange-bright font-mono">{user?.rank || 1500}</span>
                </div>
              </div>
              <div className="col-6">
                <div className="stat-card">
                  <span className="text-muted small d-block mb-1 font-mono">Total Questions Solved</span>
                  <span className="display-6 fw-bold text-success font-mono">{user?.questions_solved || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-item">
        <AssignedAssessments onStartAssessment={onStartAssessment} />
      </div>
    </div>
  );
};

export default StartTestLanding;
