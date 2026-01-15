import { Admin } from '../types';
import { getSession } from './auth';

import { API_BASE_URL } from './config';

const API_BASE = API_BASE_URL;

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

export const saveAdminApi = async (admin: Partial<Admin>) => {
  const res = await fetch(`${API_BASE}/api/admins`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(admin),
  });
  return handleResponse(res);
};
