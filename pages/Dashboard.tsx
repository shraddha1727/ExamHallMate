import React, { useEffect, useState } from 'react';
import { fetchRoomsApi } from '../services/rooms';
import { fetchExamsApi } from '../services/exams';
import { fetchStudentStatsApi } from '../services/students';
import { Users, Grid, BookOpen, Activity, ArrowRight, Calendar, Bell, ShieldCheck, Clock } from 'lucide-react';
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
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${colorClass}`}></div>

      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClass.replace('bg-', 'bg-opacity-10 text-')}`}>
          <Icon className={`w-6 h-6 ${colorClass.replace('bg-', 'text-')}`} />
        </div>
        {trend && (
          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1">
            +12% <Activity className="w-3 h-3" />
          </span>
        )}
      </div>

      <div>
        <h3 className="text-3xl font-extrabold text-slate-800 mb-1">{value}</h3>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">

      {/* 1. Welcome Banner */}
      <div className="relative bg-gradient-to-r from-university-900 to-university-700 rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-university-500 opacity-20 rounded-full -ml-10 -mb-10 blur-xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 opacity-80">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-sm font-medium tracking-wide uppercase">Admin Portal</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Welcome back, {session?.name || 'Administrator'}
            </h1>
            <p className="text-university-100 max-w-xl text-lg opacity-90">
              Here's what's happening in the examination department today. You have <strong className="text-white">{stats.exams} upcoming exams</strong> scheduled.
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/seating" className="px-5 py-3 bg-white text-university-900 font-bold rounded-lg hover:bg-university-50 transition-colors shadow-lg flex items-center gap-2">
              <Grid className="w-4 h-4" /> Allocation Engine
            </Link>
            <Link to="/admin/exams" className="px-5 py-3 bg-university-800 border border-university-600 text-white font-medium rounded-lg hover:bg-university-700 transition-colors flex items-center gap-2">
              <Calendar className="w-4 h-4" /> Manage Schedule
            </Link>
          </div>
        </div>
      </div>

      {/* 2. KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Students" value={stats.students} icon={Users} colorClass="bg-blue-600" trend={true} />
        <StatCard title="Active Classrooms" value={stats.rooms} icon={Grid} colorClass="bg-indigo-600" />
        <StatCard title="Exams Scheduled" value={stats.exams} icon={BookOpen} colorClass="bg-violet-600" />
        <StatCard title="Seating Capacity" value={stats.activeCapacity} icon={Activity} colorClass="bg-emerald-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* 3. Main Schedule Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Examination Schedule</h2>
              <p className="text-xs text-slate-500 mt-1">Next 5 upcoming sessions</p>
            </div>
            <Link to="/admin/exams" className="text-sm font-semibold text-university-600 hover:text-university-700 flex items-center gap-1 group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Cohort</th>
                  <th className="px-6 py-4 font-semibold text-slate-500 text-xs uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {recentExams.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <Calendar className="w-12 h-12 mb-3 text-slate-200" />
                        <p>No exams scheduled yet.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentExams.map((exam, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-xs shrink-0 border border-indigo-100">
                            {exam.subjectCode.substring(0, 3)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{exam.subjectName}</p>
                            <p className="text-xs text-slate-500 font-mono mt-0.5">{exam.subjectCode}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-700">{exam.examDate}</span>
                          <span className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {exam.startTime} - {exam.endTime}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {exam.branch.map((b: string) => (
                            <span key={b} className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 uppercase shadow-sm">{b}</span>
                          ))}
                          <span className="bg-university-50 border border-university-100 text-university-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase">SEM {exam.semester}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="text-slate-400 hover:text-university-600 transition-colors">
                          <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
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
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-5 flex items-center gap-2">
              <Grid className="w-4 h-4 text-university-500" /> Admin Utilities
            </h2>
            <div className="grid gap-3">
              {[
                { title: "Import Student Data", desc: "Upload CSV batch files", path: "/admin/students", color: "bg-blue-50 text-blue-600 border-blue-100" },
                { title: "Configure Rooms", desc: "Set capacity & layout", path: "/admin/rooms", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
                { title: "Assign Faculty", desc: "Invigilation duties", path: "/admin/invigilation", color: "bg-violet-50 text-violet-600 border-violet-100" }
              ].map((item, i) => (
                <Link key={i} to={item.path} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-university-200 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color} border`}>
                      <Grid className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-university-700 transition-colors">{item.title}</h4>
                      <p className="text-[10px] text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-university-600 transform group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* System Health Status */}
          <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 flex items-center gap-2">
              <Activity className="w-3 h-3" /> System Health
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-700 font-medium">Database API</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">ONLINE</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-slate-700 font-medium">Allocation Engine</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">READY</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;