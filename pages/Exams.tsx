import React, { useState, useEffect } from 'react';
import { Exam } from '../types';
import { fetchExamsApi, bulkUpsertExamsApi, deleteExamApi } from '../services/exams';
import { parseCSV } from '../utils/csvParser';
import Alert from '../components/Alert';
import { Calendar, Clock, Download, Trash2 } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Exam Schedule</h1>
          <p className="text-sm text-slate-500 mt-1">Manage timetables and subject details.</p>
        </div>
        <label className="btn-primary cursor-pointer">
           <Download className="w-4 h-4 mr-2" />
           Import CSV Timetable
           <input type="file" accept=".csv" className="hidden" onChange={handleTimetableUpload} />
        </label>
      </div>

      <Alert alert={message} onClose={() => setMessage(null)} />

      {exams.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">Timetable Empty</h3>
          <p className="text-slate-500 text-sm mt-2">Upload a CSV file to populate the exam schedule.</p>
          <p className="text-xs text-slate-400 font-mono mt-2">Required: subjectCode, subjectName, examDate, startTime, endTime, branch, semester</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Date & Time</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Subject</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Branch / Sem</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exams.sort((a,b) => a.examDate.localeCompare(b.examDate)).map((exam) => (
                <tr key={exam.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-700">{exam.examDate}</div>
                    <div className="text-xs text-slate-500 flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" /> {exam.startTime} - {exam.endTime}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">{exam.subjectName}</div>
                    <div className="text-xs font-mono text-slate-500 bg-slate-100 inline-block px-1.5 rounded border border-slate-200 mt-1">
                      {exam.subjectCode}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {exam.branch.map(b => (
                        <span key={b} className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded">
                          {b}
                        </span>
                      ))}
                      <span className="text-[10px] font-bold text-white bg-slate-500 px-1.5 py-0.5 rounded">
                        SEM {exam.semester}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(exam.id)}
                      className="text-slate-400 hover:text-red-600 p-2 rounded hover:bg-red-50 transition-colors"
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
      )}
    </div>
  );
};

export default Exams;