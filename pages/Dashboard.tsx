import React, { useEffect, useState } from 'react';
import { fetchRoomsApi } from '../services/rooms';
import { fetchExamsApi } from '../services/exams';
import { fetchStudentStatsApi } from '../services/students';
import { Users, Grid, BookOpen, Activity, ArrowRight, Calendar, Bell, ShieldCheck, Clock, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSession } from '../services/auth';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    rooms: 0,
    students: 0,
    exams: 0,
    activeCapacity: 0
  });
  const [recentExams, setRecentExams] = useState<any[]>([]);
  const session = getSession();

  useEffect(() => {
    const load = async () => {
      try {
        const [rooms, exams, studentStats] = await Promise.all([
          fetchRoomsApi(),
          fetchExamsApi(),
          fetchStudentStatsApi(),
        ]);

        const totalStudents = studentStats.reduce((acc, stat) => acc + stat.count, 0);

        setStats({
          rooms: rooms.length,
          students: totalStudents,
          exams: exams.length,
          activeCapacity: rooms.reduce((sum, r) => (r.isActive ? sum + r.capacity : sum), 0)
        });

        const sorted = [...exams].sort((a, b) => a.examDate.localeCompare(b.examDate)).slice(0, 5);
        setRecentExams(sorted);
      } catch (err) {
        setStats({ rooms: 0, students: 0, exams: 0, activeCapacity: 0 });
      }
    };

    load();
  }, []);

  const StatCard = ({ title, value, icon: Icon, colorClass, trend }: any) => (
    <div className="bg-white/60 backdrop-blur-xl p-6 rounded-2xl border border-white/40 shadow-xl shadow-indigo-900/5 hover:shadow-indigo-900/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full opacity-20 filter blur-2xl ${colorClass}`}></div>

      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`p-3 rounded-xl backdrop-blur-md shadow-sm border border-white/20 ${colorClass.replace('bg-', 'bg-opacity-10 text-')}`}>
          <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50/80 px-2 py-1 rounded-full flex items-center gap-1 border border-emerald-100">
            +12% <Activity className="w-3 h-3" />
          </span>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-4xl font-extrabold text-slate-800 mb-1">{value}</h3>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-10">

      {/* 1. Welcome Banner */}
      <div className="relative bg-gradient-to-r from-university-900 via-indigo-900 to-university-800 rounded-[2rem] p-8 md:p-12 text-white overflow-hidden shadow-2xl shadow-indigo-900/20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 opacity-20 rounded-full -ml-20 -mb-20 blur-2xl animate-float"></div>

        {/* Abstract shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white/5 rounded-full"></div>
        <div className="absolute bottom-10 right-20 w-32 h-32 border border-white/5 rounded-full"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase border border-white/10 text-indigo-100 flex items-center gap-2">
                <ShieldCheck className="w-3 h-3" /> Admin Portal
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
              Welcome back, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">{session?.name || 'Administrator'}</span>
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed font-medium">
              You have <strong className="text-white bg-white/10 px-2 rounded-md">{stats.exams} upcoming exams</strong> managed by the system.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Link to="/admin/seating" className="px-6 py-4 bg-white text-university-900 font-bold rounded-xl hover:bg-slate-50 hover:-translate-y-1 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2 group">
              <Grid className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Allocation Engine</span>
            </Link>
            <Link to="/admin/exams" className="px-6 py-4 bg-university-800/50 backdrop-blur-md border border-white/20 text-white font-bold rounded-xl hover:bg-university-800/70 hover:-translate-y-1 transition-all flex items-center justify-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>Schedule</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats.students} icon={Users} colorClass="bg-blue-600" trend={true} />
        <StatCard title="Active Classrooms" value={stats.rooms} icon={Grid} colorClass="bg-indigo-600" />
        <StatCard title="Exams Scheduled" value={stats.exams} icon={BookOpen} colorClass="bg-violet-600" />
        <StatCard title="Total Capacity" value={stats.activeCapacity} icon={Activity} colorClass="bg-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 3. Main Schedule Table */}
        <div className="lg:col-span-2 bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-xl shadow-slate-200/50 flex flex-col overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-200/60 flex justify-between items-center bg-white/40 backdrop-blur-md">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-university-600" /> Examination Schedule
              </h2>
            </div>
            <Link to="/admin/exams" className="px-4 py-2 bg-white rounded-lg text-xs font-bold text-university-600 hover:text-university-700 hover:shadow-md border border-slate-100 transition-all flex items-center gap-1 group">
              View All <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/80 border-b border-slate-200/50">
                <tr>
                  <th className="px-8 py-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Subject</th>
                  <th className="px-6 py-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Timing</th>
                  <th className="px-6 py-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest">Cohort</th>
                  <th className="px-6 py-4 font-bold text-slate-500 text-[10px] uppercase tracking-widest text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60">
                {recentExams.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-16 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center animate-pulse">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                          <Calendar className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="font-medium">No exams scheduled yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentExams.map((exam, idx) => (
                    <tr key={idx} className="hover:bg-white/60 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-university-600 font-bold text-xs shrink-0 border border-university-100 shadow-sm group-hover:scale-105 transition-transform duration-300">
                            {exam.subjectCode.substring(0, 3)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{exam.subjectName}</p>
                            <p className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-1">{exam.subjectCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-sm">{new Date(exam.examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          <span className="text-xs text-slate-400 mt-1 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 w-fit flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {exam.startTime} - {exam.endTime}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {exam.branch.map((b: string) => (
                            <span key={b} className="bg-white border border-slate-200 px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-600 uppercase shadow-sm">{b}</span>
                          ))}
                          <span className="bg-university-50 border border-university-100 text-university-600 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase">SEM {exam.semester}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="w-8 h-8 rounded-full bg-transparent hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-university-600 transition-all">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Quick Actions Panel */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/40 shadow-xl shadow-slate-200/50 p-6">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2 ml-1">
              <Grid className="w-4 h-4 text-university-500" /> Admin Utilities
            </h2>
            <div className="space-y-3">
              {[
                { title: "Import Data", desc: "Bulk CSV Upload", path: "/admin/students", color: "from-blue-500 to-cyan-500" },
                { title: "Configure Rooms", desc: "Capacity Planning", path: "/admin/rooms", color: "from-indigo-500 to-purple-500" },
                { title: "Invigilation", desc: "Faculty Setup", path: "/admin/invigilation", color: "from-violet-500 to-fuchsia-500" }
              ].map((item, i) => (
                <Link key={i} to={item.path} className="flex items-center justify-between p-4 bg-white/50 border border-white/60 rounded-2xl hover:bg-white hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${item.color} text-white shadow-md group-hover:scale-110 transition-transform`}>
                      <Grid className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-university-700 transition-colors">{item.title}</h4>
                      <p className="text-[10px] font-medium text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-slate-300 rotate-180 group-hover:text-university-600 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* System Health Status */}
          <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-[2rem] border border-emerald-100 p-6 backdrop-blur-sm">
            <h4 className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Activity className="w-3 h-3" /> System Status
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-emerald-100/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <span className="text-xs text-slate-700 font-bold">Database API</span>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">ONLINE</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-emerald-100/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></div>
                    <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                  </div>
                  <span className="text-xs text-slate-700 font-bold">Engine</span>
                </div>
                <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md">READY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default Dashboard;