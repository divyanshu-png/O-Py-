import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import QuestionCard from './QuestionCard';
import TestResults from './TestResults';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { animate } from 'animejs';

const defaultPythonCode = `def find_max(numbers):
    # Write your solution here
    return max(numbers)
`;

const Workspace = ({ activeAssessment }) => {
  const { user, setScreen, refreshProfile } = useAuth();
  const [questionData, setQuestionData] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [code, setCode] = useState(defaultPythonCode);
  const [submitting, setSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const containerRef = useRef(null);

  const fetchQuestion = async () => {
    if (activeAssessment) {
      setQuestionData({
        question: `[Assigned Assessment: ${activeAssessment.title}]\n\n${activeAssessment.problem_description}`,
        difficulty: activeAssessment.difficulty || 1600,
        is_assessment: true,
        assessment_id: activeAssessment.id
      });
      setLoadingQuestion(false);
      return;
    }

    setLoadingQuestion(true);
    try {
      const res = await axios.get('/api/get-question/', {
        params: { user_id: user?.user_id }
      });
      if (res.data) {
        setQuestionData(res.data);
      }
    } catch (err) {
      setQuestionData({
        question: "Write a function `find_max(numbers)` that returns the largest number in a list.",
        difficulty: user?.rank || 1500
      });
    } finally {
      setLoadingQuestion(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
    if (containerRef.current) {
      animate(containerRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 700,
        ease: 'outCubic'
      });
    }
  }, [activeAssessment]);

  const handleSubmitCode = async () => {
    if (!code.trim()) return;
    setSubmitting(true);
    setTestResult(null);

    try {
      const payload = {
        user_id: user?.user_id,
        code: code,
        problem_id: activeAssessment ? `assessment_${activeAssessment.id}` : 'find_max_numbers',
        difficulty: questionData?.difficulty || user?.rank || 1500,
      };

      if (activeAssessment) {
        payload.assessment_id = activeAssessment.id;
      }

      const res = await axios.post('/api/submit-code/', payload);

      if (res.data) {
        setTestResult(res.data);
        if (res.data.passed) {
          refreshProfile();
        }
      }
    } catch (err) {
      setTestResult({
        passed: false,
        message: err.response?.data?.message || "Server connection error."
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={containerRef} className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-white mb-0">💻 Python Exercise Workspace</h2>
          <small className="text-secondary">
            {activeAssessment ? `Solving Assigned Assessment: ${activeAssessment.title}` : 'Solve Python challenges and receive AI-driven complexity feedback'}
          </small>
        </div>
        <button
          onClick={() => setScreen('start_test')}
          className="btn btn-outline-secondary text-light d-flex align-items-center gap-2 rounded-3"
        >
          <i className="bi bi-arrow-left"></i>
          Back to Dashboard
        </button>
      </div>

      <QuestionCard
        questionData={questionData}
        onRefresh={fetchQuestion}
        loading={loadingQuestion}
      />

      <div className="rounded-box mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="fw-bold text-white mb-0">
            <i className="bi bi-code-square me-2 text-purple-light"></i>
            Coding Area (Monaco Editor)
          </h4>
          <span className="badge bg-dark border border-secondary text-secondary px-3 py-1.5">
            Python 3.x
          </span>
        </div>

        <div className="border border-secondary rounded-3 overflow-hidden mb-3" style={{ height: '300px' }}>
          <Editor
            height="300px"
            defaultLanguage="python"
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || '')}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        <div className="d-flex justify-content-end">
          <button
            onClick={handleSubmitCode}
            disabled={submitting}
            className="btn btn-gradient-primary py-2.5 px-4 fs-6 fw-bold d-flex align-items-center gap-2"
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm"></span>
                Evaluating Submission...
              </>
            ) : (
              <>
                <i className="bi bi-play-fill fs-5"></i>
                Run & Submit Code
              </>
            )}
          </button>
        </div>
      </div>

      <TestResults result={testResult} loading={submitting} />
    </div>
  );
};

export default Workspace;
