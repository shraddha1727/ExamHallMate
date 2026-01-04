import { Teacher } from '../types';
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

export const fetchTeachersApi = async (): Promise<Teacher[]> => {
  const res = await fetch(`${API_BASE}/api/teachers`, {
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const saveTeacherApi = async (teacher: Partial<Teacher>) => {
  const res = await fetch(`${API_BASE}/api/teachers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(teacher),
  });
  return handleResponse(res);
};

export const deleteTeacherApi = async (id: string) => {
  const res = await fetch(`${API_BASE}/api/teachers/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse(res);
};
