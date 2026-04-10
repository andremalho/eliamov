import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Cycle from './pages/Cycle';
import Mood from './pages/Mood';
import Training from './pages/Training';
import Nutrition from './pages/Nutrition';
import Wearables from './pages/Wearables';
import Glucometer from './pages/Glucometer';
import BloodPressure from './pages/BloodPressure';
import Insights from './pages/Insights';
import LabExams from './pages/LabExams';
import Appointments from './pages/Appointments';
import Content from './pages/Content';
import Courses from './pages/Courses';
import Marketplace from './pages/Marketplace';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import Community from './pages/Community';
import Chat from './pages/Chat';
import Communities from './pages/Communities';
import Activities from './pages/Activities';
import Feed from './pages/Feed';
import Challenges from './pages/Challenges';
import NotFound from './pages/NotFound';

const protect = (el: React.ReactNode) => <ProtectedRoute>{el}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={protect(<Dashboard />)} />
      <Route path="/onboarding" element={protect(<Onboarding />)} />
      <Route path="/cycle" element={protect(<Cycle />)} />
      <Route path="/mood" element={protect(<Mood />)} />
      <Route path="/activities" element={protect(<Activities />)} />
      <Route path="/training" element={protect(<Training />)} />
      <Route path="/nutrition" element={protect(<Nutrition />)} />
      <Route path="/wearables" element={protect(<Wearables />)} />
      <Route path="/glucometer" element={protect(<Glucometer />)} />
      <Route path="/blood-pressure" element={protect(<BloodPressure />)} />
      <Route path="/insights" element={protect(<Insights />)} />
      <Route path="/lab-exams" element={protect(<LabExams />)} />
      <Route path="/appointments" element={protect(<Appointments />)} />
      <Route path="/content" element={protect(<Content />)} />
      <Route path="/courses" element={protect(<Courses />)} />
      <Route path="/marketplace" element={protect(<Marketplace />)} />
      <Route path="/profile" element={protect(<Profile />)} />
      <Route path="/community" element={protect(<Community />)} />
      <Route path="/feed" element={protect(<Feed />)} />
      <Route path="/challenges" element={protect(<Challenges />)} />
      <Route path="/communities" element={protect(<Communities />)} />
      <Route path="/chat" element={protect(<Chat />)} />
      <Route path="/admin" element={protect(<Admin />)} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
