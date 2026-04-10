import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  role: string;
  birthDate?: string | null;
  weight?: number | null;
  height?: number | null;
  healthConditions?: string[] | null;
  fitnessLevel?: 'sedentary' | 'beginner' | 'intermediate' | 'advanced' | null;
  fitnessGoal?:
    | 'weight_loss'
    | 'health'
    | 'strength'
    | 'wellbeing'
    | 'pregnancy'
    | 'bone_health'
    | null;
  profile?: Record<string, any> | null;
  onboardingCompletedAt?: string | null;
  profileType?: 'full' | 'trainer' | 'companion' | 'admin' | null;
  isProfileComplete?: boolean;
  onboardingStep?: number;
  gender?: string | null;
}

export const isProfileComplete = (user: User | null) =>
  !!(user && (user.isProfileComplete || user.onboardingCompletedAt));

export function getHomeRoute(user: User | null): string {
  if (!user) return '/login';
  if (!isProfileComplete(user)) return '/onboarding-flow';
  const role = user.role;
  if (role === 'female_user' || role === 'user') return '/home';
  if (role === 'personal_trainer' || role === 'professional') return '/trainer';
  if (
    role === 'academy_admin' ||
    role === 'tenant_admin' ||
    role === 'academy_manager' ||
    role === 'super_admin' ||
    role === 'admin'
  )
    return '/admin';
  if (role === 'family_companion') return '/companion';
  return '/home';
}

interface AuthContextValue {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, profileType?: string, academyCode?: string) => Promise<User>;
  logout: () => void;
  setCurrentUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  isRole: (...roles: string[]) => boolean;
  isFemaleZone: () => boolean;
  getHomeRoute: () => string;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('eliamov_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get<User>('/auth/me');
        if (!cancelled) setCurrentUser(res.data);
      } catch {
        if (!cancelled) {
          localStorage.removeItem('eliamov_token');
          setToken(null);
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    hydrate();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const persistAuth = (accessToken: string, user: User) => {
    localStorage.setItem('eliamov_token', accessToken);
    setToken(accessToken);
    setCurrentUser(user);
  };

  const login = async (email: string, password: string): Promise<User> => {
    const res = await api.post<{ access_token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    persistAuth(res.data.access_token, res.data.user);
    return res.data.user;
  };

  const register = async (name: string, email: string, password: string, profileType?: string, academyCode?: string): Promise<User> => {
    const res = await api.post<{ access_token: string; user: User }>('/auth/register', {
      name,
      email,
      password,
      ...(profileType && { profileType }),
      ...(academyCode && { academyCode }),
    });
    persistAuth(res.data.access_token, res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('eliamov_token');
    setToken(null);
    setCurrentUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get<User>('/auth/me');
      setCurrentUser(res.data);
    } catch {
      logout();
    }
  };

  const isRole = (...roles: string[]) => {
    if (!currentUser) return false;
    return roles.includes(currentUser.role);
  };

  const isFemaleZone = () => isRole('female_user', 'user');

  const getHomeRouteForUser = () => getHomeRoute(currentUser);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        token,
        loading,
        login,
        register,
        logout,
        setCurrentUser,
        refreshUser,
        isRole,
        isFemaleZone,
        getHomeRoute: getHomeRouteForUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
