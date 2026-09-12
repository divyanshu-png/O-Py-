import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AssignedAssessments = ({ onStartAssessment }) => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAssessments = async () => {
    if (!user || !user.user_id) return;
    setLoading(true);
    try {
      const res = await axios.get('/api/student/assessments/', {
        params: { user_id: user.user_id }
      });
      if (res.data && res.data.status === 'success') {
        setAssessments(res.data.assessments || []);
      }
    } catch (err) {
      console.error('Failed to fetch assigned assessments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, [user]);

  if (loading) {
    return (
      <div className="rounded-box text-center py-3 font-mono">
        <div className="spinner-border spinner-border-sm text-warning me-2"></div>
        <small className="text-muted">Loading assigned assessments...</small>
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="rounded-box mb-4 font-mono">
        <h4 className="fw-bold text-white mb-2">📋 Assigned Instructor Assessments</h4>
        <p className="text-muted mb-0">No custom instructor assessments assigned to you currently. Practice freely using the adaptive test generator!</p>
      </div>
    );
  }

  return (
    <div className="rounded-box mb-4 font-mono">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-white mb-0">📋 Assigned Instructor Assessments</h4>
        <button onClick={fetchAssessments} className="btn btn-sm btn-outline-orange">
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      <div className="row g-3">
        {assessments.map((asm) => (
          <div className="col-md-6" key={asm.id}>
            <div className="p-3 bg-dark rounded-3 border border-secondary h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h5 className="fw-bold text-white mb-0">{asm.title}</h5>
                  <span className={`badge ${asm.status === 'Completed' ? 'bg-success' : 'bg-amber-glow'}`}>
                    {asm.status}
                  </span>
                </div>
                <p className="text-muted small mb-2" style={{ whiteSpace: 'pre-wrap' }}>
                  {asm.problem_description}
                </p>
                <div className="d-flex gap-2 mb-3">
                  <span className="badge bg-orange-glow text-orange">
                    Rating: {asm.difficulty} ELO
                  </span>
                  <span className="text-muted small">
                    Assigned: {asm.created_at}
                  </span>
                </div>
              </div>

              {asm.status === 'Pending' ? (
                <button
                  onClick={() => onStartAssessment(asm)}
                  className="btn btn-gradient-primary w-100 py-2 fs-6 fw-semibold d-flex align-items-center justify-content-center gap-2"
                >
                  🚀 Take Assessment Now
                  <i className="bi bi-arrow-right"></i>
                </button>
              ) : (
                <div className="alert alert-success py-1.5 text-center mb-0 small border-0 bg-dark text-success border-success">
                  <i className="bi bi-check-circle-fill me-1"></i> Completed on {asm.completed_at}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignedAssessments;
