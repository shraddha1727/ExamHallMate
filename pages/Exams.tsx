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
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2 text-university-600 font-bold uppercase tracking-wider text-xs">
            <Calendar className="w-4 h-4" /> Academic Timetable
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Examination Schedule</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Manage upcoming examination sessions, subject codes, and time slots for all branches.
          </p>
        </div>
        <label className="btn-primary cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
          <Download className="w-4 h-4 mr-2" />
          Import CSV Timetable
          <input type="file" accept=".csv" className="hidden" onChange={handleTimetableUpload} />
        </label>
      </div>

      <Alert alert={message} onClose={() => setMessage(null)} />

      {exams.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center hover:border-university-200 hover:bg-slate-50 transition-all group">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white group-hover:text-university-500 group-hover:scale-110 transition-all shadow-inner">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Timetable Empty</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            There are no exams scheduled yet. Upload a CSV file to bulk import your exam schedule.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded text-xs font-mono text-slate-500 border border-slate-200">
            <AlertCircle className="w-3 h-3" />
            Required: subjectCode, subjectName, examDate, startTime, endTime, branch, semester
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Details</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Cohort Information</th>
                  <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.sort((a, b) => a.examDate.localeCompare(b.examDate)).map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-700 text-base">{exam.examDate}</span>
                        <span className="text-xs text-slate-400 mt-1 flex items-center bg-slate-100 w-fit px-2 py-0.5 rounded border border-slate-200">
                          <Clock className="w-3 h-3 mr-1.5" /> {exam.startTime} - {exam.endTime}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                          {exam.subjectCode.substring(0, 2)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{exam.subjectName}</div>
                          <div className="text-xs font-mono text-slate-500 mt-0.5">
                            Code: {exam.subjectCode}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-wrap gap-1">
                          {exam.branch.map(b => (
                            <span key={b} className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">
                              {b}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-university-600 bg-university-50 border border-university-100 px-1.5 py-0.5 rounded w-fit">
                          SEMESTER {exam.semester}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => handleDelete(exam.id)}
                        className="text-slate-300 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all group-hover:text-slate-400"
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