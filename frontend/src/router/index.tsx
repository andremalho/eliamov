import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, getHomeRoute } from '../contexts/AuthContext';
import { PrivateRoute, OnboardingRoute, FemaleRoute, RoleRoute, IncompleteRoute } from './guards';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Onboarding from '../pages/Onboarding';
import NewOnboarding from '../pages/Onboarding2';
import Dashboard from '../pages/Dashboard';
import Cycle from '../pages/Cycle';
import Mood from '../pages/Mood';
import Training from '../pages/Training';
import Nutrition from '../pages/Nutrition';
import Wearables from '../pages/Wearables';
import Glucometer from '../pages/Glucometer';
import BloodPressure from '../pages/BloodPressure';
import Insights from '../pages/Insights';
import LabExams from '../pages/LabExams';
import Appointments from '../pages/Appointments';
import Content from '../pages/Content';
import Courses from '../pages/Courses';
import Marketplace from '../pages/Marketplace';
import Profile from '../pages/Profile';
import AdminPanel from '../pages/Admin';
import TrainerPanel from '../pages/Trainer';
import Community from '../pages/Community';
import Chat from '../pages/Chat';
import Communities from '../pages/Communities';
import Activities from '../pages/Activities';
import Feed from '../pages/Feed';
import Challenges from '../pages/Challenges';
import Leaderboard from '../pages/Leaderboard';
import FemaleHome from '../pages/Home';
import Companion from '../pages/Companion';
import Evolution from '../pages/Evolution';
import WeightLoss from '../pages/WeightLoss';
import LabAnalysis from '../pages/LabAnalysis';
import AthleteDashboard from '../pages/AthleteDashboard';
import Pregnancy from '../pages/Pregnancy';
import Menopause from '../pages/Menopause';
import MentalHealth from '../pages/MentalHealth';
import Fertility from '../pages/Fertility';
import Teleconsult from '../pages/Teleconsult';
import Landing from '../pages/Landing';
import NotFound from '../pages/NotFound';

function SmartRedirect() {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="centered-screen"><p className="muted">Carregando...</p></div>;
  if (!currentUser) return <Landing />;
  return <Navigate to={getHomeRoute(currentUser)} replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/landing" element={<Landing />} />

      {/* Smart redirect */}
      <Route path="/" element={<SmartRedirect />} />

      {/* Onboarding (logged in, profile incomplete) */}
      <Route path="/onboarding-flow" element={<IncompleteRoute><NewOnboarding /></IncompleteRoute>} />
      <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />

      {/* Female zone */}
      <Route path="/home" element={<FemaleRoute><FemaleHome /></FemaleRoute>} />
      <Route path="/feed" element={<FemaleRoute><Feed /></FemaleRoute>} />
      <Route path="/cycle" element={<FemaleRoute><Cycle /></FemaleRoute>} />
      <Route path="/mood" element={<FemaleRoute><Mood /></FemaleRoute>} />
      <Route path="/communities" element={<FemaleRoute><Communities /></FemaleRoute>} />
      <Route path="/community" element={<FemaleRoute><Community /></FemaleRoute>} />
      <Route path="/insights" element={<FemaleRoute><Insights /></FemaleRoute>} />
      <Route path="/activities" element={<FemaleRoute><Activities /></FemaleRoute>} />
      <Route path="/training" element={<FemaleRoute><Training /></FemaleRoute>} />
      <Route path="/nutrition" element={<FemaleRoute><Nutrition /></FemaleRoute>} />
      <Route path="/wearables" element={<FemaleRoute><Wearables /></FemaleRoute>} />
      <Route path="/glucometer" element={<FemaleRoute><Glucometer /></FemaleRoute>} />
      <Route path="/blood-pressure" element={<FemaleRoute><BloodPressure /></FemaleRoute>} />
      <Route path="/lab-exams" element={<FemaleRoute><LabExams /></FemaleRoute>} />
      <Route path="/appointments" element={<FemaleRoute><Appointments /></FemaleRoute>} />
      <Route path="/challenges" element={<FemaleRoute><Challenges /></FemaleRoute>} />
      <Route path="/leaderboard" element={<FemaleRoute><Leaderboard /></FemaleRoute>} />
      <Route path="/chat" element={<FemaleRoute><Chat /></FemaleRoute>} />
      <Route path="/evolution" element={<FemaleRoute><Evolution /></FemaleRoute>} />
      <Route path="/weight-loss" element={<FemaleRoute><WeightLoss /></FemaleRoute>} />
      <Route path="/lab-analysis" element={<FemaleRoute><LabAnalysis /></FemaleRoute>} />
      <Route path="/athlete" element={<FemaleRoute><AthleteDashboard /></FemaleRoute>} />
      <Route path="/pregnancy" element={<FemaleRoute><Pregnancy /></FemaleRoute>} />
      <Route path="/menopause" element={<FemaleRoute><Menopause /></FemaleRoute>} />
      <Route path="/mental-health" element={<FemaleRoute><MentalHealth /></FemaleRoute>} />
      <Route path="/fertility" element={<FemaleRoute><Fertility /></FemaleRoute>} />
      <Route path="/teleconsult" element={<FemaleRoute><Teleconsult /></FemaleRoute>} />

      {/* Trainer zone */}
      <Route path="/trainer" element={<RoleRoute roles={['personal_trainer', 'professional']}><TrainerPanel /></RoleRoute>} />

      {/* Admin zone */}
      <Route path="/admin" element={<RoleRoute roles={['academy_admin', 'academy_manager', 'super_admin', 'admin', 'tenant_admin']}><AdminPanel /></RoleRoute>} />

      {/* Companion zone */}
      <Route path="/companion" element={<RoleRoute roles={['family_companion']}><Companion /></RoleRoute>} />

      {/* Shared routes (all authenticated with complete profile) */}
      <Route path="/profile" element={<OnboardingRoute><Profile /></OnboardingRoute>} />
      <Route path="/content" element={<OnboardingRoute><Content /></OnboardingRoute>} />
      <Route path="/courses" element={<OnboardingRoute><Courses /></OnboardingRoute>} />
      <Route path="/marketplace" element={<OnboardingRoute><Marketplace /></OnboardingRoute>} />
      <Route path="/dashboard" element={<Navigate to="/home" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
