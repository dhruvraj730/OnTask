import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EmployerDashboard from './pages/EmployerDashboard';
import JobPostPage from './pages/JobPostPage';
import TaskerLanding from './pages/TaskerLanding';
import OrganizerLanding from './pages/OrganizerLanding';
import ProfilePage from './pages/ProfilePage';
import TaskerSearch from './pages/TaskerSearch';
import OrganizerTalentSearch from './pages/OrganizerTalentSearch';
import AIChatbot from './components/AIChatbot';
import MessagesPage from './pages/MessagesPage';
import PricingPage from './pages/PricingPage';
import TaskerDashboard from './pages/TaskerDashboard';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/tasker" element={<TaskerLanding />} />
            <Route path="/organizer" element={<OrganizerLanding />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/pro/dashboard" element={<EmployerDashboard />} />
            <Route path="/tasker/dashboard" element={<TaskerDashboard />} />
            <Route path="/pro/job/create" element={<JobPostPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/find-jobs" element={<TaskerSearch />} />
            <Route path="/find-talent" element={<OrganizerTalentSearch />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
          </Routes>
          <AIChatbot />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
