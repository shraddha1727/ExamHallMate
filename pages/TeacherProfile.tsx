import React, { useEffect, useState } from 'react';
import { fetchTeachersApi } from '../services/teachers';
import { getCurrentUser } from '../services/auth';
import { Teacher } from '../types';
import { User, Mail, Phone, Briefcase, LogOut, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TeacherProfile: React.FC = () => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userId = getCurrentUser();
        const teachers = await fetchTeachersApi();
        const t = teachers.find(tech => tech.id === userId);
        setTeacher(t || null);
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  if (!teacher) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in-up pb-12">
      <div className="relative bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-slate-900/10 border border-white/40 overflow-hidden">
        {/* Banner */}
        <div className="h-64 bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-10 -mb-10 pointer-events-none"></div>

          <div className="absolute -bottom-20 left-12 p-3 bg-white/20 backdrop-blur-xl rounded-[2rem] border border-white/30 shadow-2xl z-10">
            <div className="w-40 h-40 bg-gradient-to-br from-white to-slate-100 rounded-[1.5rem] flex items-center justify-center text-6xl font-extrabold text-indigo-900 shadow-inner">
              {teacher.name.charAt(0)}
            </div>
          </div>
        </div>

        <div className="pt-24 px-12 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">{teacher.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-lg text-slate-500 font-bold">Faculty Member</p>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                <p className="text-lg text-indigo-600 font-mono font-medium">{teacher.id}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase border border-indigo-100 flex items-center gap-1.5 shadow-sm tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5" /> Authenticated
                </span>
                <span className="px-4 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase border border-emerald-100 shadow-sm tracking-wide">
                  Active Status
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white rounded-xl font-bold text-sm transition-all flex items-center gap-2 border border-red-100 shadow-sm hover:shadow-red-500/20"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
            <div className="p-6 bg-white/50 rounded-[1.5rem] border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2.5 bg-white rounded-xl text-indigo-600 shadow-sm border border-indigo-50 group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-widest">Department</span>
              </div>
              <div className="pl-16">
                <p className="text-xl font-bold text-slate-800">{teacher.department}</p>
                <p className="text-sm font-medium text-slate-400">Academic Division</p>
              </div>
            </div>

            <div className="p-6 bg-white/50 rounded-[1.5rem] border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2.5 bg-white rounded-xl text-indigo-600 shadow-sm border border-indigo-50 group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-widest">Email Address</span>
              </div>
              <div className="pl-16">
                <p className="text-xl font-bold text-slate-800 break-all">{teacher.email}</p>
                <p className="text-sm font-medium text-slate-400">Official Communication</p>
              </div>
            </div>

            <div className="p-6 bg-white/50 rounded-[1.5rem] border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2.5 bg-white rounded-xl text-indigo-600 shadow-sm border border-indigo-50 group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-widest">Contact Number</span>
              </div>
              <div className="pl-16">
                <p className="text-xl font-bold text-slate-800">{teacher.phone || 'Not Provided'}</p>
                <p className="text-sm font-medium text-slate-400">Emergency Contact</p>
              </div>
            </div>

            <div className="p-6 bg-white/50 rounded-[1.5rem] border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2.5 bg-white rounded-xl text-indigo-600 shadow-sm border border-indigo-50 group-hover:scale-110 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-xs font-extrabold uppercase text-slate-400 tracking-widest">User ID</span>
              </div>
              <div className="pl-16">
                <p className="text-xl font-bold text-slate-800">{teacher.id}</p>
                <p className="text-sm font-medium text-slate-400">System Identification</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
