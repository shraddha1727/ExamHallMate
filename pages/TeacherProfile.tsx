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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-university-600"></div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Banner */}
        <div className="h-48 bg-gradient-to-r from-university-900 to-university-700 relative">
          <div className="absolute inset-0 bg-pattern opacity-10"></div>
          <div className="absolute -bottom-16 left-8 p-1 bg-white rounded-2xl shadow-sm">
            <div className="w-32 h-32 bg-slate-100 rounded-xl flex items-center justify-center text-4xl font-bold text-university-700 shadow-inner">
              {teacher.name.charAt(0)}
            </div>
          </div>
        </div>

        <div className="pt-20 px-8 pb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900">{teacher.name}</h1>
              <p className="text-lg text-slate-500 font-medium flex items-center gap-2">
                Faculty Member <span className="w-1 h-1 rounded-full bg-slate-300"></span> {teacher.id}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-university-50 text-university-700 rounded-full text-xs font-bold uppercase border border-university-100 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Authenticated
                </span>
                <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-full text-xs font-bold uppercase border border-slate-200">
                  Active Status
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-xl font-bold text-sm transition-all flex items-center gap-2 border border-transparent hover:border-red-200"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-university-200 transition-colors group">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-white rounded-lg text-university-600 shadow-sm group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Department</span>
              </div>
              <div className="pl-14">
                <p className="text-lg font-bold text-slate-800">{teacher.department}</p>
                <p className="text-xs text-slate-500">Academic Division</p>
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-university-200 transition-colors group">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-white rounded-lg text-university-600 shadow-sm group-hover:scale-110 transition-transform">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Email Address</span>
              </div>
              <div className="pl-14">
                <p className="text-lg font-bold text-slate-800 break-all">{teacher.email}</p>
                <p className="text-xs text-slate-500">Official Communication</p>
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-university-200 transition-colors group">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-white rounded-lg text-university-600 shadow-sm group-hover:scale-110 transition-transform">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">Contact Number</span>
              </div>
              <div className="pl-14">
                <p className="text-lg font-bold text-slate-800">{teacher.phone || 'Not Provided'}</p>
                <p className="text-xs text-slate-500">Emergency Contact</p>
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 hover:border-university-200 transition-colors group">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-white rounded-lg text-university-600 shadow-sm group-hover:scale-110 transition-transform">
                  <User className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold uppercase text-slate-400 tracking-wider">User ID</span>
              </div>
              <div className="pl-14">
                <p className="text-lg font-bold text-slate-800">{teacher.id}</p>
                <p className="text-xs text-slate-500">System Identification</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
