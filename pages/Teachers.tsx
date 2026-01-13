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
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2 text-university-600 font-bold uppercase tracking-wider text-xs">
            <GraduationCap className="w-4 h-4" /> Academic Staff
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Faculty Management</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Manage department faculty profiles, contact details, and system access.
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={showForm}
          className="px-5 py-2.5 bg-university-900 text-white font-bold rounded-lg shadow-md hover:bg-university-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Add New Faculty
        </button>
      </div>

      <Alert alert={msg} onClose={() => setMsg(null)} />

      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 animate-fade-in-down relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <button onClick={() => setShowForm(false)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-university-50 p-3 rounded-xl text-university-600">
              {editingTeacher ? <Edit className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{editingTeacher ? 'Edit Profile' : 'New Faculty Member'}</h2>
              <p className="text-sm text-slate-500">Enter the details below to {editingTeacher ? 'update' : 'create'} a faculty account.</p>
            </div>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-university-500/20 focus:border-university-500 font-bold text-slate-800 transition-all placeholder:font-medium"
                placeholder="e.g. Dr. Sarah Connor"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Email Details <span className="text-red-500">*</span></label>
              <input
                required
                type="email"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-university-500/20 focus:border-university-500 font-bold text-slate-800 transition-all placeholder:font-medium"
                placeholder="email@viva.edu.in"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Department</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-university-500/20 focus:border-university-500 font-bold text-slate-800 transition-all placeholder:font-medium"
                placeholder="e.g. Computer Engineering"
                value={form.department}
                onChange={e => setForm({ ...form, department: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Contact Number</label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-university-500/20 focus:border-university-500 font-bold text-slate-800 transition-all placeholder:font-medium"
                placeholder="+91 98765 00000"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Account Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-university-500/20 focus:border-university-500 font-bold text-slate-800 transition-all placeholder:font-medium"
                placeholder={editingTeacher ? "Leave blank to keep current password" : "Create a secure password"}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
              />
            </div>

            <div className="md:col-span-2 pt-4 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-university-600 text-white font-bold rounded-xl shadow-lg shadow-university-500/20 hover:bg-university-700 transition-all transform hover:scale-[1.02]">
                {editingTeacher ? 'Update Profile' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map(t => (
          <div key={t._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 relative group hover:shadow-md transition-all">
            <div className="absolute top-4 right-4 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
              <button
                onClick={() => handleEdit(t)}
                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                title="Edit Profile"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                title="Remove Faculty"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-university-100 to-university-200 text-university-700 rounded-2xl flex items-center justify-center font-bold text-2xl mr-5 shadow-inner">
                {t.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg leading-tight">{t.name}</h3>
                <p className="text-xs font-bold uppercase tracking-wider text-university-600 mt-1">{t.department}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-mono border border-slate-200">
                  ID: {t.id}
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                <div className="w-8 flex justify-center"><Mail className="w-4 h-4 text-slate-400" /></div>
                <span className="truncate">{t.email}</span>
              </div>
              <div className="flex items-center text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                <div className="w-8 flex justify-center"><Phone className="w-4 h-4 text-slate-400" /></div>
                <span>{t.phone || 'No contact provided'}</span>
              </div>
              <div className="flex items-center text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                <div className="w-8 flex justify-center"><Briefcase className="w-4 h-4 text-slate-400" /></div>
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