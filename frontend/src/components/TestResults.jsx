import React from 'react';

const TestResults = ({ result, loading }) => {
  if (loading) {
    return (
      <div className="rounded-box text-center py-5">
        <div className="spinner-border text-purple mb-3" role="status"></div>
        <h5 className="text-white">Evaluating Code Against Hidden Test Cases...</h5>
        <p className="text-secondary mb-0">AI analysis and unit test validation in progress...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-box">
        <h4 className="fw-bold text-white mb-2">🧪 Test Execution Results & Database Record</h4>
        <p className="text-secondary mb-0">Execute your code to submit and view test output.</p>
      </div>
    );
  }

  const passed = result.passed;
  const passedCnt = result.passed_count || 0;
  const totalCnt = result.total_count || 0;
  const testResults = result.test_results || [];
  const aiAnalysis = result.ai_analysis;

  return (
    <div className="rounded-box">
      <h4 className="fw-bold text-white mb-3">🧪 Test Execution Results & Database Record</h4>

      {passed ? (
        <div className="alert alert-success border-success-subtle bg-success-subtle text-success py-3 rounded-3 mb-4">
          <h5 className="fw-bold mb-1">🎉 All {totalCnt} Test Cases Passed!</h5>
          <p className="mb-0">New ELO Rank: <strong>{result.new_rank}</strong>. Solution recorded in database!</p>
        </div>
      ) : (
        <div className="alert alert-danger border-danger-subtle bg-danger-subtle text-danger py-3 rounded-3 mb-4">
          <h5 className="fw-bold mb-1">❌ Submission Failed: Passed {passedCnt}/{totalCnt} Test Cases</h5>
          <p className="mb-0">Current Rank: <strong>{result.new_rank}</strong>. Check your logic and re-try.</p>
        </div>
      )}

      {testResults.length > 0 && (
        <div className="mb-4">
          <h5 className="fw-bold text-white mb-3">📋 Test Case Details</h5>
          <div className="row g-3">
            {testResults.map((tc) => (
              <div className="col-12" key={tc.test_number}>
                <div className={`p-3 rounded-3 border ${tc.passed ? 'border-success bg-dark' : 'border-danger bg-dark'}`}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold text-white">Test #{tc.test_number}</span>
                    <span className={`badge ${tc.passed ? 'bg-success' : 'bg-danger'} px-2.5 py-1`}>
                      {tc.passed ? '✅ PASSED' : '❌ FAILED'}
                    </span>
                  </div>

                  <div className="row g-2">
                    <div className="col-md-4">
                      <small className="text-secondary d-block">Input:</small>
                      <pre className="bg-body-tertiary p-2 rounded text-light mb-0 border border-secondary small">
                        {tc.input}
                      </pre>
                    </div>
                    <div className="col-md-4">
                      <small className="text-secondary d-block">Expected Output:</small>
                      <pre className="bg-body-tertiary p-2 rounded text-light mb-0 border border-secondary small">
                        {tc.expected}
                      </pre>
                    </div>
                    <div className="col-md-4">
                      <small className="text-secondary d-block">Actual Output:</small>
                      <pre className={`p-2 rounded mb-0 border small ${tc.passed ? 'bg-body-tertiary text-success border-success' : 'bg-body-tertiary text-danger border-danger'}`}>
                        {tc.actual}
                      </pre>
                    </div>
                  </div>

                  {tc.error && (
                    <div className="alert alert-warning py-1.5 px-3 mt-2 mb-0 small text-warning border-warning">
                      <i className="bi bi-exclamation-triangle me-1"></i>
                      {tc.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {aiAnalysis && (
        <div className="accordion mt-3" id="aiAnalysisAccordion">
          <div className="accordion-item">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseAI"
              >
                🤖 View AI Code Feedback & Complexity Analysis
              </button>
            </h2>
            <div id="collapseAI" className="accordion-collapse collapse" data-bs-parent="#aiAnalysisAccordion">
              <div className="accordion-body bg-dark text-white" style={{ whiteSpace: 'pre-wrap' }}>
                {aiAnalysis.summary || "No AI feedback available."}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResults;
