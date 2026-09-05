import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserListing = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/users/');
      if (res.data && res.data.status === 'success') {
        setUsers(res.data.users || []);
      }
    } catch (err) {
      setError('Unable to load database users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="rounded-box">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-white mb-1">
            🗄️ Database User Listing & History
          </h4>
          <small className="text-secondary">
            Live listing of all registered users stored in SQLite database and questions solved afterwards
          </small>
        </div>
        <button onClick={fetchUsers} className="btn btn-sm btn-outline-purple text-purple-light">
          <i className="bi bi-arrow-clockwise me-1"></i> Refresh
        </button>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-purple" role="status"></div>
          <p className="text-secondary mt-2 mb-0">Loading database users...</p>
        </div>
      ) : error ? (
        <div className="alert alert-warning text-warning border-warning-subtle bg-dark">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      ) : users.length === 0 ? (
        <p className="text-secondary mb-0">No users found in database.</p>
      ) : (
        <>
          <div className="table-responsive mb-4">
            <table className="table table-dark table-hover table-dark-custom align-middle">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Username</th>
                  <th>ELO Rank</th>
                  <th>Questions Solved</th>
                  <th>Recent Solved Questions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id}>
                    <td><code>#{u.user_id}</code></td>
                    <td className="fw-bold text-white">{u.username}</td>
                    <td>
                      <span className="badge bg-purple-dark text-purple-light px-2.5 py-1">
                        {u.rank}
                      </span>
                    </td>
                    <td>
                      <span className="fw-bold text-success">{u.questions_solved}</span>
                    </td>
                    <td>
                      {u.solved_questions && u.solved_questions.length > 0 ? (
                        <span className="text-info-light">
                          {u.solved_questions.slice(0, 3).map(sq => sq.question_id).join(', ')}
                        </span>
                      ) : (
                        <span className="text-secondary small">None yet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="accordion" id="userHistoryAccordion">
            {users.map((u, idx) => (
              <div className="accordion-item" key={`acc-${u.user_id}`}>
                <h2 className="accordion-header" id={`heading-${u.user_id}`}>
                  <button
                    className="accordion-button collapsed"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target={`#collapse-${u.user_id}`}
                    aria-expanded="false"
                    aria-controls={`collapse-${u.user_id}`}
                  >
                    <i className="bi bi-clock-history me-2 text-purple-light"></i>
                    Solved Question Log for <strong>&nbsp;{u.username}&nbsp;</strong> (Total: {u.questions_solved})
                  </button>
                </h2>
                <div
                  id={`collapse-${u.user_id}`}
                  className="accordion-collapse collapse"
                  data-bs-parent="#userHistoryAccordion"
                >
                  <div className="accordion-body bg-dark text-white">
                    {u.solved_questions && u.solved_questions.length > 0 ? (
                      <ul className="list-group list-group-flush bg-transparent">
                        {u.solved_questions.map((q, qIdx) => (
                          <li className="list-group-item bg-transparent text-light border-secondary d-flex justify-content-between align-items-center" key={qIdx}>
                            <div>
                              <span className="fw-bold text-purple-light">Question:</span> <code>{q.question_id}</code>
                            </div>
                            <div>
                              <span className="badge bg-secondary me-2">Score: {q.ai_score}</span>
                              <small className="text-secondary">{q.timestamp}</small>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-secondary mb-0">No question solve history recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default UserListing;
