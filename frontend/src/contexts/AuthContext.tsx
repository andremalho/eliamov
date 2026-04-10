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
}

export const isProfileComplete = (user: User | null) =>
  !!(user && user.onboardingCompletedAt);

interface AuthContextValue {
  currentUser: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, profileType?: string, academyCode?: string) => Promise<void>;
  logout: () => void;
  setCurrentUser: (user: User) => void;
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

  const login = async (email: string, password: string) => {
    const res = await api.post<{ access_token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    persistAuth(res.data.access_token, res.data.user);
  };

  const register = async (name: string, email: string, password: string, profileType?: string, academyCode?: string) => {
    const res = await api.post<{ access_token: string; user: User }>('/auth/register', {
      name,
      email,
      password,
      ...(profileType && { profileType }),
      ...(academyCode && { academyCode }),
    });
    persistAuth(res.data.access_token, res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('eliamov_token');
    setToken(null);
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, token, loading, login, register, logout, setCurrentUser }}
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
