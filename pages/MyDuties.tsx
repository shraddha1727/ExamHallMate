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
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2 text-university-600 font-bold uppercase tracking-wider text-xs">
            <Briefcase className="w-4 h-4" /> Faculty Portal
          </div>
          <h1 className="text-3xl font-bold text-slate-800">My Duties</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Complete history and upcoming schedule of your invigilation assignments.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Exam Subject</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duty Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {duties.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <Briefcase className="w-12 h-12 mb-3 text-slate-300" />
                      <span className="font-bold text-slate-600">No duties assigned yet.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                duties.map(duty => (
                  <tr key={duty.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center font-bold text-slate-700">
                          <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-university-600 transition-colors" />
                          {duty.exam.examDate}
                        </div>
                        <div className="flex items-center text-xs text-slate-500 mt-1">
                          <Clock className="w-3.5 h-3.5 mr-2 text-slate-400" />
                          {duty.exam.startTime} - {duty.exam.endTime}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-800">{duty.exam.subjectCode}</div>
                        <div className="text-xs text-slate-500 font-medium">{duty.exam.subjectName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm font-bold text-slate-700">
                        <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                        Room {duty.room.roomNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${duty.dutyType === 'Supervisor' ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                        {duty.dutyType === 'Supervisor' && <ShieldCheck className="w-3 h-3 mr-1" />}
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
