import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import UserListing from './UserListing';
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
          translateY: [30, 0],
          opacity: [0, 1],
          delay: stagger(100),
          duration: 800,
          ease: 'outCubic'
        });
      }
    }
  }, []);

  const getBadgeTitle = (rank) => {
    if (rank >= 2150) return { title: 'Guardian 🛡️', color: 'bg-danger' };
    if (rank >= 1850) return { title: 'Knight ⚔️', color: 'bg-warning text-dark' };
    return { title: 'Contestant 🧩', color: 'bg-primary' };
  };

  const badgeInfo = getBadgeTitle(user?.rank || 1500);

  return (
    <div ref={containerRef} className="container-fluid py-4">
      <div className="main-header animate-item">
        <h1 className="fw-bold display-6 text-white mb-2">
          🚀 Start Test Landing Page
        </h1>
        <p className="text-secondary fs-5 mb-0">
          Welcome back, <strong className="text-purple-light">{user?.username}</strong>!
          <span className={`badge ${badgeInfo.color} ms-3 px-3 py-1 fs-6`}>
            {badgeInfo.title}
          </span>
        </p>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6 animate-item">
          <div className="rounded-box h-100 d-flex flex-column justify-content-between">
            <div>
              <div className="d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-play-circle-fill fs-3 text-purple-light"></i>
                <h4 className="fw-bold text-white mb-0">Practice Test Launcher</h4>
              </div>
              <p className="text-secondary">
                Launch an AI-generated Python challenge adapted to your current LeetCode rating level ({user?.rank || 1500}).
              </p>
            </div>
            
            <button
              onClick={() => setScreen('workspace')}
              className="btn btn-gradient-primary w-100 py-3 fs-5 fw-bold d-flex align-items-center justify-content-center gap-2 mt-3"
            >
              🚀 Start Practice Test Now
              <i className="bi bi-arrow-right-circle-fill"></i>
            </button>
          </div>
        </div>

        <div className="col-lg-6 animate-item">
          <div className="rounded-box h-100">
            <h4 className="fw-bold text-white mb-4">📊 Contest Performance Overview</h4>
            <div className="row g-3">
              <div className="col-6">
                <div className="stat-card">
                  <span className="text-secondary small d-block mb-1">LeetCode Rating</span>
                  <span className="display-6 fw-bold text-purple-light">{user?.rank || 1500}</span>
                </div>
              </div>
              <div className="col-6">
                <div className="stat-card">
                  <span className="text-secondary small d-block mb-1">Total Questions Solved</span>
                  <span className="display-6 fw-bold text-success">{user?.questions_solved || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="animate-item">
        <AssignedAssessments onStartAssessment={onStartAssessment} />
      </div>

      <div className="animate-item">
        <UserListing />
      </div>
    </div>
  );
};

export default StartTestLanding;
