import { Student } from '../types';
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

export const fetchStudentStatsApi = async (): Promise<any[]> => {
  const res = await fetch(`${API_BASE}/api/students/stats`, {
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const fetchStudentsAllApi = async (): Promise<Student[]> => {
  const res = await fetch(`${API_BASE}/api/students/all`, {
    headers: getHeaders()
  });
  return handleResponse(res);
};

export const fetchPaginatedStudentsApi = async (
  branch: string,
  semester: string,
  page: number,
  searchTerm: string
): Promise<{ students: Student[], totalPages: number, totalRecords: number }> => {
  const params = new URLSearchParams({
    branch,
    semester,
    page: page.toString(),
    limit: '10',
    searchTerm,
  });
  const res = await fetch(`${API_BASE}/api/students?${params.toString()}`, {
    headers: getHeaders()
  });
  return handleResponse(res);
};


export const bulkUpsertStudentsApi = async (students: Student[]) => {
  const res = await fetch(`${API_BASE}/api/students/bulk`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ students }),
  });
  return handleResponse(res);
};

export const clearStudentsApi = async () => {
  const res = await fetch(`${API_BASE}/api/students`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return handleResponse(res);
};

