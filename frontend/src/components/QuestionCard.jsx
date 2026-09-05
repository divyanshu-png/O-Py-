import React from 'react';

const QuestionCard = ({ questionData, onRefresh, loading }) => {
  return (
    <div className="rounded-box">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold text-white mb-0">
          <i className="bi bi-file-code-fill me-2 text-purple-light"></i>
          DSA Question
        </h4>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="btn btn-sm btn-outline-secondary text-light d-flex align-items-center gap-1"
        >
          <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
          Get New Challenge
        </button>
      </div>

      {loading ? (
        <div className="py-4 text-center">
          <div className="spinner-border text-purple" role="status"></div>
          <p className="text-secondary mt-2 mb-0">Generating adaptive question...</p>
        </div>
      ) : (
        <>
          <div className="p-3 bg-dark rounded-3 border border-secondary mb-3">
            <p className="fs-5 text-white mb-0" style={{ whiteSpace: 'pre-wrap' }}>
              {questionData?.question || "Write a function `find_max(numbers)` that returns the largest number in a list."}
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-purple-dark text-purple-light px-3 py-1.5 fs-6">
              Difficulty Level: {questionData?.difficulty || 1000}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default QuestionCard;
