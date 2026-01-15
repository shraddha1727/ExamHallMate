import React, { useState, useEffect } from 'react';
import { Room } from '../types';
import { fetchRoomsApi, saveRoomApi, deleteRoomApi } from '../services/rooms';
import Alert from '../components/Alert';
import { Plus, Trash2, Edit2, LayoutGrid, Users, School, CheckCircle2 } from 'lucide-react';

const Rooms: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<Partial<Room>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    try {
      const data = await fetchRoomsApi();
      setRooms(data);
    } catch (error) {
      setMessage({ type: 'error', message: 'Failed to load rooms from server.' });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoom.roomNumber || !currentRoom.capacity) return;

    const roomToSave: Partial<Room> = {
      ...currentRoom,
      capacity: Number(currentRoom.capacity),
    };

    if (!roomToSave.id) {
      delete roomToSave.id;
    }

    try {
      await saveRoomApi(roomToSave as Room);
      setMessage({ type: 'success', message: 'Room configuration saved.' });
      setIsEditing(false);
      setCurrentRoom({});
      await loadRooms();
    } catch (error) {
      setMessage({ type: 'error', message: 'Failed to save room.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Confirm deletion of this room?')) return;
    try {
      await deleteRoomApi(id);
      await loadRooms();
    } catch (error) {
      setMessage({ type: 'error', message: 'Failed to delete room.' });
    }
  };

  const startEdit = (room: Room) => {
    setCurrentRoom(room);
    setIsEditing(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up pb-12">

      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200 relative">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 rounded-lg backdrop-blur-md border border-indigo-200">
              <School className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-indigo-600 font-bold uppercase tracking-widest text-xs">Infrastructure</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Room Configuration</h1>
          <p className="text-slate-500 mt-2 max-w-2xl text-lg font-medium">
            Define examination halls, set seating capacities, and manage active status for allocation.
          </p>
        </div>
        <button
          onClick={() => { setIsEditing(true); setCurrentRoom({ isActive: true }); }}
          className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all flex items-center gap-3 border border-transparent group"
        >
          <div className="bg-white/20 p-1 rounded-lg group-hover:bg-white/30 transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <span>Add New Room</span>
        </button>
      </div>

      <Alert alert={message} onClose={() => setMessage(null)} />

      {/* Modal Form */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-xl p-8 rounded-[2rem] border border-white/40 shadow-2xl shadow-slate-900/40 max-w-md w-full relative transform transition-all scale-100">
            <h3 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
              {currentRoom.id ? <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><Edit2 className="w-6 h-6" /></div> : <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600"><Plus className="w-6 h-6" /></div>}
              {currentRoom.id ? 'Edit Room Details' : 'Add New Room'}
            </h3>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="space-y-5">
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Room Number / Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A-101"
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-lg outline-none focus:border-indigo-500 focus:ring-0 transition-all placeholder:font-normal placeholder:text-slate-400"
                    value={currentRoom.roomNumber || ''}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, roomNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Seating Capacity</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      required
                      min="1"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold outline-none focus:border-indigo-500 focus:ring-0 transition-all"
                      value={currentRoom.capacity || ''}
                      onChange={(e) => setCurrentRoom({ ...currentRoom, capacity: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-slate-50/50 border border-slate-200/60 rounded-xl cursor-pointer hover:bg-white hover:shadow-md transition-all group" onClick={() => setCurrentRoom({ ...currentRoom, isActive: !currentRoom.isActive })}>
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center mr-4 transition-all duration-300 ${currentRoom.isActive ? 'bg-emerald-500 border-emerald-500 scale-110' : 'bg-white border-slate-300 group-hover:border-slate-400'}`}>
                  {currentRoom.isActive && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 cursor-pointer">
                    Active Status
                  </label>
                  <p className="text-xs text-slate-500 font-medium">Available for automatic seat allocation</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors flex-1">Cancel</button>
                <button type="submit" className="px-6 py-3.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors shadow-lg flex-1">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/10 rounded-[2.5rem] p-20 text-center hover:bg-white/10 transition-all duration-500 cursor-pointer group relative overflow-hidden" onClick={() => { setIsEditing(true); setCurrentRoom({ isActive: true }); }}>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform duration-500 shadow-2xl border border-white/10">
              <LayoutGrid className="w-10 h-10 text-slate-400 group-hover:text-emerald-400 transition-colors" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">No Rooms Configured</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-8 text-lg font-medium">
              Your infrastructure list is empty. Add rooms to this list so the system can assign seats.
            </p>
            <button className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all hover:-translate-y-1">
              <Plus className="w-5 h-5" /> Create First Room
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white/60 backdrop-blur-xl p-8 rounded-[2rem] border border-white/40 shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 blur-2xl ${room.isActive ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>

              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-md shadow-sm border border-white/60 flex items-center justify-center font-bold text-xl text-slate-700 group-hover:text-indigo-600 transition-colors">
                  {room.roomNumber.replace(/[^0-9]/g, '') || <LayoutGrid className="w-6 h-6" />}
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest border ${room.isActive ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20' : 'bg-slate-500/10 text-slate-600 border-slate-500/20'}`}>
                  {room.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mb-8 relative z-10">
                <h3 className="text-2xl font-extrabold text-slate-800 mb-2">{room.roomNumber}</h3>
                <div className="flex items-center text-slate-500 text-sm font-medium">
                  <Users className="w-4 h-4 mr-2 text-indigo-400" />
                  <span className="font-bold text-slate-700 mr-1">{room.capacity}</span> Max Capacity
                </div>
              </div>

              <div className="flex gap-3 pt-6 border-t border-slate-200/50 relative z-10">
                <button
                  onClick={() => startEdit(room)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-white/50 hover:bg-white rounded-xl hover:text-indigo-600 hover:shadow-md border border-white/60 transition-all uppercase tracking-wide"
                >
                  Edit Details
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-400 bg-white/50 border border-white/60 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all hover:shadow-md"
                  title="Delete Room"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;