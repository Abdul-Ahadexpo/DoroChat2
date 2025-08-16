import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { getSavedRooms, removeSavedRoom } from '../utils/storage';
import { Settings, Save, Trash2, Bookmark } from 'lucide-react';

const fontStyles = [
  { name: 'Normal', value: 'normal' },
  { name: 'Bold', value: 'font-bold' },
  { name: 'Italic', value: 'italic' },
  { name: 'Underline', value: 'underline' },
  { name: 'Bold Italic', value: 'font-bold italic' },
];

const colors = [
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Teal', value: '#14B8A6' },
];

const UserSettings: React.FC = () => {
  const { user, updateUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [color, setColor] = useState(user.color);
  const [fontStyle, setFontStyle] = useState(user.fontStyle);
  const [savedRooms, setSavedRooms] = useState(getSavedRooms());
  const [activeTab, setActiveTab] = useState<'profile' | 'rooms'>('profile');

  const toggleSettings = () => {
    setIsOpen(!isOpen);
    // Reset form values to current user settings when opening
    if (!isOpen) {
      setName(user.name);
      setColor(user.color);
      setFontStyle(user.fontStyle);
      setSavedRooms(getSavedRooms());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, color, fontStyle });
    setIsOpen(false);
  };

  const handleRemoveSavedRoom = (roomId: string) => {
    removeSavedRoom(roomId);
    setSavedRooms(getSavedRooms());
  };

  return (
    <div className="relative">
      <button 
        onClick={toggleSettings}
        className="flex items-center gap-2 bg-violet-100 dark:bg-violet-900/30 text-violet-800 dark:text-violet-300 p-2 rounded-full hover:bg-violet-200 dark:hover:bg-violet-800/50 transition-colors"
        aria-label="User Settings"
      >
        <Settings size={20} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 z-50 border border-gray-200 dark:border-gray-700 transition-all duration-300 transform animate-in slide-in-from-top-2">
          <div className="flex mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'profile'
                  ? 'bg-white dark:bg-gray-600 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab('rooms')}
              className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'rooms'
                  ? 'bg-white dark:bg-gray-600 text-violet-600 dark:text-violet-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              Saved Rooms
            </button>
          </div>

          {activeTab === 'profile' ? (
          <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">User Settings</h3>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
                maxLength={20}
                required
              />
            </div>
            
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`w-6 h-6 rounded-full ${color === c.value ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
                    style={{ backgroundColor: c.value }}
                    aria-label={`Color: ${c.name}`}
                  />
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Font Style
              </label>
              <select
                value={fontStyle}
                onChange={(e) => setFontStyle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white"
              >
                {fontStyles.map((style) => (
                  <option key={style.value} value={style.value}>
                    {style.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                <Save size={16} />
                Save
              </button>
            </div>
          </form>
          ) : (
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Bookmark size={18} />
                Saved Rooms
              </h3>
              
              {Object.keys(savedRooms).length === 0 ? (
                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                  <Bookmark size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No saved rooms yet</p>
                  <p className="text-xs mt-1">Save rooms to access them quickly!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {Object.entries(savedRooms).map(([roomId, roomData]) => (
                    <div
                      key={roomId}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {roomData.name}
                        </p>
                        {roomData.password && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">Protected</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveSavedRoom(roomId)}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 transition-colors duration-200"
                        aria-label="Remove saved room"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserSettings;