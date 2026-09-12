import React from 'react';

const TestResults = ({ result, loading }) => {
  if (loading) {
    return (
      <div className="rounded-box text-center py-5 font-mono">
        <div className="spinner-border text-warning mb-3" role="status"></div>
        <h5 className="text-white">Evaluating Code Against Test Matrix...</h5>
        <p className="text-muted mb-0">Executing sandboxed unit tests and AI complexity validation...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-box font-mono">
        <h4 className="fw-bold text-white mb-2">🧪 Test Execution Results</h4>
        <p className="text-muted mb-0">Write and submit your solution above to execute unit tests and view complexity feedback.</p>
      </div>
    );
  }

  const passed = result.passed;
  const passedCnt = result.passed_count || 0;
  const totalCnt = result.total_count || 0;
  const testResults = result.test_results || [];
  const aiAnalysis = result.ai_analysis;

  return (
    <div className="rounded-box font-mono">
      <h4 className="fw-bold text-white mb-3">🧪 Test Execution Results & ELO Update</h4>

      {passed ? (
        <div className="alert alert-success border-success bg-dark text-success py-3 rounded-3 mb-4">
          <h5 className="fw-bold mb-1">🎉 All {totalCnt} Test Cases Passed!</h5>
          <p className="mb-0">Updated ELO Rating: <strong className="text-white">{result.new_rank}</strong>. Solution record saved to database.</p>
        </div>
      ) : (
        <div className="alert alert-danger border-danger bg-dark text-danger py-3 rounded-3 mb-4">
          <h5 className="fw-bold mb-1">❌ Submission Failed: Passed {passedCnt}/{totalCnt} Test Cases</h5>
          <p className="mb-0">Current ELO Rating: <strong className="text-white">{result.new_rank}</strong>. Review test outputs below.</p>
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
                    <span className="fw-bold text-white">Test Case #{tc.test_number}</span>
                    <span className={`badge ${tc.passed ? 'bg-success' : 'bg-danger'} px-2.5 py-1`}>
                      {tc.passed ? '✅ PASSED' : '❌ FAILED'}
                    </span>
                  </div>

                  <div className="row g-2">
                    <div className="col-md-4">
                      <small className="text-muted d-block">Input:</small>
                      <pre className="bg-dark p-2 rounded text-orange mb-0 border border-secondary small">
                        {tc.input}
                      </pre>
                    </div>
                    <div className="col-md-4">
                      <small className="text-muted d-block">Expected Output:</small>
                      <pre className="bg-dark p-2 rounded text-white mb-0 border border-secondary small">
                        {tc.expected}
                      </pre>
                    </div>
                    <div className="col-md-4">
                      <small className="text-muted d-block">Actual Output:</small>
                      <pre className={`p-2 rounded mb-0 border small ${tc.passed ? 'bg-dark text-success border-success' : 'bg-dark text-danger border-danger'}`}>
                        {tc.actual}
                      </pre>
                    </div>
                  </div>

                  {tc.error && (
                    <div className="alert alert-warning py-1.5 px-3 mt-2 mb-0 small text-warning border-warning bg-dark">
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
          <div className="accordion-item bg-dark border-secondary">
            <h2 className="accordion-header">
              <button
                className="accordion-button collapsed text-orange bg-dark font-mono"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseAI"
              >
                🤖 AI Complexity Analysis & Optimization Suggestions
              </button>
            </h2>
            <div id="collapseAI" className="accordion-collapse collapse" data-bs-parent="#aiAnalysisAccordion">
              <div className="accordion-body bg-dark text-white font-mono" style={{ whiteSpace: 'pre-wrap' }}>
                {typeof aiAnalysis === 'string' ? aiAnalysis : JSON.stringify(aiAnalysis, null, 2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResults;
