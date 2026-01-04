import { Invigilation } from '../types';
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
    try {
      const err = await res.json();
      if (err && err.error) {
        throw new Error(err.error);
      }
    } catch (e) {
      // Ignore parsing errors, throw the status text
    }
    throw new Error(res.statusText);
  }
  return res.json();
};

export const fetchInvigilationsApi = async (): Promise<Invigilation[]> => {
  const res = await fetch(`${API_BASE}/api/invigilations`, {
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const assignInvigilatorApi = async (invigilation: Invigilation) => {
  const res = await fetch(`${API_BASE}/api/invigilations`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(invigilation),
  });
  return handleResponse(res);
};

export const bulkSaveInvigilationsApi = async (assignments: Invigilation[]) => {
    const res = await fetch(`${API_BASE}/api/invigilations/bulk`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ assignments }),
    });
    return handleResponse(res);
};

export const clearInvigilationsApi = async () => {
    const res = await fetch(`${API_BASE}/api/invigilations`, {
        method: 'DELETE',
        headers: getHeaders(),
    });
    return handleResponse(res);
};