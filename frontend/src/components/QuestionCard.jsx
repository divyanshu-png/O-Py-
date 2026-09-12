import React, { useState, useEffect } from 'react';

const QuestionCard = ({ questionData, onRefresh, loading }) => {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Fetching adaptive question...');
  const [activeTab, setActiveTab] = useState('description');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (loading) {
      setProgress(15);
      setLoadingText('Connecting to Adaptive AI Manager...');

      const t1 = setTimeout(() => {
        setProgress(45);
        setLoadingText('Parsing DSA Problem Statement & AST...');
      }, 300);

      const t2 = setTimeout(() => {
        setProgress(85);
        setLoadingText('Generating Execution Test Matrix...');
      }, 600);

      const t3 = setTimeout(() => {
        setProgress(100);
        setLoadingText('DSA Challenge Ready!');
      }, 900);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    } else {
      setProgress(100);
    }
  }, [loading]);

  const difficulty = questionData?.difficulty || 1500;
  const getDifficultyBadge = (diff) => {
    if (diff >= 1850) return { label: 'Hard', class: 'bg-danger text-white' };
    if (diff >= 1550) return { label: 'Medium', class: 'bg-warning-glow text-amber' };
    return { label: 'Easy', class: 'bg-success-glow text-success' };
  };

  const diffInfo = getDifficultyBadge(difficulty);

  const handleCopy = () => {
    if (questionData?.question) {
      navigator.clipboard.writeText(questionData.question);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-box position-relative overflow-hidden mb-4">
      {/* Top Bar */}
      <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom border-secondary">
        <div className="d-flex align-items-center gap-3">
          <div className="p-2.5 rounded-3 bg-orange-glow">
            <i className="bi bi-file-earmark-code-fill fs-4 text-orange-bright"></i>
          </div>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h4 className="fw-bold text-white mb-0 font-mono">
                {questionData?.is_assessment ? `Assessment Challenge` : `Practice Problem`}
              </h4>
              <span className={`badge ${diffInfo.class} px-2.5 py-1 rounded-2 font-mono small fw-bold`}>
                {diffInfo.label} ({difficulty})
              </span>
            </div>
            <small className="text-offwhite font-mono fw-semibold" style={{ fontSize: '0.82rem' }}>
              Platform Difficulty Rating: <strong className="text-white">{difficulty} ELO</strong>
            </small>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            onClick={handleCopy}
            className="btn btn-sm btn-outline-secondary text-offwhite d-flex align-items-center gap-1.5 font-mono px-3 py-1.5"
            title="Copy Problem Statement"
          >
            <i className={`bi ${copied ? 'bi-check-lg text-success' : 'bi-clipboard'}`}></i>
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="btn btn-sm btn-outline-orange text-orange font-mono d-flex align-items-center gap-1.5 px-3 py-1.5"
          >
            <i className={`bi bi-arrow-clockwise ${loading ? 'spin' : ''}`}></i>
            Get New Question
          </button>
        </div>
      </div>

      {/* Goal 4: Question Loading Bar */}
      {loading ? (
        <div className="py-5 px-3">
          <div className="d-flex justify-content-between align-items-center mb-2 font-mono">
            <span className="text-orange fs-6 fw-semibold">
              <i className="bi bi-cpu me-2"></i>
              {loadingText}
            </span>
            <span className="fw-bold text-white fs-6">{progress}%</span>
          </div>

          <div className="loading-bar-container">
            <div className="loading-bar-fill" style={{ width: `${progress}%` }}>
              <div className="loading-bar-pulse"></div>
            </div>
          </div>
          <p className="text-offwhite small mt-3 mb-0 text-center font-mono fw-semibold">
            Compiling problem AST and adjusting difficulty to your ELO level...
          </p>
        </div>
      ) : (
        /* Goal 5: Visually Appealing Text Box for Questions */
        <div className="question-container">
          {/* Sub Navigation Tabs */}
          <ul className="nav nav-tabs border-secondary mb-3">
            <li className="nav-item">
              <button
                className={`nav-link text-uppercase font-mono small fw-bold border-0 px-3 py-2 ${activeTab === 'description' ? 'active bg-transparent text-orange border-bottom border-2 border-orange' : 'text-offwhite'}`}
                onClick={() => setActiveTab('description')}
              >
                📄 Description
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link text-uppercase font-mono small fw-bold border-0 px-3 py-2 ${activeTab === 'examples' ? 'active bg-transparent text-orange border-bottom border-2 border-orange' : 'text-offwhite'}`}
                onClick={() => setActiveTab('examples')}
              >
                💡 Example Test Cases
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link text-uppercase font-mono small fw-bold border-0 px-3 py-2 ${activeTab === 'constraints' ? 'active bg-transparent text-orange border-bottom border-2 border-orange' : 'text-offwhite'}`}
                onClick={() => setActiveTab('constraints')}
              >
                ⚠️ Constraints
              </button>
            </li>
          </ul>

          {/* Tab Contents */}
          {activeTab === 'description' && (
            <div className="question-body">
              <div className="p-3.5 bg-dark rounded-3 border border-secondary mb-3">
                <p className="fs-5 text-white mb-0 fw-medium" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.75' }}>
                  {questionData?.question || "Write a function `find_max(numbers)` that returns the largest number in a list."}
                </p>
              </div>

              <div className="d-flex align-items-center gap-2 mt-3 pt-2.5 border-top border-secondary-subtle">
                <span className="badge bg-dark border border-secondary text-offwhite font-mono px-2.5 py-1">Topic: Python Algorithms</span>
                <span className="badge bg-dark border border-secondary text-offwhite font-mono px-2.5 py-1">Time: O(N)</span>
                <span className="badge bg-dark border border-secondary text-offwhite font-mono px-2.5 py-1">Space: O(1)</span>
              </div>
            </div>
          )}

          {activeTab === 'examples' && (
            <div className="question-body">
              <h6 className="fw-bold text-orange font-mono mb-2">Example 1:</h6>
              <div className="question-example-box">
                <div><strong className="text-white">Input:</strong> numbers = [3, 1, 4, 1, 5, 9, 2, 6]</div>
                <div><strong className="text-white">Output:</strong> 9</div>
                <div><strong className="text-white">Explanation:</strong> 9 is the maximum value in the array.</div>
              </div>

              <h6 className="fw-bold text-orange font-mono mb-2">Example 2:</h6>
              <div className="question-example-box">
                <div><strong className="text-white">Input:</strong> numbers = [-5, -1, -10]</div>
                <div><strong className="text-white">Output:</strong> -1</div>
                <div><strong className="text-white">Explanation:</strong> All numbers are negative; -1 is the largest.</div>
              </div>
            </div>
          )}

          {activeTab === 'constraints' && (
            <div className="question-body font-mono">
              <div className="p-3 bg-dark rounded-3 border border-secondary">
                <h6 className="fw-bold text-orange mb-3">Problem Constraints & Boundary Conditions:</h6>
                <ul className="list-unstyled mb-0 text-offwhite">
                  <li className="mb-2.5 d-flex align-items-center gap-2">
                    <span className="text-orange fw-bold">🔹</span>
                    <span>Array length bounds: <code>1 &lt;= len(numbers) &lt;= 10^5</code></span>
                  </li>
                  <li className="mb-2.5 d-flex align-items-center gap-2">
                    <span className="text-orange fw-bold">🔹</span>
                    <span>Element value range: <code>-10^9 &lt;= numbers[i] &lt;= 10^9</code></span>
                  </li>
                  <li className="mb-1 d-flex align-items-center gap-2">
                    <span className="text-orange fw-bold">🔹</span>
                    <span>Return value: Must be an integer or float representing the maximum element in `numbers`.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionCard;
