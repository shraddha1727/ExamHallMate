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
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-12">

      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg backdrop-blur-md border border-indigo-200">
              <Briefcase className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Staff Management</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Invigilation Duties</h1>
          <p className="text-slate-500 mt-2 max-w-2xl text-lg font-medium">
            Automatically or manually assign faculty members to examination halls.
          </p>
        </div>
        <button
          onClick={handleAutoAssign}
          disabled={loading}
          className="px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 border border-transparent text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-1 transition-all flex items-center gap-2 group"
        >
          <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
            <Zap className="w-5 h-5 fill-yellow-300 text-yellow-100" />
          </div>
          <span className="tracking-wide">AI Auto-Allocate</span>
        </button>
      </div>

      <Alert alert={message} onClose={() => setMessage(null)} />

      {/* Manual Allocation Card */}
      <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/40 shadow-xl shadow-slate-900/5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full -mr-16 -mt-16 z-0 pointer-events-none transition-transform duration-700 group-hover:scale-125"></div>
        <h3 className="text-xl font-bold text-slate-800 mb-6 relative z-10 flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100"><Plus className="w-5 h-5 text-indigo-500" /></div>
          Manual Assignment
        </h3>

        <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 items-end relative z-10">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Select Exam Session</label>
            <div className="relative group/select">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover/select:text-indigo-500 transition-colors" />
              <select
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-bold text-slate-700 transition-all hover:bg-white shadow-sm appearance-none"
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
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Examination Hall</label>
            <div className="relative group/select">
              <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover/select:text-indigo-500 transition-colors" />
              <select
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-bold text-slate-700 transition-all hover:bg-white shadow-sm appearance-none"
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
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Faculty Member</label>
            <div className="relative group/select">
              <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover/select:text-indigo-500 transition-colors" />
              <select
                className="w-full pl-10 pr-4 py-3 bg-white/50 border border-white/60 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-bold text-slate-700 transition-all hover:bg-white shadow-sm appearance-none"
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
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Duty Role</label>
            <select
              className="w-full px-4 py-3 bg-white/50 border border-white/60 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-bold text-slate-700 transition-all hover:bg-white shadow-sm appearance-none"
              value={form.dutyType}
              onChange={e => setForm({ ...form, dutyType: e.target.value as any })}
              disabled={loading}
            >
              <option value="Supervisor">Supervisor</option>
              <option value="Assistant">Assistant</option>
            </select>
          </div>
          <button type="submit" className="bg-slate-900 text-white p-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex justify-center items-center h-[46px]" disabled={loading}>
            <Plus className="w-6 h-6" />
          </button>
        </form>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-slate-900/5 border border-white/40 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="p-8 border-b border-white/20 flex justify-between items-center relative z-10">
          <h3 className="text-xl font-bold text-slate-800">Current Duty Roster</h3>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg shadow-sm">{invig.length} Assignments</span>
        </div>

        {invig.length === 0 ? (
          <div className="p-24 text-center text-slate-400 relative z-10">
            <div className="w-20 h-20 bg-white/40 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/50 shadow-inner">
              <UserCheck className="w-8 h-8 opacity-40 text-slate-500" />
            </div>
            <p className="text-lg font-medium">No active assignments found.</p>
            <p className="text-sm opacity-70 mt-1">Use the manual form or AI auto-allocate to assign duties.</p>
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-white/30 border-b border-white/20">
                <tr>
                  <th className="px-8 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest text-left pl-10">Faculty Details</th>
                  <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Exam & Subject</th>
                  <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {invig.map(i => {
                  const e = exams.find(x => x.id === i.examId);
                  const r = rooms.find(x => x.id === i.roomId);
                  const t = teachers.find(x => x.id === i.teacherId);
                  return (
                    <tr key={i.id} className="hover:bg-white/40 transition-colors group">
                      <td className="px-8 py-5 pl-10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-white/50 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                            {t?.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{t?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-500 font-medium">{t?.department || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-bold text-slate-700">{e?.subjectName || i.examId}</p>
                          <span className="text-[10px] font-bold text-slate-400 font-mono bg-white/50 px-1.5 py-0.5 rounded border border-white/60">{e?.subjectCode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-white/60 rounded-lg">
                            <Home className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                          <span className="text-sm font-bold text-slate-700">{r?.roomNumber || i.roomId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border shadow-sm ${i.dutyType === 'Supervisor' ? 'bg-purple-500/10 text-purple-700 border-purple-500/20' : 'bg-slate-500/10 text-slate-600 border-slate-500/20'}`}>
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