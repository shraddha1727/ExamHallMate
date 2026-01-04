import { Student, Room, Exam, SeatAssignment, SeatingResult } from '../types';
export const generateSeatingForExam = (exam: Exam, allStudents: Student[], allRooms: Room[]): { success: boolean; result?: SeatingResult; error?: string } => {

  // 1. Filter Students matching exam criteria
  // Logic: Student Branch must be in Exam Branches AND Student Semester must match
  const eligibleStudents = allStudents.filter(s => 
    exam.branch.includes(s.branch) && s.semester == exam.semester
  );

  if (eligibleStudents.length === 0) {
    return { success: false, error: 'No students found matching Branch/Semester criteria. Check Student Database.' };
  }

  // 2. Filter Active Rooms & Sort by Capacity (Descending) as per requirements
  const activeRooms = allRooms
    .filter(r => r.isActive)
    .sort((a, b) => b.capacity - a.capacity);

  const totalCapacity = activeRooms.reduce((sum, r) => sum + r.capacity, 0);

  if (totalCapacity < eligibleStudents.length) {
    return { 
      success: false, 
      error: `Insufficient capacity! Need ${eligibleStudents.length} seats, but only have ${totalCapacity} active seats.` 
    };
  }

  // 3. Round-Robin Mixing Algorithm
  // Goal: Mix branches to avoid cheating.
  const studentsByBranch: Record<string, Student[]> = {};
  exam.branch.forEach(b => {
    studentsByBranch[b] = eligibleStudents.filter(s => s.branch === b);
  });

  const mixedStudents: Student[] = [];
  const branches = Object.keys(studentsByBranch);
  const maxCount = Math.max(...branches.map(b => studentsByBranch[b].length));

  for (let i = 0; i < maxCount; i++) {
    for (const b of branches) {
      if (studentsByBranch[b][i]) {
        mixedStudents.push(studentsByBranch[b][i]);
      }
    }
  }

  // 4. Light Shuffle (Fisher-Yates) to avoid predictable patterns
  for (let i = mixedStudents.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [mixedStudents[i], mixedStudents[j]] = [mixedStudents[j], mixedStudents[i]];
  }

  // 5. Assign to Rooms Sequentially
  const assignments: SeatAssignment[] = [];
  let studentIdx = 0;

  for (const room of activeRooms) {
    if (studentIdx >= mixedStudents.length) break;

    // Fill room seat by seat
    for (let seat = 1; seat <= room.capacity; seat++) {
      if (studentIdx >= mixedStudents.length) break;

      const student = mixedStudents[studentIdx];
      
      // Calculate Grid Position (4 columns wide default)
      // Row = ceil(seat / 4)
      // Col = (seat-1) % 4 + 1
      const row = Math.ceil(seat / 4);
      const col = ((seat - 1) % 4) + 1;

      assignments.push({
        examId: exam.id,
        studentId: student.enrollNo,
        studentName: student.name,
        branch: student.branch,
        roomId: room.id,
        roomNumber: room.roomNumber,
        seatNumber: seat,
        row,
        col,
        absent: false
      });

      studentIdx++;
    }
  }

  const result: SeatingResult = {
    examId: exam.id,
    assignments,
    generatedAt: new Date().toISOString()
  };

  return { success: true, result };
};