import React, { useState, useEffect } from 'react';
import { Room } from '../types';
import { fetchRoomsApi, saveRoomApi, deleteRoomApi } from '../services/rooms';
import Alert from '../components/Alert';
import { Plus, Trash2, Edit2, LayoutGrid } from 'lucide-react';

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

    // If it's a new room, don't send an id.
    if (!roomToSave.id) {
      delete roomToSave.id;
    }

    try {
      await saveRoomApi(roomToSave);
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
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Room Configuration</h1>
          <p className="text-sm text-slate-500 mt-1">Manage examination halls and capacities.</p>
        </div>
        <button
          onClick={() => { setIsEditing(true); setCurrentRoom({ isActive: true }); }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Room
        </button>
      </div>

      <Alert alert={message} onClose={() => setMessage(null)} />

      {/* Modal Form */}
      {isEditing && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded border border-slate-200 shadow-xl max-w-lg w-full">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{currentRoom.id ? 'Edit Room' : 'Add New Room'}</h3>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Room Number</label>
                  <input
                    type="text"
                    required
                    className="input-field font-bold"
                    value={currentRoom.roomNumber || ''}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, roomNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Capacity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    className="input-field"
                    value={currentRoom.capacity || ''}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, capacity: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-slate-50 border border-slate-200 rounded">
                  <input
                    type="checkbox"
                    id="isActive"
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    checked={currentRoom.isActive ?? true}
                    onChange={(e) => setCurrentRoom({ ...currentRoom, isActive: e.target.checked })}
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-slate-700">
                    Room is Active (Available for Seating)
                  </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button type="submit" className="btn-primary flex-1">Save Room</button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {rooms.length === 0 ? (
        <div className="bg-white border border-slate-200 border-dashed rounded p-12 text-center">
          <LayoutGrid className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700">No Rooms Found</h3>
          <p className="text-slate-500 text-sm mt-2">Add rooms to begin seating configuration.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {rooms.map((room) => (
            <div key={room.id} className="bg-white p-5 rounded border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-bold text-slate-800">{room.roomNumber}</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${room.isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                  {room.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <div className="text-sm text-slate-600 mb-4">
                Capacity: <span className="font-bold text-slate-900">{room.capacity}</span> Seats
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-50">
                <button
                  onClick={() => startEdit(room)}
                  className="flex-1 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 rounded hover:bg-blue-100 border border-blue-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(room.id)}
                  className="px-3 py-1.5 text-xs font-bold text-red-600 bg-white border border-slate-200 rounded hover:bg-red-50 hover:border-red-100"
                >
                  <Trash2 className="w-3 h-3" />
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