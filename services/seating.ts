import { SeatingResult } from '../types';
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

export const fetchSeatingApi = async (examId: string): Promise<SeatingResult> => {
  const res = await fetch(`${API_BASE}/api/seating/${examId}`, {
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const saveSeatingApi = async (seating: SeatingResult) => {
  const res = await fetch(`${API_BASE}/api/seating`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(seating),
  });
  return handleResponse(res);
};
