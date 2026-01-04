import React, { useState, useEffect } from 'react';
import { fetchTeachersApi } from '../services/teachers';
import { fetchExamsApi } from '../services/exams';
import { fetchRoomsApi } from '../services/rooms';
import { fetchStudentsAllApi } from '../services/students';
import { fetchInvigilationsApi, assignInvigilatorApi, bulkSaveInvigilationsApi, clearInvigilationsApi } from '../services/invigilation';
import { generateInvigilationSchedule } from '../services/invigilationAlgorithm';
import { generateSeatingForExam } from '../services/seatingAlgorithm';
import { Teacher, Exam, Room, Invigilation, Student } from '../types';
import { Plus, UserCheck, Zap } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import Alert from '../components/Alert';

const InvigilationPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [invig, setInvig] = useState<Invigilation[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    examId: '',
    roomId: '',
    teacherId: '',
    dutyType: 'Supervisor' as const
  });
  const [message, setMessage] = useState<{ type: 'success'|'error'|'info'|'warning', message:string }|null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [teachersRes, examsRes, roomsRes, invigilationsRes, studentsRes] = await Promise.all([
        fetchTeachersApi(),
        fetchExamsApi(),
        fetchRoomsApi(),
        fetchInvigilationsApi(),
        fetchStudentsAllApi(),
      ]);
      setTeachers(teachersRes);
      setExams(examsRes);
      setRooms(roomsRes);
      setInvig(invigilationsRes);
      setStudents(studentsRes);
    } catch (error) {
      setMessage({ type: 'error', message: 'Failed to load data from server.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!form.examId || !form.roomId || !form.teacherId) {
      setMessage({type: 'error', message: 'All fields required'});
      return;
    }

    const newAssignment: Invigilation = {
      id: Date.now().toString(),
      examId: form.examId,
      roomId: form.roomId,
      teacherId: form.teacherId,
      dutyType: form.dutyType,
      assignedAt: new Date().toISOString()
    };
    
    try {
      setLoading(true);
      await assignInvigilatorApi(newAssignment);
      await loadData();
      setMessage({type: 'success', message: 'Teacher assigned successfully'});
    } catch (error) {
      setMessage({type: 'error', message: 'Failed to assign teacher.'});
    } finally {
        setLoading(false);
    }
  };

  const handleAutoAssign = async () => {
    if (!confirm('Are you sure you want to run auto-allocation? This will clear all existing assignments.')) return;
    
    setLoading(true);
    setMessage({ type: 'info', message: 'Running allocation algorithm... This may take a moment.' });

    // The algorithm expects slightly different shaped inputs, so we adapt them here.
    const algoTeachers = teachers.map(t => ({
        ...t, 
        teacherId: t.id,
        // @ts-ignore - gender is not part of the Teacher model but is required by the algorithm.
        gender: t.gender || 'Male' 
    }));

    const algoExams = exams.map(e => {
        const duration = (new Date(e.endTime).getTime() - new Date(e.startTime).getTime()) / (1000 * 60 * 60);
        return {
          examId: e.id,
          subject: e.subjectName,
          department: e.branch[0] || 'GENERAL',
          duration: duration,
          date: e.examDate,
          shift: new Date(e.startTime).getHours() < 12 ? 1 : 2,
        }
    });
    
    const algoRooms = rooms.map(r => ({...r, roomId: r.id}));
    
    // Determine which rooms are used for each exam
    const roomsForExams: Record<string, Room[]> = {};
    for (const exam of exams) {
      const seating = generateSeatingForExam(exam, students, rooms);
      if (seating.success && seating.result) {
        const usedRoomIds = [...new Set(seating.result.assignments.map(a => a.roomId))];
        roomsForExams[exam.id] = rooms.filter(r => usedRoomIds.includes(r.id));
      } else {
        roomsForExams[exam.id] = [];
      }
    }

    try {
      const { assignments, unassignedSlots } = generateInvigilationSchedule(
        algoTeachers, 
        algoRooms, 
        algoExams,
        roomsForExams
      );
      
      const newInvigilations: Invigilation[] = assignments.map(a => ({
        id: uuidv4(),
        examId: a.slot.exam.examId,
        roomId: a.slot.room.roomId,
        teacherId: a.teacher.teacherId,
        dutyType: a.slot.dutyType === 'Main' ? 'Supervisor' : 'Assistant',
        assignedAt: new Date().toISOString(),
      }));

      await clearInvigilationsApi();
      await bulkSaveInvigilationsApi(newInvigilations);
      await loadData(); // Reload all data including new assignments

      if (unassignedSlots.length > 0) {
        setMessage({ 
            type: 'warning', 
            message: `Auto-allocation complete. ${assignments.length} assignments made, but ${unassignedSlots.length} slots could not be filled.`
        });
      } else {
        setMessage({ 
            type: 'success', 
            message: `Auto-allocation completed successfully! ${assignments.length} assignments made.`
        });
      }

    } catch (error) {
      console.error("Auto-allocation error:", error);
      setMessage({ type: 'error', message: 'An unexpected error occurred during auto-allocation.'});
    } finally {
      setLoading(false);
    }
  }



  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-800">Assign Invigilation Duties</h1>
            <button 
                onClick={handleAutoAssign}
                disabled={loading}
                className="btn-primary bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2"
            >
                <Zap className="w-4 h-4" /> Auto-Assign All
            </button>
        </div>
      
      <Alert alert={message} onClose={() => setMessage(null)} />

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
         <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Select Exam</label>
              <select 
                className="w-full p-2 border border-slate-300 rounded outline-none"
                value={form.examId}
                onChange={e => setForm({...form, examId: e.target.value})}
                disabled={loading}
              >
                <option value="">-- Choose Exam --</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.subjectCode} ({e.examDate})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Select Room</label>
              <select 
                className="w-full p-2 border border-slate-300 rounded outline-none"
                value={form.roomId}
                onChange={e => setForm({...form, roomId: e.target.value})}
                disabled={loading}
              >
                <option value="">-- Choose Room --</option>
                {rooms.filter(r => r.isActive).map(r => <option key={r.id} value={r.id}>{r.roomNumber}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Select Teacher</label>
              <select 
                className="w-full p-2 border border-slate-300 rounded outline-none"
                value={form.teacherId}
                onChange={e => setForm({...form, teacherId: e.target.value})}
                disabled={loading}
              >
                <option value="">-- Choose Staff --</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.department})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Duty Type</label>
              <select 
                className="w-full p-2 border border-slate-300 rounded outline-none"
                value={form.dutyType}
                onChange={e => setForm({...form, dutyType: e.target.value as any})}
                disabled={loading}
              >
                <option value="Supervisor">Supervisor</option>
                <option value="Assistant">Assistant</option>
              </select>
            </div>
            <button type="submit" className="bg-blue-600 text-white p-2 rounded font-bold hover:bg-blue-700" disabled={loading}>
              Assign Duty
            </button>
         </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <h3 className="p-4 bg-slate-50 font-bold border-b border-slate-200">Current Assignments</h3>
        {invig.length === 0 ? <p className="p-4 text-slate-400">No active assignments.</p> : (
          <table className="w-full text-left">
             <thead>
               <tr className="border-b border-slate-100 text-xs text-slate-500 uppercase">
                 <th className="p-4">Exam</th>
                 <th className="p-4">Room</th>
                 <th className="p-4">Teacher</th>
                 <th className="p-4">Duty</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {invig.map(i => {
                 const e = exams.find(x => x.id === i.examId);
                 const r = rooms.find(x => x.id === i.roomId);
                 const t = teachers.find(x => x.id === i.teacherId);
                 return (
                   <tr key={i.id} className="hover:bg-slate-50">
                     <td className="p-4 font-medium">{e?.subjectName || i.examId}</td>
                     <td className="p-4">{r?.roomNumber || i.roomId}</td>
                     <td className="p-4">{t?.name || i.teacherId}</td>
                     <td className="p-4"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">{i.dutyType}</span></td>
                   </tr>
                 );
               })}
             </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InvigilationPage;