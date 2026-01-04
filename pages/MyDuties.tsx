import React, { useEffect, useState } from 'react';
import { fetchInvigilationsApi } from '../services/invigilation';
import { fetchExamsApi } from '../services/exams';
import { fetchRoomsApi } from '../services/rooms';
import { getCurrentUser } from '../services/auth';
import { Invigilation, Exam, Room } from '../types';
import { Calendar, MapPin, Clock } from 'lucide-react';

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">My Duties</h1>
        <p className="text-slate-500">List of all assigned examination duties.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Exam Subject</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Time</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Room</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Duty Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {duties.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No duties assigned yet.
                </td>
              </tr>
            ) : (
              duties.map(duty => (
                <tr key={duty.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-slate-800 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                      {duty.exam.examDate}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    <div className="font-bold">{duty.exam.subjectCode}</div>
                    <div className="text-xs text-slate-500">{duty.exam.subjectName}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-slate-400" />
                      {duty.exam.startTime} - {duty.exam.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-800">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-slate-400" />
                      {duty.room.roomNumber}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-bold uppercase ${duty.dutyType === 'Supervisor' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}>
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
  );
};

export default MyDuties;
