import React, { useState } from 'react';
import axios from 'axios';

const PROBLEM_BANK = [
  {
    title: "1. Two Sum",
    difficulty: 1200,
    tier: "Easy",
    description: "Write a function `find_max(numbers)` that returns the maximum number in a list of integers."
  },
  {
    title: "2. Reverse Linked List",
    difficulty: 1600,
    tier: "Medium",
    description: "Write a function `find_max(numbers)` that finds the maximum value in a list including negative numbers."
  },
  {
    title: "3. Binary Search",
    difficulty: 1200,
    tier: "Easy",
    description: "Write a function `find_max(numbers)` that returns the largest number from an array of integers."
  },
  {
    title: "4. Valid Anagram",
    difficulty: 1600,
    tier: "Medium",
    description: "Write a function `find_max(numbers)` that calculates the peak value of a sequence."
  },
  {
    title: "5. Maximum Subarray",
    difficulty: 2000,
    tier: "Hard",
    description: "Write a function `find_max(numbers)` that finds the maximum element in a large input list."
  }
];

const AssignAssessmentModal = ({ students, adminId, show, onClose, onAssigned }) => {
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedProblemIndex, setSelectedProblemIndex] = useState('0');
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  if (!show) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (!selectedStudentId) {
      setMsg({ type: 'danger', text: 'Please select a student target.' });
      return;
    }

    let title = '';
    let problem_description = '';
    let difficulty = 1600;

    if (useCustom) {
      title = customTitle.trim();
      problem_description = customDescription.trim();
      if (!title || !problem_description) {
        setMsg({ type: 'danger', text: 'Custom Title and Description are required.' });
        return;
      }
    } else {
      const prob = PROBLEM_BANK[parseInt(selectedProblemIndex, 10)];
      title = prob.title;
      problem_description = prob.description;
      difficulty = prob.difficulty;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/admin/assign-assessment/', {
        admin_id: adminId || 1,
        student_user_id: parseInt(selectedStudentId, 10),
        title,
        problem_description,
        difficulty
      });

      if (res.data && res.data.status === 'success') {
        setMsg({ type: 'success', text: res.data.message });
        setTimeout(() => {
          onAssigned();
          onClose();
        }, 1200);
      } else {
        setMsg({ type: 'danger', text: res.data.message || 'Failed to assign assessment.' });
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Server authorization error.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block font-mono" style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1050 }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content bg-dark text-white border border-secondary rounded-4 shadow-lg">
          <div className="modal-header border-secondary">
            <h5 className="modal-title fw-bold text-orange">
              <i className="bi bi-journal-plus me-2"></i>
              Assign Custom Assessment to Student
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              {msg.text && (
                <div className={`alert alert-${msg.type} py-2 mb-3 border-0 bg-dark text-${msg.type}`}>
                  {msg.text}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label text-muted fw-semibold">Select Student Target</label>
                <select
                  className="form-select bg-dark text-white border-secondary"
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                  <option value="">-- Choose Target Student --</option>
                  {students.map((s) => (
                    <option key={s.user_id} value={s.user_id}>
                      {s.username} (Rating: {s.rank} - {s.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="customSwitch"
                  checked={useCustom}
                  onChange={(e) => setUseCustom(e.target.checked)}
                />
                <label className="form-check-label text-muted" htmlFor="customSwitch">
                  Create Custom Assessment (instead of Problem Bank)
                </label>
              </div>

              {!useCustom ? (
                <div className="mb-3">
                  <label className="form-label text-muted fw-semibold">Pick from Problem Bank</label>
                  <select
                    className="form-select bg-dark text-white border-secondary mb-3"
                    value={selectedProblemIndex}
                    onChange={(e) => setSelectedProblemIndex(e.target.value)}
                  >
                    {PROBLEM_BANK.map((p, idx) => (
                      <option key={idx} value={idx}>
                        {p.title} ({p.tier} - Difficulty: {p.difficulty})
                      </option>
                    ))}
                  </select>

                  <div className="p-3 bg-dark rounded-3 border border-secondary">
                    <small className="text-muted d-block mb-1">Problem Description Preview:</small>
                    <p className="text-white mb-0 small">{PROBLEM_BANK[parseInt(selectedProblemIndex, 10)].description}</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="form-label text-muted fw-semibold">Assessment Title</label>
                    <input
                      type="text"
                      className="form-control bg-dark text-white border-secondary"
                      placeholder="e.g., LeetCode 1. Two Sum Challenge"
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-muted fw-semibold">Problem Description</label>
                    <textarea
                      className="form-control bg-dark text-white border-secondary"
                      rows="4"
                      placeholder="Write problem constraints and requirements..."
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                    ></textarea>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btn-gradient-primary px-4" disabled={loading}>
                {loading ? 'Assigning...' : 'Assign Assessment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignAssessmentModal;
