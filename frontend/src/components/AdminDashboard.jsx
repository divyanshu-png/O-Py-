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
      const res = await axios.get('/api/admin/users/');
      if (res.data && res.data.status === 'success') {
        setStudents(res.data.users || []);
      }
    } catch (err) {
      setError('Unable to fetch student list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const totalStudents = students.length;
  const totalAssigned = students.reduce((acc, curr) => acc + (curr.assessments ? curr.assessments.length : 0), 0);
  const totalCompleted = students.reduce(
    (acc, curr) => acc + (curr.assessments ? curr.assessments.filter(a => a.status === 'Completed').length : 0),
    0
  );

  return (
    <div className="container-fluid py-4">
      <div className="main-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold display-6 text-white mb-1">
            🛡️ Instructor & Admin Management Panel
          </h1>
          <p className="text-secondary mb-0">
            Logged in as Admin: <strong className="text-purple-light">{user?.username}</strong>
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn btn-gradient-primary py-2.5 px-4 fs-6 fw-bold d-flex align-items-center gap-2"
        >
          <i className="bi bi-plus-circle-fill fs-5"></i>
          Assign New Assessment
        </button>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-md-4">
          <div className="stat-card">
            <span className="text-secondary small d-block mb-1">Registered Students</span>
            <span className="display-6 fw-bold text-white">{totalStudents}</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <span className="text-secondary small d-block mb-1">Assigned Assessments</span>
            <span className="display-6 fw-bold text-purple-light">{totalAssigned}</span>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <span className="text-secondary small d-block mb-1">Completed Assessments</span>
            <span className="display-6 fw-bold text-success">{totalCompleted}</span>
          </div>
        </div>
      </div>

      <div className="rounded-box">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold text-white mb-0">
            📊 Student Performance & Assessment Tracker
          </h4>
          <button onClick={fetchAdminUsers} className="btn btn-sm btn-outline-purple text-purple-light">
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-purple" role="status"></div>
            <p className="text-secondary mt-2">Loading student records...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger">{error}</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-dark table-hover table-dark-custom align-middle">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Student Username</th>
                  <th>LeetCode Rating</th>
                  <th>Contest Badge</th>
                  <th>Questions Solved</th>
                  <th>Assigned Assessments</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.user_id}>
                    <td><code>#{s.user_id}</code></td>
                    <td className="fw-bold text-white">{s.username}</td>
                    <td>
                      <span className="fw-bold text-purple-light">{s.rank}</span>
                    </td>
                    <td>
                      <span className={`badge ${s.rank >= 2150 ? 'bg-danger' : s.rank >= 1850 ? 'bg-warning text-dark' : 'bg-primary'} px-2.5 py-1`}>
                        {s.badge}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-success">{s.questions_solved}</span>
                    </td>
                    <td>
                      {s.assessments && s.assessments.length > 0 ? (
                        <div className="d-flex flex-wrap gap-1">
                          {s.assessments.map((asm) => (
                            <span
                              key={asm.id}
                              className={`badge ${asm.status === 'Completed' ? 'bg-success' : 'bg-secondary'} px-2 py-1`}
                              title={`Assigned: ${asm.created_at}`}
                            >
                              {asm.title} ({asm.status})
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-secondary small">No assessments assigned</span>
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
        onAssigned={fetchAdminUsers}
      />
    </div>
  );
};

export default AdminDashboard;
