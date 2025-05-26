import React, { useState, useEffect } from 'react';
import { getChatRooms, createChatRoom, deleteRoom } from '../services/firebase';
import { useUser } from '../contexts/UserContext';
import { ChatRoom } from '../utils/types';
import { PlusCircle, MessageSquare, Search, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

interface ChatRoomListProps {
  onRoomSelect: (room: ChatRoom) => void;
  selectedRoomId: string | null;
}

const ChatRoomList: React.FC<ChatRoomListProps> = ({ onRoomSelect, selectedRoomId }) => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showRooms, setShowRooms] = useState(true);
  const { user } = useUser();

  useEffect(() => {
    getChatRooms((roomList) => {
      setRooms(roomList);
      setLoading(false);
    });
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newRoomName.trim()) {
      setLoading(true);
      try {
        const roomId = await createChatRoom(newRoomName.trim(), user.id);
        setNewRoomName('');
        setIsCreating(false);
      } catch (error) {
        console.error('Error creating room:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (window.confirm('Are you sure you want to delete this room? This action cannot be undone.')) {
      try {
        await deleteRoom(roomId);
        if (selectedRoomId === roomId) {
          onRoomSelect(rooms[0]);
        }
      } catch (error) {
        console.error('Error deleting room:', error);
      }
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 h-full flex flex-col transition-all duration-300 ${showRooms ? 'md:h-full' : 'md:h-16'}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Chat Rooms</h2>
          <button
            onClick={() => setShowRooms(!showRooms)}
            className="md:hidden text-gray-600 dark:text-gray-400"
          >
            {showRooms ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-300"
          aria-label="Create new room"
        >
          <PlusCircle size={20} />
        </button>
      </div>

      {(showRooms || window.innerWidth >= 768) && (
        <>
          <div className="relative mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms..."
              className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white text-sm"
            />
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>

          {isCreating && (
            <form onSubmit={handleCreateRoom} className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="Room name"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white text-sm"
                  required
                />
                <button
                  type="submit"
                  className="bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 rounded-md text-sm"
                  disabled={loading}
                >
                  Create
                </button>
              </div>
            </form>
          )}

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-violet-700"></div>
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-6">
                <p>No chat rooms found</p>
                <p className="text-sm mt-1">Try a different search or create a new room</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {filteredRooms.map((room) => (
                  <li key={room.id} className="flex items-center justify-between">
                    <button
                      onClick={() => onRoomSelect(room)}
                      className={`flex-1 text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors ${
                        selectedRoomId === room.id
                          ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-800 dark:text-violet-200'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <MessageSquare size={16} className={selectedRoomId === room.id ? 'text-violet-600 dark:text-violet-400' : 'text-gray-500 dark:text-gray-400'} />
                      <span className="truncate">{room.name}</span>
                    </button>
                    {room.createdBy === user.id && (
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        aria-label="Delete room"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatRoomList;