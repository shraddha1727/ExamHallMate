
export interface Student {
  enrollNo: string;
  name: string;
  branch: string;
  semester: string;
  batch: string;
}

export interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  isActive: boolean;
}

export interface Exam {
  id: string;
  subjectCode: string;
  subjectName: string;
  examDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  branch: string[]; // Array of branches e.g. ["CE", "IT"]
  semester: string;
}

export interface SeatAssignment {
  examId: string;
  studentId: string; // enrollNo
  studentName: string;
  branch: string;
  roomId: string;
  roomNumber: string;
  seatNumber: number;
  row: number;
  col: number;
  absent: boolean;
}

export interface SeatingResult {
  examId: string;
  assignments: SeatAssignment[];
  generatedAt: string;
}

export interface Teacher {
  _id?: string;
  id: string; // T001
  name: string;
  email: string;
  department: string;
  phone?: string;
  password: string; // Added password field, not optional
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'SuperAdmin';
}

export interface Invigilation {
  id: string;
  examId: string;
  roomId: string;
  teacherId: string;
  dutyType: 'Supervisor' | 'Assistant';
  assignedAt: string;
}

export interface Report {
  id: string;
  examId: string;
  roomId: string;
  teacherId: string;
  message: string;
  status: 'Open' | 'Resolved';
  createdAt: string;
}

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertMessage {
  type: AlertType;
  message: string;
}

export type UserRole = 'SuperAdmin' | 'Admin' | 'Teacher';
