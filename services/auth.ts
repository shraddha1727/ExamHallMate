import { API_BASE_URL } from './config';
import { UserRole } from '../types';

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

const SESSION_KEY = 'viva_session';
const KEYS = {
  CURRENT_USER_ID: 'viva_current_user_id',
  CURRENT_ROLE: 'viva_current_role'
};

export const login = async (email: string, password: string): Promise<{ success: boolean; user?: UserSession; error?: string }> => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      const user = data.user as UserSession;
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      if (user.role === 'SuperAdmin') {
        localStorage.setItem(KEYS.CURRENT_ROLE, 'SuperAdmin');
      } else {
        localStorage.setItem(KEYS.CURRENT_USER_ID, user.id);
        localStorage.setItem(KEYS.CURRENT_ROLE, 'Teacher');
      }
      return { success: true, user };
    } else {
      return { success: false, error: data.error || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Failed to login. Server may be down.' };
  }
};

export const logout = () => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(KEYS.CURRENT_ROLE);
  localStorage.removeItem(KEYS.CURRENT_USER_ID);
};

export const getSession = (): UserSession | null => {
  const data = localStorage.getItem(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem(SESSION_KEY);
};

export const getCurrentUser = (): string => {
  const session = getSession();
  if (session) {
    return session.id;
  }
  return localStorage.getItem(KEYS.CURRENT_USER_ID) || 'T001';
};

export const getCurrentRole = (): UserRole | null => {
  const session = getSession();
  if (session) {
    return session.role;
  }
  return (localStorage.getItem(KEYS.CURRENT_ROLE) as UserRole) || null;
};

