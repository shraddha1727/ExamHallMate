import React, { useEffect, useState } from 'react';
import { fetchInvigilationsApi } from '../services/invigilation';
import { fetchExamsApi } from '../services/exams';
import { fetchRoomsApi } from '../services/rooms';
import { fetchSeatingApi } from '../services/seating';
import { getCurrentUser } from '../services/auth';
import { Invigilation, Exam, Room, SeatAssignment } from '../types';
import { Printer, RefreshCw } from 'lucide-react';

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Rooms</h1>
          <p className="text-slate-500">View and print seating arrangements for your assigned rooms.</p>
        </div>
        <div>
          <button 
            onClick={() => window.print()}
            disabled={!currentSelection || seatings.length === 0}
            className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 rounded-lg flex items-center shadow-md disabled:opacity-50 transition-colors font-medium"
          >
            <Printer className="w-4 h-4 mr-2" /> Print Seating Sheet
          </button>
        </div>
      </div>

      {/* Selector */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 no-print">
        <label className="block text-sm font-bold text-slate-700 mb-2">Select Assigned Room</label>
        <select 
          className="w-full p-3 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50"
          value={selectedInvigId}
          onChange={(e) => setSelectedInvigId(e.target.value)}
        >
          {assignments.length === 0 && <option>No duties assigned</option>}
          {assignments.map(a => (
            <option key={a.id} value={a.id}>
              {a.exam.examDate} | {a.exam.subjectName} | Room {a.room.roomNumber} ({a.dutyType})
            </option>
          ))}
        </select>
      </div>

      {/* Seating View */}
      {currentSelection && (
        <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-none print:p-0">
          <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-end">
             <div>
                <h2 className="text-3xl font-bold text-slate-900">Room {currentSelection.room.roomNumber}</h2>
                <p className="text-lg font-semibold text-slate-700 mt-1">
                   {currentSelection.exam.subjectCode} - {currentSelection.exam.subjectName}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                   <span className="font-bold text-slate-700">Date:</span> {currentSelection.exam.examDate} &nbsp;|&nbsp; 
                   <span className="font-bold text-slate-700">Time:</span> {currentSelection.exam.startTime} - {currentSelection.exam.endTime}
                </p>
             </div>
             <div className="text-right">
                <div className="text-2xl font-bold text-slate-900">{seatings.length}</div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Students</p>
             </div>
          </div>

          {seatings.length === 0 ? (
            <div className="py-10 text-center text-slate-400 italic border-2 border-dashed border-slate-100 rounded-lg">
              No seating arrangement generated for this exam yet.
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4 print:gap-4 print:text-xs">
              {seatings.map((seat) => (
                <div 
                  key={seat.studentId} 
                  className="border border-slate-200 p-3 rounded-lg text-center relative bg-slate-50 print:bg-white print:border-slate-400 print:rounded-none"
                >
                  <div className="absolute top-1 right-2 text-[10px] font-bold text-slate-400 print:text-slate-600">
                    S{seat.seatNumber}
                  </div>
                  <div className="mt-2">
                     <p className="text-sm font-mono font-bold text-slate-900">{seat.studentId}</p>
                     <p className="text-xs text-slate-600 truncate mt-0.5">{seat.studentName}</p>
                     <span className="inline-block mt-2 px-1.5 py-0.5 bg-white border border-slate-200 text-[9px] font-bold text-slate-500 rounded uppercase print:border-slate-300">
                       {seat.branch}
                     </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-10 pt-4 border-t border-slate-100 flex justify-between text-xs text-slate-400 print:text-slate-500 print:border-slate-300">
             <p>VIVA Exam Manager • Printed by Staff</p>
             <div className="text-right">
               <p className="mb-4">Supervisor Signature: _______________________</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRooms;
