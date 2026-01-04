import React, { useEffect, useState } from 'react';
import { fetchTeachersApi } from '../services/teachers';
import { getCurrentUser } from '../services/auth';
import { Teacher } from '../types';
import { User, Mail, Phone, Briefcase, LogOut } from 'lucide-react';
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
    // In a real app, clear tokens. Here just redirect to dashboard/login
    navigate('/');
  };

  if (!teacher) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">My Profile</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-800 p-8 text-center">
           <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center text-slate-800 mb-4">
             <User className="w-12 h-12" />
           </div>
           <h2 className="text-2xl font-bold text-white">{teacher.name}</h2>
           <p className="text-blue-200">{teacher.id}</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center p-3 border-b border-slate-100">
            <Briefcase className="w-5 h-5 text-slate-400 mr-4" />
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">Department</p>
              <p className="text-slate-800 font-medium">{teacher.department}</p>
            </div>
          </div>
          
          <div className="flex items-center p-3 border-b border-slate-100">
            <Mail className="w-5 h-5 text-slate-400 mr-4" />
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">Email Address</p>
              <p className="text-slate-800 font-medium">{teacher.email}</p>
            </div>
          </div>
          
          <div className="flex items-center p-3">
            <Phone className="w-5 h-5 text-slate-400 mr-4" />
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">Phone Number</p>
              <p className="text-slate-800 font-medium">{teacher.phone || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-600 hover:bg-red-100 py-3 rounded-lg font-bold flex items-center justify-center transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;
