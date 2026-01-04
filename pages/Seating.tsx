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
          fetchStudentsAllApi(), // Changed to fetchStudentsAllApi
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
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="no-print card-base p-8 animate-slide-up">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Seating Allocation</h1>
              <p className="text-slate-500 font-medium mt-2">Generate and visualize student distribution.</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleGenerate}
                disabled={!selectedExamId}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500" /> 
                {currentSeating ? 'Regenerate Plan' : 'Generate Plan'}
              </button>
              <button 
                onClick={() => window.print()}
                disabled={!currentSeating}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Printer className="w-4 h-4 mr-2" /> Print PDF
              </button>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
           <div>
              <label className="block text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-2 ml-1">Select Examination</label>
              <div className="relative group">
                <select 
                  className="w-full h-14 pl-5 pr-10 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-700 font-bold appearance-none cursor-pointer shadow-sm transition-all hover:border-brand-300"
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
                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 rotate-90 pointer-events-none group-hover:text-brand-500 transition-colors" />
              </div>
           </div>
           
           <div>
              {currentSeating ? (
                <div className="w-full h-14 flex items-center px-6 bg-emerald-50/80 text-emerald-800 rounded-xl border border-emerald-100 text-sm font-bold shadow-sm">
                  <CheckCircle className="w-5 h-5 mr-3 text-emerald-500" />
                  <div>
                    <span className="block text-xs text-emerald-600 uppercase tracking-wider">Status</span>
                    Generated {new Date(currentSeating.generatedAt).toLocaleDateString()}
                  </div>
                </div>
              ) : (
                <div className="w-full h-14 flex items-center px-6 bg-slate-100 text-slate-400 rounded-xl border border-slate-200 text-sm font-medium italic">
                  No plan generated yet.
                </div>
              )}
           </div>
         </div>
      </div>

      <div className="no-print">
        <Alert alert={message} onClose={() => setMessage(null)} />
      </div>

      {!currentSeating && selectedExam && (
        <div className="text-center py-24 card-base border-dashed border-2 border-slate-200 no-print animate-fade-in">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
             <Layers className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Ready to Generate</h3>
          <p className="text-slate-400 max-w-sm mx-auto mt-2 leading-relaxed">
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
                className="card-base p-10 print:shadow-none print:border-none print-break-before print:p-0 print:mb-0 print:rounded-none animate-slide-up" 
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                {/* Print Header */}
                <div className="border-b-2 border-slate-900 pb-6 mb-8 flex justify-between items-end">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Room {roomNumber}</h2>
                       <div className="no-print px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-wide text-slate-500 border border-slate-200">
                         Hall View
                       </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-slate-700">
                        {selectedExam.subjectName} <span className="text-slate-400 font-normal">({selectedExam.subjectCode})</span>
                      </p>
                      <div className="flex items-center text-sm font-semibold text-slate-500 gap-4">
                        <span className="flex items-center"><div className="w-2 h-2 bg-brand-500 rounded-full mr-2"></div>{selectedExam.examDate}</span>
                        <span className="flex items-center"><div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>{selectedExam.startTime} - {selectedExam.endTime}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-slate-900 text-white px-5 py-3 rounded-xl inline-block text-center min-w-[120px] print:bg-white print:text-black print:border-2 print:border-black shadow-lg shadow-slate-900/20">
                      <span className="block text-3xl font-extrabold leading-none">{roomAssignments.length}</span>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Students</span>
                    </div>
                  </div>
                </div>

                {/* Classroom Table */}
                <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 print:bg-transparent print:p-0 print:border-none">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white border-b border-slate-200">
                      <tr>
                        <th className="p-2 text-xs font-bold text-slate-500 uppercase">Seat</th>
                        <th className="p-2 text-xs font-bold text-slate-500 uppercase">Enrollment No</th>
                        <th className="p-2 text-xs font-bold text-slate-500 uppercase">Student Name</th>
                        <th className="p-2 text-xs font-bold text-slate-500 uppercase">Branch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {roomAssignments.map((assignment) => (
                        <tr key={assignment.studentId} className="hover:bg-white">
                          <td className="p-2 text-xs font-bold text-slate-800">{assignment.seatNumber}</td>
                          <td className="p-2 text-xs font-mono text-slate-700">{assignment.studentId}</td>
                          <td className="p-2 text-xs text-slate-800">{assignment.studentName}</td>
                          <td className="p-2">
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600 border border-slate-200">
                              {assignment.branch}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Print Footer */}
                <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 print:text-slate-600 print:border-slate-400">
                  <div className="flex items-center">
                    <span className="font-bold mr-2 text-slate-600">VIVA Exam Manager</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 mx-2"></span>
                    <span>System Generated on {new Date(currentSeating.generatedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-16 text-right">
                    <div>
                      <div className="h-px w-32 bg-slate-300 mb-2"></div>
                      <p className="font-bold text-[10px] uppercase tracking-wider">Invigilator Name</p>
                    </div>
                    <div>
                      <div className="h-px w-32 bg-slate-300 mb-2"></div>
                      <p className="font-bold text-[10px] uppercase tracking-wider">Signature</p>
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