import React, { useState, useEffect } from 'react';
import { fetchTeachersApi } from '../services/teachers';
import { fetchExamsApi } from '../services/exams';
import { fetchRoomsApi } from '../services/rooms';
import { fetchStudentsAllApi } from '../services/students';
import { fetchInvigilationsApi, assignInvigilatorApi, bulkSaveInvigilationsApi, clearInvigilationsApi } from '../services/invigilation';
import { generateInvigilationSchedule } from '../services/invigilationAlgorithm';
import { generateSeatingForExam } from '../services/seatingAlgorithm';
import { Teacher, Exam, Room, Invigilation, Student } from '../types';
import { Plus, UserCheck, Zap, Briefcase, Calendar, Home, CheckCircle2 } from 'lucide-react';
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
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info' | 'warning', message: string } | null>(null);

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
    if (!form.examId || !form.roomId || !form.teacherId) {
      setMessage({ type: 'error', message: 'All fields required' });
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
      setMessage({ type: 'success', message: 'Teacher assigned successfully' });
    } catch (error) {
      setMessage({ type: 'error', message: 'Failed to assign teacher.' });
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

    const algoRooms = rooms.map(r => ({ ...r, roomId: r.id }));

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

    // Map the roomsForExams to match the AlgoRoom structure (adding aliases if needed)
    // The algorithm expects Record<string, AlgoRoom[]>
    const algoRoomsForExams: Record<string, any[]> = {};
    Object.keys(roomsForExams).forEach(key => {
      algoRoomsForExams[key] = roomsForExams[key].map(r => ({ ...r, roomId: r.id }));
    });

    try {
      const { assignments, unassignedSlots } = generateInvigilationSchedule(
        algoTeachers,
        algoRooms,
        algoExams,
        algoRoomsForExams
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
      setMessage({ type: 'error', message: 'An unexpected error occurred during auto-allocation.' });
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2 text-university-600 font-bold uppercase tracking-wider text-xs">
            <Briefcase className="w-4 h-4" /> Staff Management
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Invigilation Duties</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Automatically or manually assign faculty members to examination halls.
          </p>
        </div>
        <button
          onClick={handleAutoAssign}
          disabled={loading}
          className="btn-primary flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all bg-gradient-to-r from-indigo-600 to-indigo-800 border-none text-white px-6 py-3 rounded-lg"
        >
          <Zap className="w-5 h-5 fill-yellow-400 text-yellow-100" />
          <span className="font-bold tracking-wide">AI Auto-Allocate</span>
        </button>
      </div>

      <Alert alert={message} onClose={() => setMessage(null)} />

      {/* Manual Allocation Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
        <h3 className="text-lg font-bold text-slate-800 mb-6 relative z-10 flex items-center gap-2">
          <Plus className="w-5 h-5 text-slate-400" /> Manual Assignment
        </h3>

        <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-end relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Exam Session</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <select
                className="input-field pl-9 py-2.5 text-sm"
                value={form.examId}
                onChange={e => setForm({ ...form, examId: e.target.value })}
                disabled={loading}
              >
                <option value="">-- Choose Exam --</option>
                {exams.map(e => <option key={e.id} value={e.id}>{e.subjectCode}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Examination Hall</label>
            <div className="relative">
              <Home className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <select
                className="input-field pl-9 py-2.5 text-sm"
                value={form.roomId}
                onChange={e => setForm({ ...form, roomId: e.target.value })}
                disabled={loading}
              >
                <option value="">-- Choose Room --</option>
                {rooms.filter(r => r.isActive).map(r => <option key={r.id} value={r.id}>{r.roomNumber}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Faculty Member</label>
            <div className="relative">
              <UserCheck className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <select
                className="input-field pl-9 py-2.5 text-sm"
                value={form.teacherId}
                onChange={e => setForm({ ...form, teacherId: e.target.value })}
                disabled={loading}
              >
                <option value="">-- Choose Staff --</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Duty Role</label>
            <select
              className="input-field py-2.5 text-sm"
              value={form.dutyType}
              onChange={e => setForm({ ...form, dutyType: e.target.value as any })}
              disabled={loading}
            >
              <option value="Supervisor">Supervisor</option>
              <option value="Assistant">Assistant</option>
            </select>
          </div>
          <button type="submit" className="bg-slate-800 text-white p-2.5 rounded-lg font-bold hover:bg-slate-900 transition-colors shadow-md flex justify-center items-center" disabled={loading}>
            <Plus className="w-5 h-5" />
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800">Current Duty Roster</h3>
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{invig.length} Assignments</span>
        </div>

        {invig.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <UserCheck className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No active assignments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Faculty Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Exam & Subject</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invig.map(i => {
                  const e = exams.find(x => x.id === i.examId);
                  const r = rooms.find(x => x.id === i.roomId);
                  const t = teachers.find(x => x.id === i.teacherId);
                  return (
                    <tr key={i.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">
                            {t?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{t?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500">{t?.department || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-700">{e?.subjectName || i.examId}</p>
                          <p className="text-xs text-slate-500 font-mono">{e?.subjectCode}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Home className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-sm font-medium text-slate-700">{r?.roomNumber || i.roomId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${i.dutyType === 'Supervisor' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {i.dutyType}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvigilationPage;