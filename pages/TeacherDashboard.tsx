import React, { useEffect, useState } from 'react';
import { fetchInvigilationsApi } from '../services/invigilation';
import { fetchExamsApi } from '../services/exams';
import { fetchRoomsApi } from '../services/rooms';
import { getCurrentUser } from '../services/auth';
import { Invigilation, Exam, Room } from '../types';
import { Calendar, MapPin, Clock, ArrowRight, Info, Briefcase, GraduationCap, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

import { fetchTeachersApi } from '../services/teachers';

const TeacherDashboard: React.FC = () => {
  const [todaysDuties, setTodaysDuties] = useState<(Invigilation & { examName: string; roomNumber: string; time: string })[]>([]);
  const [upcomingDuties, setUpcomingDuties] = useState<(Invigilation & { exam: Exam; room: Room })[]>([]);
  const [stats, setStats] = useState({ totalDuties: 0, upcoming: 0 });
  const [userName, setUserName] = useState<string>('Faculty Member');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const userId = getCurrentUser();

        const [allInvig, allExams, allRooms, allTeachers] = await Promise.all([
          fetchInvigilationsApi(),
          fetchExamsApi(),
          fetchRoomsApi(),
          fetchTeachersApi()
        ]);

        // Set user name
        const currentTeacher = allTeachers.find(t => t.id === userId);
        if (currentTeacher) {
          setUserName(currentTeacher.name);
        } else {
          setUserName(userId || 'Faculty Member');
        }

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

  const StatBox = ({ label, value, icon: Icon, colorClass }: any) => (
    <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/40 shadow-xl shadow-slate-200/50 relative overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500 ${colorClass}`}>
        <Icon className="w-20 h-20" />
      </div>
      <div className="relative z-10">
        <div className={`p-3 rounded-xl inline-block active-scale mb-4 backdrop-blur-md shadow-sm border border-white/20 ${colorClass.replace('text-', 'bg-').replace('500', '500/10').replace('600', '600/10')} ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-5xl font-extrabold text-slate-800 tracking-tight mb-1">{value}</div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-10">

      {/* Search/Header Bar */}
      <div className="relative bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[2rem] p-8 text-white overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full -ml-20 -mb-20 blur-2xl animate-float"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10 text-indigo-200 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Faculty Portal
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
              Welcome back, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">{userName}</span>
            </h1>
            <p className="text-indigo-200/80 max-w-xl text-lg font-medium leading-relaxed">
              Your command center for examination duties and schedules.
            </p>
          </div>
          <div className="text-right">
            <div className="inline-block bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-xl min-w-[200px]">
              <div className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mb-1.5 flex items-center justify-end gap-2">
                <Clock className="w-3 h-3" /> Today's Session
              </div>
              <div className="text-xl font-bold text-white">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
              <div className="text-xs text-indigo-200 mt-1 font-medium">Academic Year 2025-26</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatBox label="Today's Duties" value={todaysDuties.length} icon={Clock} colorClass="text-amber-500" />
        <StatBox label="Upcoming Duties" value={stats.upcoming} icon={Calendar} colorClass="text-blue-500" />
        <StatBox label="Total Assigned" value={stats.totalDuties} icon={Briefcase} colorClass="text-emerald-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Calendar className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Upcoming Schedule</h2>
            </div>

            {upcomingDuties.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-xl p-12 rounded-[2rem] border border-white/40 text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50/50 rounded-full flex items-center justify-center mx-auto mb-4 animate-float border border-white/50 shadow-inner">
                  <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">No Upcoming Duties</h3>
                <p className="text-slate-500 mt-2 font-medium">You currently have no invigilation duties assigned.</p>
              </div>
            ) : (
              <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] shadow-xl shadow-slate-200/50 border border-white/40 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white/40 border-b border-indigo-100/50">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date & Time</th>
                        <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Subject</th>
                        <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Location</th>
                        <th className="px-6 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-50/50">
                      {upcomingDuties.map(duty => (
                        <tr key={duty.id} className="hover:bg-white/40 transition-colors group">
                          <td className="px-8 py-5 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="flex items-center font-bold text-slate-700 text-sm">
                                <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400 group-hover:text-university-600 transition-colors" />
                                {new Date(duty.exam.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                              <div className="flex items-center text-xs text-slate-500 mt-1 font-medium bg-slate-100/50 px-2 py-0.5 rounded-md w-fit">
                                <Clock className="w-3 h-3 mr-1.5 text-slate-400" />
                                {duty.exam.startTime} - {duty.exam.endTime}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div>
                              <div className="font-bold text-slate-800 text-sm">{duty.exam.subjectCode}</div>
                              <div className="text-xs text-slate-500 font-medium mt-0.5">{duty.exam.subjectName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center text-sm font-bold text-slate-700">
                              <div className="p-1.5 bg-indigo-50 rounded-md mr-2 text-indigo-600">
                                <MapPin className="w-3.5 h-3.5" />
                              </div>
                              Room {duty.room.roomNumber}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${duty.dutyType === 'Supervisor' ? 'bg-purple-50/50 text-purple-700 border-purple-100' : 'bg-slate-50/50 text-slate-600 border-slate-200'}`}>
                              {duty.dutyType === 'Supervisor' && <ShieldCheck className="w-3 h-3 mr-1" />}
                              {duty.dutyType}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Today's Agenda</h2>
            </div>

            {todaysDuties.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-dashed border-slate-300 text-center shadow-lg shadow-slate-200/20">
                <p className="text-slate-500 font-medium text-sm">No duties scheduled for today.</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">Enjoy your day!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysDuties.map(duty => (
                  <div key={duty.id} className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-university-500 to-indigo-600"></div>
                    <div className="mb-4 flex justify-between items-center">
                      <span className={`text-[9px] font-extrabold uppercase px-2 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100`}>
                        {duty.dutyType}
                      </span>
                      <span className="text-xs font-bold text-slate-500 flex items-center bg-slate-100 px-2 py-1 rounded-md">
                        <Clock className="w-3 h-3 mr-1.5" /> {duty.time}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2 group-hover:text-university-700 transition-colors">{duty.examName}</h3>
                    <div className="flex items-center text-sm text-slate-600 mb-6 font-medium">
                      <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
                      <span>Room {duty.roomNumber}</span>
                    </div>

                    <Link to="/staff/my-rooms" className="w-full flex items-center justify-center py-3.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-bold text-xs transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                      Enter Exam Hall <ArrowRight className="w-3.5 h-3.5 ml-2" />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export default TeacherDashboard;