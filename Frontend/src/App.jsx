import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/Header';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EmployerDashboard from './pages/EmployerDashboard';
import JobPostPage from './pages/JobPostPage';
import TaskerLanding from './pages/TaskerLanding';
import OrganizerLanding from './pages/OrganizerLanding';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import MyJobsPage from './pages/MyJobsPage';
import TaskerSearch from './pages/TaskerSearch';
import OrganizerTalentSearch from './pages/OrganizerTalentSearch';

import MessagesPage from './pages/MessagesPage';
import PricingPage from './pages/PricingPage';
import TaskerDashboard from './pages/TaskerDashboard';
import FreelancerSignup from './pages/FreelancerSignup';
import OrganizerSignup from './pages/OrganizerSignup';
import MyApplicationsPage from './pages/MyApplicationsPage';
import EarningsPage from './pages/EarningsPage';
import JobApplicationsPage from './pages/JobApplicationsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Header />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/tasker" element={<TaskerLanding />} />
            <Route path="/organizer" element={<OrganizerLanding />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/signup/freelancer" element={<FreelancerSignup />} />
            <Route path="/signup/organizer" element={<OrganizerSignup />} />
            <Route path="/pro/dashboard" element={<EmployerDashboard />} />
            <Route path="/tasker/dashboard" element={<TaskerDashboard />} />
            <Route path="/pro/job/create" element={<JobPostPage />} />
            <Route path="/pro/job/:id/applications" element={<JobApplicationsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:id" element={<PublicProfilePage />} />
            <Route path="/my-jobs" element={<MyJobsPage />} />
            <Route path="/find-jobs" element={<TaskerSearch />} />
            <Route path="/find-talent" element={<OrganizerTalentSearch />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/applications" element={<MyApplicationsPage />} />
            <Route path="/earnings" element={<EarningsPage />} />
            <Route path="/project/:id" element={<ProjectDetailPage />} />
          </Routes>

        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
