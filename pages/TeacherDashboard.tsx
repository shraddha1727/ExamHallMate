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
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
      <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
        <Icon className="w-16 h-16" />
      </div>
      <div className="relative z-10">
        <div className={`p-2 rounded-lg inline-block active-scale mb-3 ${colorClass.replace('text-', 'bg-').replace('500', '100').replace('600', '100')} ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="text-4xl font-extrabold text-slate-800 tracking-tight">{value}</div>
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{label}</div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      {/* Search/Header Bar */}
      <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-university-900 via-university-800 to-university-900 p-8 text-white relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3 text-university-200 font-bold uppercase tracking-wider text-xs">
                  <ShieldCheck className="w-4 h-4" /> Faculty Portal
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {userName}</h1>
                <p className="text-university-200 max-w-xl text-lg">
                  Here is your examination schedule and duty roster for today.
                </p>
              </div>
              <div className="text-right">
                <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4">
                  <div className="text-xs text-university-200 font-bold uppercase tracking-wider mb-1">Current Session</div>
                  <div className="text-xl font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
              </div>
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
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-slate-800">Upcoming Schedule</h2>
              <div className="h-px bg-slate-200 flex-grow ml-4"></div>
            </div>

            {upcomingDuties.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-700">No Upcoming Duties</h3>
                <p className="text-slate-500 mt-1">You currently have no invigilation duties assigned.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {upcomingDuties.map(duty => (
                        <tr key={duty.id} className="hover:bg-slate-50/80 transition-colors group">
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
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-university-600" /> Today's Agenda
            </h2>

            {todaysDuties.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-slate-300 text-center">
                <p className="text-slate-500 font-medium text-sm">No duties scheduled for today.</p>
                <p className="text-xs text-slate-400 mt-1">Enjoy your day!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysDuties.map(duty => (
                  <div key={duty.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-university-600"></div>
                    <div className="mb-3 flex justify-between items-start">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded bg-university-50 text-university-700`}>
                        {duty.dutyType}
                      </span>
                      <span className="text-xs font-bold text-slate-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" /> {duty.time}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 mb-1">{duty.examName}</h3>
                    <div className="flex items-center text-sm text-slate-600 mb-4">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                      <span className="font-bold">Room {duty.roomNumber}</span>
                    </div>

                    <Link to="/staff/my-rooms" className="w-full flex items-center justify-center py-2 rounded-lg bg-slate-50 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors border border-slate-100">
                      Start Session <ArrowRight className="w-3 h-3 ml-2" />
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