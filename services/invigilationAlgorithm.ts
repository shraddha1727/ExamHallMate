/**
 * @file services/invigilationAlgorithm.ts
 * @description Corrected, optimized + bug‑free auto‑invigilator allocation logic.
 */

// -------------------------------------------
// TYPE DEFINITIONS
// -------------------------------------------

export interface Teacher {
  teacherId: string;
  name: string;
  gender: 'Male' | 'Female';
  department: string;
}

export interface Room {
  roomId: string;
  capacity: number;
}

export interface Exam {
  examId: string;
  subject: string;
  department: string;
  duration: number;
  date: string;
  shift: number;
}

export interface DutySlot {
  exam: Exam;
  room: Room;
  dutyType: 'Main' | 'Reliever';
}

export interface Assignment {
  teacher: Teacher;
  slot: DutySlot;
}

// -------------------------------------------
// CONFIG
// -------------------------------------------

const MAX_DUTIES_PER_CYCLE = 5;
const RELIEVER_THRESHOLD_HOURS = 2;

// -------------------------------------------
// MAIN ENTRY FUNCTION
// -------------------------------------------

export function generateInvigilationSchedule(
  teachers: Teacher[],
  allRooms: Room[], // allRooms is still needed for fallback/reference
  exams: Exam[],
  roomsForExams: Record<string, Room[]>
): { assignments: Assignment[]; unassignedSlots: DutySlot[] } {
  
  const dutySlots = createDutySlots(exams, roomsForExams);
  const teacherDutyCount: { [teacherId: string]: number } = {};
  
  teachers.forEach(t => (teacherDutyCount[t.teacherId] = 0));

  const finalAssignments: Assignment[] = [];
  const unassignedSlots: DutySlot[] = [];

  // Sort slots chronologically
  dutySlots.sort((a, b) => {
    if (a.exam.date !== b.exam.date) return a.exam.date.localeCompare(b.exam.date);
    return a.exam.shift - b.exam.shift;
  });

  for (const slot of dutySlots) {
    const bestTeacher = findBestTeacherForSlot(
      slot,
      teachers,
      finalAssignments,
      teacherDutyCount
    );

    if (bestTeacher) {
      finalAssignments.push({ teacher: bestTeacher, slot });
      teacherDutyCount[bestTeacher.teacherId]++;
    } else {
      unassignedSlots.push(slot);
    }
  }

  return { assignments: finalAssignments, unassignedSlots };
}

// -------------------------------------------
// CREATE DUTY SLOTS (ROOM × EXAM)
// -------------------------------------------

function createDutySlots(
  exams: Exam[], 
  roomsForExams: Record<string, Room[]>
): DutySlot[] {
  const slots: DutySlot[] = [];

  for (const exam of exams) {
    const usedRooms = roomsForExams[exam.examId] || [];
    for (const room of usedRooms) {
      // Ensure room object has roomId
      const roomWithId = { ...room, roomId: room.roomId || (room as any).id };

      slots.push({ exam, room: roomWithId, dutyType: 'Main' });

      if (exam.duration > RELIEVER_THRESHOLD_HOURS) {
        slots.push({ exam, room: roomWithId, dutyType: 'Reliever' });
      }
    }
  }

  return slots;
}

// -------------------------------------------
// FIND BEST TEACHER FOR A SLOT
// -------------------------------------------

function findBestTeacherForSlot(
  slot: DutySlot,
  allTeachers: Teacher[],
  currentAssignments: Assignment[],
  dutyCount: { [teacherId: string]: number }
): Teacher | null {
  
  const validTeachers = allTeachers.filter(t =>
    isAssignmentValid(t, slot, currentAssignments, dutyCount)
  );

  if (!validTeachers.length) return null;

  let bestTeacher: Teacher | null = null;
  let bestScore = Infinity;

  for (const teacher of validTeachers) {
    const score = calculateFitnessScore(teacher, slot, currentAssignments, dutyCount);

    if (score < bestScore) {
      bestScore = score;
      bestTeacher = teacher;
    }
  }

  return bestTeacher;
}

// -------------------------------------------
// HARD CONSTRAINT VALIDATION
// -------------------------------------------

function isAssignmentValid(
  teacher: Teacher,
  slot: DutySlot,
  currentAssignments: Assignment[],
  dutyCount: { [teacherId: string]: number }
): boolean {
  
  // 1. Cannot invigilate same department exam
  if (teacher.department === slot.exam.department) return false;

  // 2. Female cannot be assigned 4+ hr exams
  if (teacher.gender.toLowerCase() === 'female' && slot.exam.duration >= 4) {
    return false;
  }

  // 3. Max duties limit
  if (dutyCount[teacher.teacherId] >= MAX_DUTIES_PER_CYCLE) return false;

  // 4. No teacher should have 2 duties in the same shift
  const conflict = currentAssignments.some(
    a =>
      a.teacher.teacherId === teacher.teacherId &&
      a.slot.exam.date === slot.exam.date &&
      a.slot.exam.shift === slot.exam.shift
  );
  if (conflict) return false;

  return true;
}

// -------------------------------------------
// PRIORITY SCORE CALCULATION
// -------------------------------------------

function calculateFitnessScore(
  teacher: Teacher,
  slot: DutySlot,
  currentAssignments: Assignment[],
  dutyCount: { [teacherId: string]: number }
): number {
  
  let score = 0;

  // 1. Load balancing (lower duty count = better)
  score += dutyCount[teacher.teacherId] * 10;

  // 2. Avoid consecutive shift duties
  const consecutive = currentAssignments.some(
    a =>
      a.teacher.teacherId === teacher.teacherId &&
      a.slot.exam.date === slot.exam.date &&
      Math.abs(a.slot.exam.shift - slot.exam.shift) === 1
  );
  if (consecutive) score += 50;

  // 3. Avoid assigning teacher repeatedly in same room
  const repeatedRoom = currentAssignments.some(
    a =>
      a.teacher.teacherId === teacher.teacherId &&
      a.slot.room.roomId === slot.room.roomId
  );
  if (repeatedRoom) score += 10;

  return score; 
}
