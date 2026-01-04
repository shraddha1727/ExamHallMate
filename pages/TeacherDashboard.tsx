import React, { useEffect, useState } from 'react';
import { fetchInvigilationsApi } from '../services/invigilation';
import { fetchExamsApi } from '../services/exams';
import { fetchRoomsApi } from '../services/rooms';
import { getCurrentUser } from '../services/auth';
import { Invigilation, Exam, Room } from '../types';
import { Calendar, MapPin, Clock, ArrowRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

const TeacherDashboard: React.FC = () => {
  const [todaysDuties, setTodaysDuties] = useState<(Invigilation & { examName: string; roomNumber: string; time: string })[]>([]);
  const [upcomingDuties, setUpcomingDuties] = useState<(Invigilation & { exam: Exam; room: Room })[]>([]);
  const [stats, setStats] = useState({ totalDuties: 0, upcoming: 0 });

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const userId = getCurrentUser();
        const [allInvig, allExams, allRooms] = await Promise.all([
          fetchInvigilationsApi(),
          fetchExamsApi(),
          fetchRoomsApi(),
        ]);

        const userInvig = allInvig.filter(i => i.teacherId === userId);

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        const upcoming = userInvig.filter(i => {
          const exam = allExams.find(e => e.id === i.examId);
          return exam && exam.examDate >= todayStr;
        });

        setStats({
          totalDuties: userInvig.length,
          upcoming: upcoming.length
        });

        const today = upcoming.filter(i => {
           const exam = allExams.find(e => e.id === i.examId);
           return exam && exam.examDate === todayStr;
        }).map(i => {
          const exam = allExams.find(e => e.id === i.examId);
          const room = allRooms.find(r => r.id === i.roomId);
          return {
            ...i,
            examName: exam?.subjectName || 'Unknown',
            roomNumber: room?.roomNumber || 'Unknown',
            time: `${exam?.startTime} - ${exam?.endTime}`
          };
        });

        setTodaysDuties(today);

        const upcomingDutiesData = upcoming.map(i => ({
          ...i,
          exam: allExams.find(e => e.id === i.examId)!,
          room: allRooms.find(r => r.id === i.roomId)!
        })).filter(d => d.exam && d.room)
          .sort((a, b) => a.exam.examDate.localeCompare(b.exam.examDate));

        setUpcomingDuties(upcomingDutiesData);

      } catch (error) {
        console.error("Failed to load dashboard:", error);
      }
    };

    loadDashboard();
  }, []);

  const StatBox = ({ label, value }: any) => (
    <div className="bg-white p-5 rounded border border-slate-200 text-center">
       <div className="text-3xl font-bold text-slate-800">{value}</div>
       <div className="text-xs font-medium text-slate-500 uppercase mt-1">{label}</div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded border border-slate-200 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Staff Portal</h1>
          <p className="text-sm text-slate-500">Department of Computer Engineering</p>
        </div>
        <div className="text-right text-sm text-slate-600 font-medium">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatBox label="Today's Duties" value={todaysDuties.length} />
        <StatBox label="Upcoming Duties" value={stats.upcoming} />
        <StatBox label="Total Assigned" value={stats.totalDuties} />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Today's Schedule</h2>
        
        {todaysDuties.length === 0 ? (
          <div className="bg-white p-8 rounded border border-slate-200 text-center">
            <Info className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No duties scheduled for today.</p>
          </div>
        ) : (
          todaysDuties.map(duty => (
            <div key={duty.id} className="bg-white p-5 rounded border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
               <div>
                 <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${duty.dutyType === 'Supervisor' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                      {duty.dutyType}
                    </span>
                    <h3 className="text-lg font-bold text-slate-800">{duty.examName}</h3>
                 </div>
                 <div className="flex items-center gap-4 text-sm text-slate-600">
                   <div className="flex items-center">
                     <MapPin className="w-4 h-4 mr-1 text-slate-400" /> Room {duty.roomNumber}
                   </div>
                   <div className="flex items-center">
                     <Clock className="w-4 h-4 mr-1 text-slate-400" /> {duty.time}
                   </div>
                 </div>
               </div>
               
               <Link to="/staff/rooms" className="btn-secondary text-xs">
                  View Seating <ArrowRight className="w-3 h-3 ml-2" />
               </Link>
            </div>
          ))
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 border-b border-slate-200 pb-2">Upcoming Duties</h2>
        
        {upcomingDuties.length === 0 ? (
          <div className="bg-white p-8 rounded border border-slate-200 text-center">
            <Info className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">No upcoming duties.</p>
          </div>
        ) : (
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
                {upcomingDuties.map(duty => (
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;