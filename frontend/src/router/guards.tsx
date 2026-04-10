import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, isProfileComplete, getHomeRoute } from '../contexts/AuthContext';

/** Redirects to /login if not authenticated */
export const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="centered-screen"><p className="muted">Carregando...</p></div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

/** Redirects to /onboarding-flow if profile not complete */
export const OnboardingRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="centered-screen"><p className="muted">Carregando...</p></div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isProfileComplete(currentUser)) return <Navigate to="/onboarding-flow" replace />;
  return <>{children}</>;
};

/** Checks role is female_user / user, otherwise redirects to correct home */
export const FemaleRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading, isFemaleZone } = useAuth();
  if (loading) return <div className="centered-screen"><p className="muted">Carregando...</p></div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isProfileComplete(currentUser)) return <Navigate to="/onboarding-flow" replace />;
  if (!isFemaleZone()) return <Navigate to={getHomeRoute(currentUser)} replace />;
  return <>{children}</>;
};

/** Checks if role is in the allowed list */
export const RoleRoute: React.FC<{ roles: string[]; children: React.ReactNode }> = ({ roles, children }) => {
  const { currentUser, loading, isRole } = useAuth();
  if (loading) return <div className="centered-screen"><p className="muted">Carregando...</p></div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (!isProfileComplete(currentUser)) return <Navigate to="/onboarding-flow" replace />;
  if (!isRole(...roles)) return <Navigate to={getHomeRoute(currentUser)} replace />;
  return <>{children}</>;
};

/** For onboarding pages: must be logged in but NOT have completed profile */
export const IncompleteRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="centered-screen"><p className="muted">Carregando...</p></div>;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (isProfileComplete(currentUser)) return <Navigate to={getHomeRoute(currentUser)} replace />;
  return <>{children}</>;
};
