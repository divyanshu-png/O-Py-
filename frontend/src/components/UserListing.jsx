import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const UserListing = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/users/', {
        params: { user_id: user?.user_id || 1 }
      });
      if (res.data && res.data.status === 'success') {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Access Denied: Only administrators can view student listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  return (
    <div className="rounded-box font-mono">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-white mb-1">
            🛡️ Admin Student Audit & Solve History
          </h4>
          <small className="text-muted">
            Restricted Administrator Database View
          </small>
        </div>
        <button onClick={fetchUsers} className="btn btn-sm btn-outline-orange">
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-warning" role="status"></div>
          <p className="text-muted mt-2 mb-0">Loading student directory...</p>
        </div>
      ) : error ? (
        <div className="alert alert-warning text-warning border-warning bg-dark">
          <i className="bi bi-shield-lock me-2"></i>
          {error}
        </div>
      ) : users.length === 0 ? (
        <p className="text-muted mb-0">No student profiles found.</p>
      ) : (
        <>
          <div className="table-responsive mb-4">
            <table className="table table-dark table-hover table-dark-custom align-middle">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Username</th>
                  <th>ELO Rating</th>
                  <th>Questions Solved</th>
                  <th>Recent Solve Logs</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id}>
                    <td><code>#{u.user_id}</code></td>
                    <td className="fw-bold text-white">{u.username}</td>
                    <td>
                      <span className="badge bg-orange-glow text-orange px-2.5 py-1">
                        {u.rank}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-success">{u.questions_solved}</span>
                    </td>
                    <td>
                      {u.solved_questions && u.solved_questions.length > 0 ? (
                        <span className="text-muted">
                          {u.solved_questions.slice(0, 3).map(sq => sq.question_id).join(', ')}
                        </span>
                      ) : (
                        <span className="text-muted small">None yet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default UserListing;
