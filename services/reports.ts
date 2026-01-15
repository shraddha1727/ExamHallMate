import { Report } from '../types';
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

export const fetchReportsApi = async (): Promise<Report[]> => {
  const res = await fetch(`${API_BASE}/api/reports`, {
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const resolveReportApi = async (id: string) => {
  const res = await fetch(`${API_BASE}/api/reports/${id}/resolve`, {
    method: 'POST',
    headers: getHeaders(),
  });
  return handleResponse(res);
};
