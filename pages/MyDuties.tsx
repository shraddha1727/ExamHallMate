import React, { useEffect, useState } from 'react';
import { fetchInvigilationsApi } from '../services/invigilation';
import { fetchExamsApi } from '../services/exams';
import { fetchRoomsApi } from '../services/rooms';
import { getCurrentUser } from '../services/auth';
import { Invigilation, Exam, Room } from '../types';
import { Calendar, MapPin, Clock, Briefcase, ShieldCheck } from 'lucide-react';

const MyDuties: React.FC = () => {
  const [duties, setDuties] = useState<(Invigilation & { exam: Exam; room: Room })[]>([]);

  useEffect(() => {
    const loadDuties = async () => {
      try {
        const userId = getCurrentUser();
        const [invigilations, exams, rooms] = await Promise.all([
          fetchInvigilationsApi(),
          fetchExamsApi(),
          fetchRoomsApi(),
        ]);

        const userDuties = invigilations.filter(i => i.teacherId === userId);

        const data = userDuties.map(i => ({
          ...i,
          exam: exams.find(e => e.id === i.examId)!,
          room: rooms.find(r => r.id === i.roomId)!
        })).filter(d => d.exam && d.room)
          .sort((a, b) => a.exam.examDate.localeCompare(b.exam.examDate));

        setDuties(data);
      } catch (error) {
        // Handle error state
        console.error("Failed to load duties:", error);
      }
    };

    loadDuties();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-12">

      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg backdrop-blur-md border border-indigo-200">
              <Briefcase className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Faculty Portal</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">My Duties</h1>
          <p className="text-slate-500 mt-2 max-w-2xl text-lg font-medium">
            Complete history and upcoming schedule of your invigilation assignments.
          </p>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-slate-900/5 border border-white/40 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white/30 border-b border-white/20">
              <tr>
                <th className="px-8 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest pl-10">Date & Time</th>
                <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Exam Subject</th>
                <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Location</th>
                <th className="px-6 py-5 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Duty Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {duties.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-white/40 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white/50">
                        <Briefcase className="w-8 h-8 opacity-40 text-slate-500" />
                      </div>
                      <span className="font-bold text-lg text-slate-600">No duties assigned yet.</span>
                      <span className="text-sm opacity-60 mt-1">Check back later for updates.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                duties.map(duty => (
                  <tr key={duty.id} className="hover:bg-white/40 transition-colors group">
                    <td className="px-8 py-5 pl-10 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center font-bold text-slate-800 text-base">
                          <Calendar className="w-4 h-4 mr-3 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                          {duty.exam.examDate}
                        </div>
                        <div className="flex items-center text-xs font-bold text-slate-500 mt-1.5 ml-7">
                          <Clock className="w-3.5 h-3.5 mr-1.5 opacity-60" />
                          {duty.exam.startTime} - {duty.exam.endTime}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <div className="font-bold text-slate-800 text-base">{duty.exam.subjectCode}</div>
                        <div className="text-xs text-slate-500 font-bold mt-0.5">{duty.exam.subjectName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center text-sm font-bold text-slate-700">
                        <div className="p-1.5 bg-white/60 rounded-lg mr-2 shadow-sm">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        Room {duty.room.roomNumber}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border shadow-sm ${duty.dutyType === 'Supervisor' ? 'bg-purple-500/10 text-purple-700 border-purple-500/20' : 'bg-slate-500/10 text-slate-600 border-slate-500/20'}`}>
                        {duty.dutyType === 'Supervisor' && <ShieldCheck className="w-3 h-3 mr-1.5" />}
                        {duty.dutyType}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyDuties;
