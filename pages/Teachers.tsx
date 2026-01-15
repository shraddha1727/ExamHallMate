import React, { useState, useEffect, useCallback } from 'react';
import { Teacher } from '../types';
import Alert from '../components/Alert';
import { Plus, Trash2, Mail, Phone, Briefcase, Edit, Users, GraduationCap, X } from 'lucide-react';
import { fetchTeachersApi, saveTeacherApi, deleteTeacherApi } from '../services/teachers';

// The Teacher type from the backend will have _id
interface TeacherFromDB extends Teacher {
  _id: string;
}

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherFromDB[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherFromDB | null>(null);
  const [form, setForm] = useState({
    id: '',
    name: '',
    email: '',
    department: '',
    phone: '',
    password: '',
  });
  const [msg, setMsg] = useState<{ type: 'success' | 'error' | 'info' | 'warning', message: string } | null>(null);

  const fetchTeachers = useCallback(async () => {
    try {
      const data = await fetchTeachersApi();
      setTeachers(data as TeacherFromDB[]);
    } catch (error) {
      setMsg({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.name && form.email) {
      try {
        const teacherData: any = { ...form };

        if (!editingTeacher) {
          delete teacherData.id;
        }

        await saveTeacherApi(teacherData);
        await fetchTeachers();
        setShowForm(false);
        setEditingTeacher(null);
        setForm({ id: '', name: '', email: '', department: '', phone: '', password: '' });
        setMsg({ type: 'success', message: 'Faculty member saved successfully' });
      } catch (error) {
        setMsg({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
      }
    } else {
      setMsg({ type: 'error', message: 'Name and Email are required fields.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this faculty member?')) {
      try {
        await deleteTeacherApi(id);
        await fetchTeachers();
        setMsg({ type: 'success', message: 'Faculty member removed successfully' });
      } catch (error) {
        setMsg({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
      }
    }
  };

  const handleEdit = (teacher: TeacherFromDB) => {
    setEditingTeacher(teacher);
    setForm({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      department: teacher.department,
      phone: teacher.phone || '',
      password: ''
    });
    setShowForm(true);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const handleAdd = () => {
    setEditingTeacher(null);
    setForm({
      id: '',
      name: '',
      email: '',
      department: '',
      phone: '',
      password: ''
    });
    setShowForm(true);
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-12">

      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg backdrop-blur-md border border-indigo-200">
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Academic Staff</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Faculty Management</h1>
          <p className="text-slate-500 mt-2 max-w-2xl text-lg font-medium">
            Manage department faculty profiles, contact details, and system access.
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={showForm}
          className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-1 transition-all flex items-center gap-3 border border-transparent group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <span>Add New Faculty</span>
        </button>
      </div>

      <Alert alert={msg} onClose={() => setMsg(null)} />

      {showForm && (
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl shadow-slate-900/10 border border-white/40 animate-fade-in-down relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 z-20">
            <button onClick={() => setShowForm(false)} className="p-3 bg-white/50 backdrop-blur-md border border-white/60 rounded-xl text-slate-500 hover:text-red-500 hover:bg-white transition-colors shadow-sm">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

          <div className="flex items-center gap-4 mb-8 relative z-10">
            <div className={`p-4 rounded-2xl shadow-lg border border-white/50 ${editingTeacher ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'}`}>
              {editingTeacher ? <Edit className="w-8 h-8" /> : <Plus className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">{editingTeacher ? 'Edit Profile' : 'New Faculty Member'}</h2>
              <p className="text-slate-500 text-lg">Enter the details below to {editingTeacher ? 'update' : 'create'} a faculty account.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                className="w-full px-5 py-4 bg-white/50 border border-white/60 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-800 transition-all placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                placeholder="e.g. Dr. Sarah Connor"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Details <span className="text-red-500">*</span></label>
              <input
                required
                type="email"
                className="w-full px-5 py-4 bg-white/50 border border-white/60 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-800 transition-all placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                placeholder="email@viva.edu.in"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Department</label>
              <input
                required
                type="text"
                className="w-full px-5 py-4 bg-white/50 border border-white/60 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-800 transition-all placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                placeholder="e.g. Computer Engineering"
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Contact Number</label>
              <input
                type="text"
                className="w-full px-5 py-4 bg-white/50 border border-white/60 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-800 transition-all placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                placeholder="+91 98765 00000"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Account Password</label>
              <input
                type="password"
                className="w-full px-5 py-4 bg-white/50 border border-white/60 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-bold text-slate-800 transition-all placeholder:font-normal placeholder:text-slate-400 shadow-sm"
                placeholder={editingTeacher ? "Leave blank to keep current password" : "Create a secure password"}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 pt-6 flex gap-4">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-4 bg-white/60 text-slate-600 font-bold rounded-xl hover:bg-white hover:text-slate-800 transition-all border border-white/60 shadow-sm uppercase tracking-wide">Cancel</button>
              <button type="submit" className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/30 hover:bg-slate-800 transition-all transform hover:scale-[1.01] uppercase tracking-wide">
                {editingTeacher ? 'Update Profile' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map(t => (
          <div key={t._id} className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/40 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-700 blur-xl"></div>

            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0 z-10">
              <button
                onClick={() => handleEdit(t)}
                className="p-2.5 bg-white/80 backdrop-blur-md rounded-xl text-blue-600 hover:bg-blue-50 border border-blue-200 transition-colors shadow-sm"
                title="Edit Profile"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="p-2.5 bg-white/80 backdrop-blur-md rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition-colors shadow-sm"
                title="Remove Faculty"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center mb-8 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-white text-indigo-700 rounded-2xl flex items-center justify-center font-bold text-3xl mr-6 shadow-md border border-white/60">
                {t.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-extrabold text-slate-800 text-xl leading-snug mb-1">{t.name}</h3>
                <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">{t.department}</p>
                <span className="inline-block px-2 py-0.5 bg-white/50 text-slate-500 rounded text-[10px] font-mono border border-white/60">
                  ID: {t.id}
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-200/50 relative z-10">
              <div className="flex items-center text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors bg-white/40 p-3 rounded-xl">
                <div className="w-8 flex justify-center mr-2"><Mail className="w-4 h-4 text-indigo-400" /></div>
                <span className="truncate">{t.email}</span>
              </div>
              <div className="flex items-center text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors bg-white/40 p-3 rounded-xl">
                <div className="w-8 flex justify-center mr-2"><Phone className="w-4 h-4 text-indigo-400" /></div>
                <span>{t.phone || 'No contact provided'}</span>
              </div>
              <div className="flex items-center text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors bg-white/40 p-3 rounded-xl">
                <div className="w-8 flex justify-center mr-2"><Briefcase className="w-4 h-4 text-indigo-400" /></div>
                <span>Invigilator</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teachers;