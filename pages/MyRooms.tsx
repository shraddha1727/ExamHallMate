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
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-12">

      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 relative no-print">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg backdrop-blur-md border border-indigo-200">
              <MapPin className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Duty Management</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">My Exam Halls</h1>
          <p className="text-slate-500 mt-2 max-w-2xl text-lg font-medium">
            View student lists and seating arrangements for your assigned rooms.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          disabled={!currentSelection || seatings.length === 0}
          className="px-6 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg shadow-black/20 hover:shadow-black/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 border border-transparent"
        >
          <Printer className="w-5 h-5" /> Print Seating Sheet
        </button>
      </div>

      {/* Selector */}
      <div className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl shadow-slate-900/5 border border-white/40 no-print relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full -mr-16 -mt-16 z-0 pointer-events-none transition-transform duration-700 group-hover:scale-150"></div>
        <div className="relative z-10 max-w-2xl">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 ml-1">Select Assigned Duty</label>
          <div className="relative group/select">
            <select
              className="w-full pl-6 pr-12 py-4 border border-white/60 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white/50 backdrop-blur-md text-slate-700 font-bold text-lg appearance-none cursor-pointer transition-all hover:bg-white/80 shadow-sm"
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
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none group-hover/select:text-indigo-500 transition-colors" />
          </div>
        </div>
      </div>

      {/* Seating View */}
      {currentSelection && (
        <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl shadow-slate-900/10 border border-white/60 print:shadow-none print:border-none print:p-0 print:rounded-none overflow-hidden relative">
          {/* Decorative Background for screen only */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none no-print"></div>

          <div className="border-b-2 border-slate-900/10 pb-8 mb-8 flex justify-between items-end relative z-10">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Room {currentSelection.room.roomNumber}</h2>
                <div className="no-print px-3 py-1 bg-indigo-50 rounded-lg text-[10px] font-bold uppercase tracking-wide text-indigo-600 border border-indigo-100">
                  Internal View
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-2xl font-bold text-slate-700">
                  {currentSelection.exam.subjectName} <span className="text-slate-400 font-medium">({currentSelection.exam.subjectCode})</span>
                </p>
                <div className="flex items-center text-sm font-bold text-slate-500 gap-6">
                  <span className="flex items-center bg-slate-100 px-2 py-1 rounded-md"><Calendar className="w-4 h-4 mr-2 text-slate-400" />{new Date(currentSelection.exam.examDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  <span className="flex items-center bg-slate-100 px-2 py-1 rounded-md"><Clock className="w-4 h-4 mr-2 text-slate-400" />{currentSelection.exam.startTime} - {currentSelection.exam.endTime}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl inline-block text-center min-w-[140px] print:bg-white print:text-black print:border-2 print:border-black shadow-xl shadow-slate-900/20">
                <span className="block text-4xl font-extrabold leading-none mb-1">{seatings.length}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Students Assigned</span>
              </div>
            </div>
          </div>

          {seatings.length === 0 ? (
            <div className="py-24 text-center border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/30">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                <LayoutGrid className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-700">Seating Not Available</h3>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">
                The seating arrangement for this exam has not been generated or published yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 print:grid-cols-5 print:gap-3 relative z-10">
              {seatings.map((seat) => (
                <div
                  key={seat.studentId}
                  className="group relative bg-white/60 hover:bg-white border border-white/50 hover:border-indigo-200 p-5 rounded-2xl text-center transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 print:bg-white print:border-slate-300 print:rounded-lg print:shadow-none print:p-2 print:hover:translate-y-0"
                >
                  <div className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 text-[10px] font-bold text-slate-400 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-colors print:border-slate-200">
                    {seat.seatNumber}
                  </div>
                  <div className="mt-2">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 mx-auto mb-3 flex items-center justify-center text-slate-500 font-bold text-sm group-hover:bg-gradient-to-br group-hover:from-indigo-500 group-hover:to-blue-600 group-hover:text-white transition-all shadow-inner group-hover:shadow-lg print:hidden">
                      {seat.studentName.charAt(0)}
                    </div>
                    <p className="text-xs font-mono font-bold text-slate-900 bg-slate-100/50 inline-block px-1.5 rounded">{seat.studentId}</p>
                    <p className="text-[11px] text-slate-600 truncate mt-2 font-bold group-hover:text-indigo-900">{seat.studentName}</p>
                    <span className="inline-block mt-2 px-2 py-0.5 bg-white border border-slate-100 text-[9px] font-bold text-slate-400 rounded-md uppercase print:border-slate-300 group-hover:border-indigo-100 group-hover:text-indigo-500">
                      {seat.branch}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-16 pt-8 border-t border-slate-200/60 flex justify-between items-center text-xs text-slate-400 print:text-slate-600 print:border-slate-400">
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-600 uppercase tracking-widest">VIVA Exam Manager</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span>Official Seating Document</span>
            </div>
            <div className="text-right flex gap-12">
              <div>
                <div className="h-px w-40 bg-slate-300 mb-2"></div>
                <p className="font-bold text-[10px] uppercase tracking-wider text-slate-500">Supervisor Signature</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRooms;
