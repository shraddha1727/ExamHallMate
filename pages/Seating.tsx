import React, { useState, useEffect } from 'react';
import { Exam, SeatingResult, SeatAssignment, Student, Room } from '../types';
import { fetchRoomsApi } from '../services/rooms';
import { fetchStudentsAllApi } from '../services/students'; // Changed to fetchStudentsAllApi
import { fetchExamsApi } from '../services/exams';
import { generateSeatingForExam } from '../services/seatingAlgorithm';
import { fetchSeatingApi, saveSeatingApi } from '../services/seating';
import Alert from '../components/Alert';
import { Layers, Printer, RefreshCw, CheckCircle, Monitor, ChevronRight, LayoutGrid, User } from 'lucide-react';

const Seating: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [currentSeating, setCurrentSeating] = useState<SeatingResult | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedExams, loadedStudents, loadedRooms] = await Promise.all([
          fetchExamsApi(),
          fetchStudentsAllApi(),
          fetchRoomsApi(),
        ]);
        console.log('Fetched data:', { loadedExams, loadedStudents, loadedRooms });
        setExams(loadedExams);
        setStudents(loadedStudents);
        setRooms(loadedRooms);
        if (loadedExams.length > 0) {
          setSelectedExamId(loadedExams[0].id);
        }
      } catch (error) {
        setMessage({ type: 'error', message: 'Failed to load data from server.' });
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const loadSeating = async () => {
      if (selectedExamId) {
        try {
          const saved = await fetchSeatingApi(selectedExamId);
          setCurrentSeating(saved);
          setMessage(null);
        } catch (error) {
          setCurrentSeating(null);
        }
      } else {
        setCurrentSeating(null);
      }
    };
    loadSeating();
  }, [selectedExamId]);

  const handleGenerate = async () => {
    const exam = exams.find(e => e.id === selectedExamId);
    if (!exam) return;

    if (currentSeating && !confirm('A seating arrangement already exists for this exam. Do you want to overwrite it?')) {
      return;
    }

    console.log('Generating seating with:', { exam, students, rooms });
    const result = generateSeatingForExam(exam, students, rooms);
    if (result.success && result.result) {
      try {
        await saveSeatingApi(result.result);
        setCurrentSeating(result.result);
        setMessage({ type: 'success', message: 'Seating plan generated successfully!' });
      } catch (error) {
        setMessage({ type: 'error', message: 'Failed to save seating plan.' });
      }
    } else {
      setMessage({ type: 'error', message: result.error || 'Generation failed' });
    }
  };

  const selectedExam = exams.find(e => e.id === selectedExamId);

  // Group assignments by Room
  const assignmentsByRoom: Record<string, SeatAssignment[]> = {};
  if (currentSeating) {
    currentSeating.assignments.forEach(a => {
      if (!assignmentsByRoom[a.roomId]) assignmentsByRoom[a.roomId] = [];
      assignmentsByRoom[a.roomId].push(a);
    });
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header & Controls */}
      <div className="no-print animate-fade-in-up">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10 relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-50 rounded-lg backdrop-blur-md border border-indigo-200">
                <LayoutGrid className="w-5 h-5 text-indigo-600" />
              </div>
              <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Exam Management</span>
            </div>
            <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Seating Allocation</h1>
            <p className="text-slate-500 mt-2 max-w-2xl text-lg font-medium">
              Generate, visualize, and print seating plans for upcoming examinations.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={handleGenerate}
              disabled={!selectedExamId}
              className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 transition-all flex items-center gap-3 border border-white/10 group"
            >
              <RefreshCw className={`w-5 h-5 ${!selectedExamId ? '' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
              {currentSeating ? 'Regenerate Plan' : 'Generate Allocation'}
            </button>
            <button
              onClick={() => window.print()}
              disabled={!currentSeating}
              className="px-6 py-4 bg-slate-800 text-slate-200 border border-white/10 font-bold rounded-xl shadow-lg hover:bg-slate-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3"
            >
              <Printer className="w-5 h-5" /> Print PDF
            </button>
          </div>
        </div>

        {/* Selection Card */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-end bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/40 shadow-xl shadow-slate-900/5 group relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -ml-16 -mt-16 pointer-events-none"></div>

          <div className="relative z-10">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Select Examination</label>
            <div className="relative group/select">
              <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover/select:text-indigo-500 transition-colors pointer-events-none" />
              <select
                className="w-full pl-12 pr-10 py-4 bg-white/50 backdrop-blur-md border border-white/60 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-700 font-bold text-lg appearance-none cursor-pointer transition-all hover:bg-white/80 shadow-sm"
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
              >
                {exams.length === 0 && <option value="">No exams scheduled</option>}
                {exams.map(e => (
                  <option key={e.id} value={e.id}>
                    {e.subjectCode} - {e.subjectName}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90 pointer-events-none group-hover/select:text-indigo-500 transition-colors" />
            </div>
          </div>

          <div className="relative z-10 h-full flex items-end">
            {currentSeating ? (
              <div className="w-full flex items-center px-6 py-4 bg-emerald-500/10 text-emerald-800 rounded-xl border border-emerald-500/20 text-sm font-bold shadow-sm backdrop-blur-md">
                <CheckCircle className="w-6 h-6 mr-4 text-emerald-600" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-emerald-600 uppercase tracking-wider leading-none mb-1">Status</span>
                  <span className="text-base">Ready • Generated {new Date(currentSeating.generatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div className="w-full flex items-center px-6 py-4 bg-slate-100/50 text-slate-500 rounded-xl border border-slate-200/60 text-sm font-medium italic backdrop-blur-md">
                No plan generated yet. Select an exam to begin.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="no-print">
        <Alert alert={message} onClose={() => setMessage(null)} />
      </div>

      {!currentSeating && selectedExam && (
        <div className="text-center py-24 bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/10 rounded-[2rem] no-print animate-fade-in hover:bg-white/10 transition-all duration-500 group">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
            <Layers className="w-10 h-10 text-slate-400 group-hover:text-indigo-400 transition-colors" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Ready to Generate</h3>
          <p className="text-slate-400 max-w-md mx-auto mt-2 text-lg font-medium leading-relaxed">
            Engine is ready. Click the generate button to distribute students across active rooms.
          </p>
        </div>
      )}

      {/* VISUALIZATION & PRINT AREA */}
      {currentSeating && selectedExam && (
        <div className="space-y-12 print:space-y-0 print:block">
          {Object.keys(assignmentsByRoom).sort().map((roomId, idx) => {
            const roomAssignments = assignmentsByRoom[roomId];
            const roomNumber = roomAssignments[0].roomNumber;

            return (
              <div
                key={roomId}
                className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl shadow-slate-900/10 border border-white/60 print:shadow-none print:border-none print:p-0 print:rounded-none print-break-before animate-slide-up relative overflow-hidden"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none no-print"></div>

                {/* Print Header */}
                <div className="border-b-2 border-slate-900/10 pb-8 mb-8 flex justify-between items-end relative z-10">
                  <div>
                    <div className="flex items-center gap-4 mb-3">
                      <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Room {roomNumber}</h2>
                      <div className="no-print px-4 py-1 bg-indigo-500/10 rounded-lg text-xs font-bold uppercase tracking-wide text-indigo-700 border border-indigo-500/20">
                        Hall View
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-2xl font-bold text-slate-700">
                        {selectedExam.subjectName} <span className="text-slate-400 font-medium">({selectedExam.subjectCode})</span>
                      </p>
                      <div className="flex items-center text-sm font-bold text-slate-500 gap-4">
                        <span className="flex items-center bg-slate-100/80 px-2 py-1 rounded"><div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>{selectedExam.examDate}</span>
                        <span className="flex items-center bg-slate-100/80 px-2 py-1 rounded"><div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>{selectedExam.startTime} - {selectedExam.endTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl inline-block text-center min-w-[140px] print:bg-white print:text-black print:border-2 print:border-black shadow-xl shadow-slate-900/20">
                      <span className="block text-4xl font-extrabold leading-none mb-1">{roomAssignments.length}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Students</span>
                    </div>
                  </div>
                </div>

                {/* Classroom Table */}
                <div className="bg-white/50 backdrop-blur-sm p-8 rounded-3xl border border-white/60 print:bg-transparent print:p-0 print:border-none relative z-10 shadow-inner">
                  <table className="w-full text-left border-collapse">
                    <thead className="border-b border-slate-200/60">
                      <tr>
                        <th className="p-4 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Seat</th>
                        <th className="p-4 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Enrollment No</th>
                        <th className="p-4 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Student Name</th>
                        <th className="p-4 text-xs font-extrabold text-slate-500 uppercase tracking-widest">Branch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/40">
                      {roomAssignments.map((assignment) => (
                        <tr key={assignment.studentId} className="hover:bg-white/60 transition-colors">
                          <td className="p-4 text-sm font-bold text-slate-800">{assignment.seatNumber}</td>
                          <td className="p-4 text-sm font-mono font-bold text-indigo-900 bg-indigo-50/50 rounded w-fit inline-block my-2 px-2 border border-indigo-100/50">{assignment.studentId}</td>
                          <td className="p-4 text-sm font-medium text-slate-700">{assignment.studentName}</td>
                          <td className="p-4">
                            <span className="inline-flex px-3 py-1 rounded-lg text-[10px] font-bold uppercase bg-white border border-slate-200 shadow-sm text-slate-600">
                              {assignment.branch}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Print Footer */}
                <div className="mt-16 pt-8 border-t border-slate-200/60 flex justify-between items-center text-xs text-slate-400 print:text-slate-600 print:border-slate-400 relative z-10">
                  <div className="flex items-center">
                    <span className="font-bold mr-3 text-slate-600 uppercase tracking-widest">VIVA Exam Manager</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 mx-2"></span>
                    <span>System Generated on {new Date(currentSeating.generatedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-20 text-right">
                    <div>
                      <div className="h-px w-40 bg-slate-300 mb-2"></div>
                      <p className="font-bold text-[10px] uppercase tracking-wider text-slate-500">Invigilator Name</p>
                    </div>
                    <div>
                      <div className="h-px w-40 bg-slate-300 mb-2"></div>
                      <p className="font-bold text-[10px] uppercase tracking-wider text-slate-500">Signature</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Seating;