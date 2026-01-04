import { Student, Room, Exam, Invigilation, UserRole } from '../types';

const KEYS = {
  INIT: 'viva_init_v4', // Updated version to force refresh
  CURRENT_ROLE: 'viva_current_role',
};

// --- DEMO DATA ---
const DEMO_ROOMS: Room[] = [
  { id: 'r1', roomNumber: 'A101', capacity: 40, isActive: true },
  { id: 'r2', roomNumber: 'A102', capacity: 32, isActive: true },
  { id: 'r3', roomNumber: 'B201', capacity: 50, isActive: true },
  { id: 'r4', roomNumber: 'B202', capacity: 48, isActive: true }
];

const DEMO_STUDENTS: Student[] = [
  { enrollNo: 'DIP1001', name: 'Aryan Maurya', branch: 'CO', semester: '3', batch: 'Diploma' },
  { enrollNo: 'DIP1002', name: 'Pranay Sapkal', branch: 'CO', semester: '3', batch: 'Diploma' },
  { enrollNo: 'DIP1003', name: 'Rohan Patil', branch: 'CO', semester: '3', batch: 'Diploma' },
  { enrollNo: 'DIP1004', name: 'Krisha Jain', branch: 'CO', semester: '3', batch: 'Diploma' },
  { enrollNo: 'DIP2001', name: 'Sakshi Nair', branch: 'CE', semester: '5', batch: 'Diploma' },
  { enrollNo: 'DIP2002', name: 'Rajesh Gupta', branch: 'CE', semester: '5', batch: 'Diploma' },
  { enrollNo: 'ENG3001', name: 'Shreya Singh', branch: 'IT', semester: '5', batch: 'Engineering' },
  { enrollNo: 'ENG3002', name: 'Manav Shah', branch: 'IT', semester: '5', batch: 'Engineering' },
  // New CO Sem 6 Students
  { enrollNo: 'DIP6001', name: 'Aditya Rane', branch: 'CO', semester: '6', batch: 'Diploma' },
  { enrollNo: 'DIP6002', name: 'Soham Kulkarni', branch: 'CO', semester: '6', batch: 'Diploma' },
  { enrollNo: 'DIP6003', name: 'Vedika Pawar', branch: 'CO', semester: '6', batch: 'Diploma' },
  { enrollNo: 'DIP6004', name: 'Neha Shinde', branch: 'CO', semester: '6', batch: 'Diploma' },
  { enrollNo: 'DIP6005', name: 'Omkar Deshmukh', branch: 'CO', semester: '6', batch: 'Diploma' },
  { enrollNo: 'DIP6006', name: 'Tanvi More', branch: 'CO', semester: '6', batch: 'Diploma' },
  { enrollNo: 'DIP6007', name: 'Rahul Jadhav', branch: 'CO', semester: '6', batch: 'Diploma' },
  { enrollNo: 'DIP6008', name: 'Pooja Sawant', branch: 'CO', semester: '6', batch: 'Diploma' }
];

const DEMO_EXAMS: Exam[] = [
  // Existing Exams
  { id: 'e1', subjectCode: '22517', subjectName: 'Computer Networks', examDate: '2025-12-10', startTime: '10:00', endTime: '13:00', branch: ['CO'], semester: '3' },
  { id: 'e2', subjectCode: '22518', subjectName: 'Operating Systems', examDate: '2025-12-12', startTime: '10:00', endTime: '13:00', branch: ['CO'], semester: '3' },
  
  // NEW: Scheme K - Semester 6 Subjects (From PDF)
  { id: 'k1', subjectCode: '315301', subjectName: 'Management (MAN)', examDate: '2025-05-15', startTime: '11:00', endTime: '12:30', branch: ['CO'], semester: '6' },
  { id: 'k2', subjectCode: '316313', subjectName: 'Emerging Trends in Computer Engg (ETI)', examDate: '2025-05-17', startTime: '11:00', endTime: '12:30', branch: ['CO'], semester: '6' },
  { id: 'k3', subjectCode: '316314', subjectName: 'Software Testing (SFT)', examDate: '2025-05-19', startTime: '11:00', endTime: '14:00', branch: ['CO'], semester: '6' },
  { id: 'k4', subjectCode: '316005', subjectName: 'Client Side Scripting (CSS)', examDate: '2025-05-21', startTime: '11:00', endTime: '13:00', branch: ['CO'], semester: '6' },
  { id: 'k5', subjectCode: '316006', subjectName: 'Mobile Application Development (MAD)', examDate: '2025-05-23', startTime: '11:00', endTime: '13:00', branch: ['CO'], semester: '6' },
  { id: 'k6', subjectCode: '316315', subjectName: 'Digital Forensic & Hacking (DFH)', examDate: '2025-05-25', startTime: '11:00', endTime: '14:00', branch: ['CO'], semester: '6' },
];

export const initializeDemoData = () => {
  // Check if version changed to force update
  const currentInit = localStorage.getItem(KEYS.INIT);
  if (currentInit !== KEYS.INIT) {
    console.log("Initializing/Updating Demo Data...");
    // Overwrite with new demo data
    localStorage.setItem('viva_rooms', JSON.stringify(DEMO_ROOMS));
    localStorage.setItem('viva_students', JSON.stringify(DEMO_STUDENTS));
    localStorage.setItem('viva_exams', JSON.stringify(DEMO_EXAMS));
    
    // Clear old seating/invigilation to avoid conflicts with new data if major structure changed
    // But we keep it simple here
    
    // Assign T001 to Exam k3 in Room r1
    const invig: Invigilation[] = [{
      id: 'inv1', examId: 'k3', roomId: 'r1', teacherId: 'T001', dutyType: 'Supervisor', assignedAt: new Date().toISOString()
    }];
    localStorage.setItem('viva_invigilation', JSON.stringify(invig));
    
    localStorage.setItem(KEYS.INIT, KEYS.INIT); // Set new version
    return true;
  }
  return false;
};

// --- AUTH SIMULATION ---
export const getCurrentRole = (): UserRole => {
  return (localStorage.getItem(KEYS.CURRENT_ROLE) as UserRole) || 'SuperAdmin';
};

export const setCurrentRole = (role: UserRole) => {
  localStorage.setItem(KEYS.CURRENT_ROLE, role);
};