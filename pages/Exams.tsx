import React, { useState, useEffect } from 'react';
import { Exam } from '../types';
import { fetchExamsApi, bulkUpsertExamsApi, deleteExamApi } from '../services/exams';
import { parseCSV } from '../utils/csvParser';
import Alert from '../components/Alert';
import { Calendar, Clock, Download, Trash2, FileSpreadsheet, AlertCircle } from 'lucide-react';

const Exams: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      const data = await fetchExamsApi();
      setExams(data);
    } catch (error) {
      setMessage({ type: 'error', message: 'Failed to load exams from server.' });
    }
  };

  const handleTimetableUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseCSV(file);
      const newExams: Exam[] = [];

      data.forEach((row: any, i: number) => {
        const branches = row.branch ? row.branch.split(',').map((b: string) => b.trim()) : [];
        if (branches.length && row.subjectCode && row.examDate) {
          newExams.push({
            id: `${row.subjectCode}-${row.examDate}-${i}`, // Deterministic ID
            subjectCode: row.subjectCode,
            subjectName: row.subjectName || 'Unknown Subject',
            examDate: row.examDate,
            startTime: row.startTime || '10:00',
            endTime: row.endTime || '13:00',
            branch: branches,
            semester: row.semester || '1'
          });
        }
      });

      if (newExams.length > 0) {
        await bulkUpsertExamsApi(newExams);
        await loadExams();
        setMessage({ type: 'success', message: `Imported ${newExams.length} exams successfully.` });
      } else {
        setMessage({ type: 'error', message: 'No valid records found in CSV.' });
      }

    } catch (err: any) {
      console.error('CSV Processing Error:', err);
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setMessage({ type: 'error', message: `Failed to process CSV file: ${msg}` });
    }
    e.target.value = '';
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this exam entry?')) return;
    try {
      await deleteExamApi(id);
      await loadExams();
    } catch (error) {
      setMessage({ type: 'error', message: 'Failed to delete exam.' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-12">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg backdrop-blur-md border border-indigo-200">
              <Calendar className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Academic Timetable</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Examination Schedule</h1>
          <p className="text-slate-500 mt-2 max-w-2xl text-lg font-medium">
            Manage upcoming examination sessions, subject codes, and time slots for all branches.
          </p>
        </div>

        <label className="group relative cursor-pointer">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative flex items-center gap-3 px-6 py-4 bg-slate-900 rounded-xl leading-none border border-transparent hover:bg-slate-800 transition-colors">
            <Download className="w-5 h-5 text-indigo-400 group-hover:text-white transition-colors" />
            <span className="font-bold text-slate-200 group-hover:text-white">Import CSV Timetable</span>
          </div>
          <input type="file" accept=".csv" className="hidden" onChange={handleTimetableUpload} />
        </label>
      </div>

      <Alert alert={message} onClose={() => setMessage(null)} />

      {exams.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-xl border-2 border-dashed border-slate-300 rounded-[2rem] p-16 text-center hover:bg-white/80 transition-all duration-500 group relative overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 shadow-lg border border-slate-100">
              <FileSpreadsheet className="w-10 h-10 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Timetable Empty</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-8 font-medium">
              There are no exams scheduled yet. Upload a CSV file to bulk import your exam schedule.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-lg text-xs font-mono text-indigo-300 border border-indigo-500/20">
              <AlertCircle className="w-3 h-3" />
              Required: subjectCode, subjectName, examDate, startTime, endTime, branch, semester
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2rem] shadow-2xl shadow-slate-900/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead className="bg-white/40 border-b border-white/20">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Date & Time</th>
                  <th className="px-6 py-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Subject Details</th>
                  <th className="px-6 py-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Cohort Information</th>
                  <th className="px-6 py-6 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {exams.sort((a, b) => a.examDate.localeCompare(b.examDate)).map((exam) => (
                  <tr key={exam.id} className="hover:bg-white/50 transition-colors group">
                    <td className="px-4 py-4 md:px-8 md:py-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-sm md:text-base">{new Date(exam.examDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        <span className="text-[10px] md:text-xs text-slate-500 mt-1 flex items-center font-medium whitespace-nowrap">
                          <Clock className="w-3 h-3 mr-1.5 text-indigo-500" /> {exam.startTime} - {exam.endTime}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 md:px-6 md:py-6">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-white/50 shadow-sm flex items-center justify-center text-indigo-700 font-bold text-xs md:text-sm shrink-0 group-hover:scale-105 transition-transform">
                          {exam.subjectCode.substring(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 line-clamp-2 md:line-clamp-none leading-tight">{exam.subjectName}</div>
                          <div className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 bg-slate-100/50 px-1.5 py-0.5 rounded w-fit">
                            {exam.subjectCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-2.5">
                        <div className="flex flex-wrap gap-1.5">
                          {exam.branch.map(b => (
                            <span key={b} className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded shadow-sm">
                              {b}
                            </span>
                          ))}
                        </div>
                        <span className="text-[9px] font-extrabold text-white bg-indigo-500/80 px-2 py-0.5 rounded-full w-fit tracking-wide shadow-sm shadow-indigo-500/20">
                          SEM {exam.semester}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className="text-slate-300 hover:text-red-500 p-2.5 rounded-xl hover:bg-red-50 transition-all group-hover:text-slate-400 group-hover:translate-x-0"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Exams;