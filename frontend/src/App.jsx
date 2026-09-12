import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginLanding from './components/LoginLanding';
import StartTestLanding from './components/StartTestLanding';
import Workspace from './components/Workspace';
import AdminDashboard from './components/AdminDashboard';
import UserProfilePage from './components/UserProfilePage';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const MainContent = () => {
  const { user, screen, setScreen } = useAuth();
  const [activeAssessment, setActiveAssessment] = useState(null);

  const handleStartAssessment = (assessmentData) => {
    setActiveAssessment(assessmentData);
    setScreen('workspace');
  };

  if (!user || screen === 'login') {
    return <LoginLanding />;
  }

  return (
    <div className="container-fluid p-0 main-container">
      <div className="row g-0 min-vh-100">
        <div className="col-lg-3 col-xl-2.5">
          <Sidebar />
        </div>
        <div className="col-lg-9 col-xl-9.5 p-3 p-md-4">
          {screen === 'admin' && <AdminDashboard />}
          {screen === 'profile' && <UserProfilePage />}
          {screen === 'start_test' && <StartTestLanding onStartAssessment={handleStartAssessment} />}
          {screen === 'workspace' && <Workspace activeAssessment={activeAssessment} />}
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}

export default App;
