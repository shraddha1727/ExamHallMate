import React, { useEffect, useState } from 'react';
import { fetchRoomsApi } from '../services/rooms';
import { fetchExamsApi } from '../services/exams';
import { fetchStudentStatsApi } from '../services/students';
import { Users, Grid, BookOpen, Activity, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    rooms: 0,
    students: 0,
    exams: 0,
    activeCapacity: 0
  });
  const [recentExams, setRecentExams] = useState<any[]>([]);

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
        // Handle error state if any of the API calls fail
        setStats({ rooms: 0, students: 0, exams: 0, activeCapacity: 0 });
      }
    };

    load();
  }, []);

  const StatCard = ({ title, value, icon: Icon }: any) => (
    <div className="bg-white p-6 rounded border border-slate-200 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-university-900">{value}</h3>
      </div>
      <div className="p-3 bg-slate-50 rounded text-university-600 border border-slate-100">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-university-900">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">System Overview & Quick Actions</p>
        </div>
        <div className="flex gap-3">
          <Link to="/admin/exams" className="btn-secondary text-xs">
             Manage Schedule
          </Link>
          <Link to="/admin/seating" className="btn-primary text-xs">
             Allocation Engine
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={stats.students} icon={Users} />
        <StatCard title="Active Rooms" value={stats.rooms} icon={Grid} />
        <StatCard title="Upcoming Exams" value={stats.exams} icon={BookOpen} />
        <StatCard title="Total Capacity" value={stats.activeCapacity} icon={Activity} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Schedule Table */}
        <div className="lg:col-span-2 bg-white rounded border border-slate-200 shadow-sm flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Examination Schedule</h2>
            <Link to="/admin/exams" className="text-xs font-medium text-university-700 hover:underline">View Full Schedule</Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-white border-b border-slate-100">
                  <th className="px-6 py-3 font-semibold text-slate-600">Subject Code</th>
                  <th className="px-6 py-3 font-semibold text-slate-600">Subject Name</th>
                  <th className="px-6 py-3 font-semibold text-slate-600">Date & Time</th>
                  <th className="px-6 py-3 font-semibold text-slate-600">Branch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentExams.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 italic">No exams scheduled.</td>
                  </tr>
                ) : (
                  recentExams.map((exam, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-mono text-slate-700 font-medium">{exam.subjectCode}</td>
                      <td className="px-6 py-3 text-slate-800">{exam.subjectName}</td>
                      <td className="px-6 py-3 text-slate-600">
                        <div className="flex flex-col">
                          <span>{exam.examDate}</span>
                          <span className="text-xs text-slate-400">{exam.startTime} - {exam.endTime}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex flex-wrap gap-1">
                          {exam.branch.map((b: string) => (
                            <span key={b} className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-600">{b}</span>
                          ))}
                          <span className="bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] font-bold text-slate-600">Sem {exam.semester}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links / Info */}
        <div className="bg-white rounded border border-slate-200 shadow-sm p-6">
           <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide mb-4">Admin Actions</h2>
           <div className="space-y-3">
             <Link to="/admin/students" className="block w-full p-3 border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-300 transition-colors group">
                <div className="flex justify-between items-center">
                   <span className="text-sm font-medium text-slate-700">Import Student Data</span>
                   <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-university-600" />
                </div>
                <p className="text-xs text-slate-500 mt-1">Upload CSV batch files.</p>
             </Link>
             <Link to="/admin/rooms" className="block w-full p-3 border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-300 transition-colors group">
                <div className="flex justify-between items-center">
                   <span className="text-sm font-medium text-slate-700">Configure Rooms</span>
                   <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-university-600" />
                </div>
                <p className="text-xs text-slate-500 mt-1">Set capacity and status.</p>
             </Link>
             <Link to="/admin/invigilation" className="block w-full p-3 border border-slate-200 rounded hover:bg-slate-50 hover:border-slate-300 transition-colors group">
                <div className="flex justify-between items-center">
                   <span className="text-sm font-medium text-slate-700">Assign Duties</span>
                   <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-university-600" />
                </div>
                <p className="text-xs text-slate-500 mt-1">Manage staff allocation.</p>
             </Link>
           </div>
           
           <div className="mt-8 pt-6 border-t border-slate-100">
             <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">System Health</h4>
             <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
               <span className="text-xs text-slate-700 font-medium">Database Operational</span>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
               <span className="text-xs text-slate-700 font-medium">Services Online</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;