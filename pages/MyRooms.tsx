import React, { useEffect, useState } from 'react';
import { fetchInvigilationsApi } from '../services/invigilation';
import { fetchExamsApi } from '../services/exams';
import { fetchRoomsApi } from '../services/rooms';
import { fetchSeatingApi } from '../services/seating';
import { getCurrentUser } from '../services/auth';
import { Invigilation, Exam, Room, SeatAssignment } from '../types';
import { Printer, RefreshCw, LayoutGrid, CheckCircle, MapPin, Calendar, Clock, ChevronDown } from 'lucide-react';

const MyRooms: React.FC = () => {
  const [assignments, setAssignments] = useState<(Invigilation & { exam: Exam; room: Room })[]>([]);
  const [selectedInvigId, setSelectedInvigId] = useState<string>('');
  const [seatings, setSeatings] = useState<SeatAssignment[]>([]);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const userId = getCurrentUser();
        const [invigilations, exams, rooms] = await Promise.all([
          fetchInvigilationsApi(),
          fetchExamsApi(),
          fetchRoomsApi(),
        ]);

        const userDuties = invigilations.filter(i => i.teacherId === userId);

        const data = userDuties.map(i => ({
          ...i,
          exam: exams.find(e => e.id === i.examId)!,
          room: rooms.find(r => r.id === i.roomId)!
        })).filter(d => d.exam && d.room);

        setAssignments(data);
        if (data.length > 0) {
          setSelectedInvigId(data[0].id);
        }
      } catch (error) {
        console.error("Failed to load assignments:", error);
      }
    };

    loadAssignments();
  }, []);

  useEffect(() => {
    const loadSeating = async () => {
      if (selectedInvigId) {
        const invig = assignments.find(a => a.id === selectedInvigId);
        if (invig) {
          try {
            const fullSeating = await fetchSeatingApi(invig.examId);
            if (fullSeating) {
              const roomSeating = fullSeating.assignments.filter(s => s.roomId === invig.roomId);
              setSeatings(roomSeating);
            } else {
              setSeatings([]);
            }
          } catch (error) {
            setSeatings([]);
          }
        }
      }
    };
    loadSeating();
  }, [selectedInvigId, assignments]);

  const currentSelection = assignments.find(a => a.id === selectedInvigId);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200 no-print">
        <div>
          <div className="flex items-center gap-2 mb-2 text-university-600 font-bold uppercase tracking-wider text-xs">
            <MapPin className="w-4 h-4" /> Duty Management
          </div>
          <h1 className="text-3xl font-bold text-slate-800">My Exam Halls</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            View student lists and seating arrangements for your assigned rooms.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          disabled={!currentSelection || seatings.length === 0}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
        >
          <Printer className="w-4 h-4" /> Print Seating Sheet
        </button>
      </div>

      {/* Selector */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 no-print relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-full -mr-8 -mt-8 z-0"></div>
        <div className="relative z-10 max-w-xl">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Select Assigned Duty</label>
          <div className="relative">
            <select
              className="w-full pl-4 pr-10 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-university-500/20 focus:border-university-500 bg-slate-50 text-slate-700 font-bold appearance-none cursor-pointer transition-all hover:bg-white hover:border-university-300"
              value={selectedInvigId}
              onChange={(e) => setSelectedInvigId(e.target.value)}
            >
              {assignments.length === 0 && <option>No duties assigned</option>}
              {assignments.map(a => (
                <option key={a.id} value={a.id}>
                  {a.exam.examDate} — {a.exam.subjectName} (Room {a.room.roomNumber})
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Seating View */}
      {currentSelection && (
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:p-0 print:rounded-none overflow-hidden">
          <div className="border-b-2 border-slate-800 pb-6 mb-8 flex justify-between items-end">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">Room {currentSelection.room.roomNumber}</h2>
                <div className="no-print px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-wide text-slate-500 border border-slate-200">
                  Internal View
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xl font-bold text-slate-700">
                  {currentSelection.exam.subjectName} <span className="text-slate-400 font-normal">({currentSelection.exam.subjectCode})</span>
                </p>
                <div className="flex items-center text-sm font-semibold text-slate-500 gap-4">
                  <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-2" />{currentSelection.exam.examDate}</span>
                  <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-2" />{currentSelection.exam.startTime} - {currentSelection.exam.endTime}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-slate-900 text-white px-5 py-3 rounded-xl inline-block text-center min-w-[120px] print:bg-white print:text-black print:border-2 print:border-black shadow-lg shadow-slate-900/20">
                <span className="block text-3xl font-extrabold leading-none">{seatings.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">Students</span>
              </div>
            </div>
          </div>

          {seatings.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                <LayoutGrid className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">Seating Not Available</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                The seating arrangement for this exam has not been generated or published yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 print:grid-cols-5 print:gap-3">
              {seatings.map((seat) => (
                <div
                  key={seat.studentId}
                  className="group relative bg-slate-50 hover:bg-white border border-slate-200 hover:border-university-300 p-4 rounded-xl text-center transition-all hover:shadow-md print:bg-white print:border-slate-300 print:rounded-lg print:shadow-none print:p-2"
                >
                  <div className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-white text-[10px] font-bold text-slate-400 border border-slate-100 group-hover:border-university-100 group-hover:text-university-500 print:border-slate-200">
                    {seat.seatNumber}
                  </div>
                  <div className="mt-2">
                    <div className="w-10 h-10 rounded-full bg-slate-200 mx-auto mb-2 flex items-center justify-center text-slate-500 font-bold text-xs group-hover:bg-university-50 group-hover:text-university-600 transition-colors print:hidden">
                      {seat.studentName.charAt(0)}
                    </div>
                    <p className="text-xs font-mono font-bold text-slate-900">{seat.studentId}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-1 group-hover:text-slate-800 font-medium">{seat.studentName}</p>
                    <span className="inline-block mt-2 px-1.5 py-0.5 bg-white border border-slate-200 text-[9px] font-bold text-slate-400 rounded uppercase print:border-slate-300 group-hover:border-university-200 group-hover:text-university-600">
                      {seat.branch}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center text-xs text-slate-400 print:text-slate-600 print:border-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-600">VIVA Exam Manager</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Official Seating Document</span>
            </div>
            <div className="text-right flex gap-8">
              <div>
                <div className="h-px w-32 bg-slate-300 mb-2"></div>
                <p className="font-bold text-[10px] uppercase tracking-wider">Supervisor Signature</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRooms;
