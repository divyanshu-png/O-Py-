import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AssignAssessmentModal from './AssignAssessmentModal';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchAdminUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/admin/users/', {
        params: { user_id: user?.user_id || 1 }
      });
      if (res.data && res.data.status === 'success') {
        setStudents(res.data.users || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to fetch student list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();

    const handleOpenAssignModal = () => {
      setShowModal(true);
    };

    window.addEventListener('open-assign-modal', handleOpenAssignModal);
    return () => {
      window.removeEventListener('open-assign-modal', handleOpenAssignModal);
    };
  }, [user]);

  const handleAssignedCallback = () => {
    fetchAdminUsers();
    window.dispatchEvent(new CustomEvent('refresh-admin-stats'));
  };

  const totalStudents = students.length;
  const totalAssigned = students.reduce((acc, curr) => acc + (curr.assessments ? curr.assessments.length : 0), 0);
  const totalCompleted = students.reduce(
    (acc, curr) => acc + (curr.assessments ? curr.assessments.filter(a => a.status === 'Completed').length : 0),
    0
  );

  return (
    <div className="container-fluid py-4">
      <div className="main-header d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-orange-glow px-3 py-1 font-mono text-uppercase">Admin Security Audited Console</span>
          </div>
          <h1 className="fw-bold display-6 text-white mb-1 font-mono">
            🛡️ Instructor & Admin Management Panel
          </h1>
          <p className="text-muted mb-0 font-mono">
            Authenticated Admin Account: <strong className="text-orange-bright">{user?.username}</strong>
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn btn-gradient-primary py-2.5 px-4 fs-6 fw-bold d-flex align-items-center gap-2 font-mono"
        >
          <i className="bi bi-plus-circle-fill fs-5"></i>
          Assign New Assessment
        </button>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="stat-card">
            <span className="text-muted small d-block mb-1 font-mono">Registered Students</span>
            <span className="display-6 fw-bold text-white font-mono">{totalStudents}</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <span className="text-muted small d-block mb-1 font-mono">Assigned Assessments</span>
            <span className="display-6 fw-bold text-orange-bright font-mono">{totalAssigned}</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <span className="text-muted small d-block mb-1 font-mono">Completed Assessments</span>
            <span className="display-6 fw-bold text-success font-mono">{totalCompleted}</span>
          </div>
        </div>
      </div>

      <div className="rounded-box">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h4 className="fw-bold text-white mb-0 font-mono">
              📊 Confidential Student Performance & Solve Logs
            </h4>
            <small className="text-muted font-mono">Access Restricted to Authorized Admin Credentials Only</small>
          </div>
          <button onClick={fetchAdminUsers} className="btn btn-sm btn-outline-orange font-mono">
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh Database
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-warning" role="status"></div>
            <p className="text-muted mt-2 font-mono">Loading confidential student records...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger font-mono">{error}</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover table-dark-custom align-middle font-mono">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Student Username</th>
                  <th>LeetCode Rating</th>
                  <th>Contest Badge</th>
                  <th>Questions Solved</th>
                  <th>Recent Solve Record</th>
                  <th>Assigned Assessments</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.user_id}>
                    <td><code>#{s.user_id}</code></td>
                    <td className="fw-bold text-white">{s.username}</td>
                    <td>
                      <span className="fw-bold text-orange-bright">{s.rank}</span>
                    </td>
                    <td>
                      <span className={`badge ${s.rank >= 2150 ? 'bg-danger' : s.rank >= 1850 ? 'bg-amber-glow' : 'bg-orange-glow'} px-2.5 py-1`}>
                        {s.badge}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-success">{s.questions_solved}</span>
                    </td>
                    <td>
                      {s.solved_questions && s.solved_questions.length > 0 ? (
                        <span className="text-muted small">
                          {s.solved_questions.slice(0, 2).map(sq => sq.question_id).join(', ')}
                        </span>
                      ) : (
                        <span className="text-muted small">No solve logs</span>
                      )}
                    </td>
                    <td>
                      {s.assessments && s.assessments.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1">
                          {s.assessments.map((asm) => (
                            <span
                              key={asm.id}
                              className={`badge ${asm.status === 'Completed' ? 'bg-success' : 'bg-dark border border-secondary text-orange'} px-2 py-1`}
                              title={`Assigned: ${asm.created_at}`}
                            >
                              {asm.title} ({asm.status})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted small">None assigned</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AssignAssessmentModal
        show={showModal}
        students={students}
        adminId={user?.user_id}
        onClose={() => setShowModal(false)}
        onAssigned={handleAssignedCallback}
      />
    </div>
  );
};

export default AdminDashboard;
