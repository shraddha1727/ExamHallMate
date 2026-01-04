import { getSession } from './auth';

const API_BASE = '';

const getHeaders = () => {
  const session = getSession();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  
  if (session) {
    headers['x-user-id'] = session.id;
    headers['x-user-role'] = session.role;
  }
  
  return headers;
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
  return res.json();
};

export const registerApi = async (data: any, role: 'Admin' | 'Staff') => {
  const res = await fetch(`${API_BASE}/api/users/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...data, role }),
  });
  return handleResponse(res);
};

export const resetPasswordApi = async (data: any, role: 'Admin' | 'Staff') => {
  const res = await fetch(`${API_BASE}/api/users/reset-password`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ ...data, role }),
  });
  return handleResponse(res);
};
