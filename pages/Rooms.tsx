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
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-2 text-university-600 font-bold uppercase tracking-wider text-xs">
            <School className="w-4 h-4" /> Infrastructure
          </div>
          <h1 className="text-3xl font-bold text-slate-800">Room Configuration</h1>
          <p className="text-slate-500 mt-2 max-w-2xl">
            Define examination halls, set seating capacities, and manage active status for allocation.
          </p>
        </div>
        <button
          onClick={() => { setIsEditing(true); setCurrentRoom({ isActive: true }); }}
          className="btn-primary shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Room
        </button>
      </div>

      <Alert alert={message} onClose={() => setMessage(null)} />

      {/* Modal Form */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full relative">
            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              {currentRoom.id ? <Edit2 className="w-5 h-5 text-university-600" /> : <Plus className="w-5 h-5 text-university-600" />}
              {currentRoom.id ? 'Edit Room Details' : 'Add New Room'}
            </h3>

            <form onSubmit={handleSave} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Room Number / Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. A-101"
                    className="input-field font-bold text-lg p-3"
                    value={currentRoom.roomNumber || ''}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, roomNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Seating Capacity</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <input
                      type="number"
                      required
                      min="1"
                      className="input-field pl-10"
                      value={currentRoom.capacity || ''}
                      onChange={(e) => setCurrentRoom({ ...currentRoom, capacity: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:border-university-200 transition-colors" onClick={() => setCurrentRoom({ ...currentRoom, isActive: !currentRoom.isActive })}>
                <div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${currentRoom.isActive ? 'bg-university-600 border-university-600' : 'bg-white border-slate-300'}`}>
                  {currentRoom.isActive && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 cursor-pointer">
                    Active Status
                  </label>
                  <p className="text-xs text-slate-500">Available for automatic seat allocation</p>
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-white text-slate-700 font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors flex-1">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-university-900 text-white font-bold rounded-lg hover:bg-university-800 transition-colors shadow-md flex-1">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-16 text-center hover:border-university-200 hover:bg-slate-50 transition-all group cursor-pointer" onClick={() => { setIsEditing(true); setCurrentRoom({ isActive: true }); }}>
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-white group-hover:text-university-500 group-hover:scale-110 transition-all shadow-inner">
            <LayoutGrid className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">No Rooms Configured</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-6">
            Your infrastructure list is empty. Add rooms to this list so the system can assign seats.
          </p>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-university-600 text-white rounded-lg font-bold shadow-md hover:bg-university-700 transition-all">
            <Plus className="w-4 h-4" /> Create First Room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-university-200 transition-all group relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-16 h-16 -mr-4 -mt-4 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-500 ${room.isActive ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-lg text-slate-700 group-hover:bg-university-50 group-hover:text-university-700 group-hover:border-university-100 transition-colors">
                  {room.roomNumber.replace(/[^0-9]/g, '') || <LayoutGrid className="w-5 h-5" />}
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${room.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  {room.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="mb-6 relative z-10">
                <h3 className="text-lg font-bold text-slate-800 mb-1">{room.roomNumber}</h3>
                <div className="flex items-center text-slate-500 text-sm">
                  <Users className="w-4 h-4 mr-1.5" />
                  <span className="font-semibold text-slate-700 mr-1">{room.capacity}</span> Max Capacity
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-slate-50 relative z-10">
                <button
                  onClick={() => startEdit(room)}
                  className="flex-1 py-2 text-xs font-bold text-slate-600 bg-slate-50 rounded-lg hover:bg-white hover:text-university-600 hover:shadow-sm border border-transparent hover:border-slate-200 transition-all"
                >
                  Edit Details
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="px-3 py-2 text-xs font-bold text-slate-400 bg-white border border-transparent rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
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