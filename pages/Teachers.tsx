import React, { useState, useEffect, useCallback } from 'react';
import { Teacher } from '../types';
import Alert from '../components/Alert';
import { Plus, Trash2, Mail, Phone, Briefcase, Edit } from 'lucide-react';
import { fetchTeachersApi, saveTeacherApi, deleteTeacherApi } from '../services/teachers';

// The Teacher type from the backend will have _id
interface TeacherFromDB extends Teacher {
  _id: string;
}

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<TeacherFromDB[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherFromDB | null>(null);
  // Use a more specific type for the form, matching the backend model
  const [form, setForm] = useState({
    id: '',
    name: '',
    email: '',
    department: '',
    phone: '',
    password: '',
  });
  const [msg, setMsg] = useState<{type:'success'|'error', message:string}|null>(null);

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
    console.log("Attempting to save teacher...");
    console.log("Form data:", form);
    if(form.name && form.email) {
      try {
        // Create a mutable copy of the form data to send to the API
        const teacherData:any = { ...form };

        if (!editingTeacher) {
          // If we are not editing, remove the id from the object
          // So that the backend can generate a new one
          delete teacherData.id;
        }


        await saveTeacherApi(teacherData);
        console.log("Teacher saved successfully via API.");
        await fetchTeachers(); // Refetch to update list
        setShowForm(false);
        setEditingTeacher(null);
        setForm({ id:'', name: '', email: '', department: '', phone: '', password: '' });
        setMsg({type:'success', message:'Teacher saved successfully'});
      } catch (error) {
        setMsg({ type: 'error', message: 'An unexpected error occurred. Please try again.' });
      }
    } else {
      console.log("Save aborted: Required fields are missing.");
      setMsg({ type: 'error', message: 'Name and Email are required fields.' });
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to delete this teacher?')) {
      try {
        await deleteTeacherApi(id);
        await fetchTeachers(); // Refetch to update list
        setMsg({ type: 'success', message: 'Teacher deleted successfully' });
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
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Faculty Management</h1>
        <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Add Teacher
        </button>
      </div>

      <Alert alert={msg} onClose={() => setMsg(null)} />

      {showForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 animate-fade-in-down">
          <h2 className="text-xl font-bold text-slate-800 mb-4">{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-bold mb-1">Full Name</label>
              <input required type="text" className="w-full border p-2 rounded" placeholder="Dr. Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Email</label>
              <input required type="email" className="w-full border p-2 rounded" placeholder="email@viva.edu" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Password</label>
              <input type="password" className="w-full border p-2 rounded" placeholder="Enter new password to update" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Department</label>
              <input required type="text" className="w-full border p-2 rounded" placeholder="CO" value={form.department} onChange={e=>setForm({...form, department:e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold mb-1">Phone</label>
              <input type="text" className="w-full border p-2 rounded" placeholder="9876543210" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-indigo-600 text-white p-2 rounded font-bold hover:bg-indigo-700">Save Faculty</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teachers.map(t => (
          <div key={t._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative group">
            <div className="absolute top-4 right-4 flex space-x-2">
                <button onClick={() => handleEdit(t)} className="text-slate-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"><Edit className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(t.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
            </div>
             <div className="flex items-center mb-4">
               <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold mr-3">{t.department}</div>
               <div>
                 <h3 className="font-bold text-slate-800">{t.name}</h3>
                 <p className="text-xs text-slate-500 font-mono">{t.id}</p>
               </div>
             </div>
             <div className="space-y-2 text-sm text-slate-600">
               <div className="flex items-center"><Mail className="w-3 h-3 mr-2" /> {t.email}</div>
               <div className="flex items-center"><Phone className="w-3 h-3 mr-2" /> {t.phone || 'N/A'}</div>
               <div className="flex items-center"><Briefcase className="w-3 h-3 mr-2" /> {t.department} Dept</div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Teachers;