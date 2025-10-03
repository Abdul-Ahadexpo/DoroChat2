import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  getSavedRooms, 
  removeSavedRoom, 
  getTheme, 
  setTheme,
  getNotificationSettings,
  setNotificationSettings,
  getChatSettings,
  setChatSettings,
  getPrivacySettings,
  setPrivacySettings,
  getBlockedUsers,
  unblockUser,
  getCustomStatus,
  setCustomStatus
} from '../utils/storage';
import { uploadImage } from '../utils/imgbb';
import { 
  Settings, 
  Save, 
  Trash2, 
  Bookmark, 
  Camera, 
  X, 
  User, 
  Bell, 
  MessageSquare, 
  Shield, 
  Palette, 
  Volume2,
  Eye,
  Clock,
  Smile,
  UserX,
  Download,
  Upload,
  RotateCcw
} from 'lucide-react';

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

const fontSizes = [
  { name: 'Small', value: 'small' },
  { name: 'Medium', value: 'medium' },
  { name: 'Large', value: 'large' },
  { name: 'Extra Large', value: 'xl' },
];

const themes = [
  { name: 'Auto (System)', value: 'auto' },
  { name: 'Light', value: 'light' },
  { name: 'Dark', value: 'dark' },
];

const statusEmojis = ['😀', '😎', '🚀', '💻', '🎮', '📚', '☕', '🎵', '🏃‍♂️', '😴', '🤔', '🎉'];

const UserSettings: React.FC = () => {
  const { user, updateUser } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(user.name);
  const [color, setColor] = useState(user.color);
  const [fontStyle, setFontStyle] = useState(user.fontStyle);
  const [savedRooms, setSavedRooms] = useState(getSavedRooms());
  const [activeTab, setActiveTab] = useState<'profile' | 'rooms' | 'appearance' | 'notifications' | 'chat' | 'privacy' | 'data'>('profile');
  const [profileImage, setProfileImage] = useState(user.profileImage || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [theme, setThemeState] = useState(getTheme());
  const [notificationSettings, setNotificationSettingsState] = useState(getNotificationSettings());
  const [chatSettings, setChatSettingsState] = useState(getChatSettings());
  const [privacySettings, setPrivacySettingsState] = useState(getPrivacySettings());
  const [blockedUsers, setBlockedUsers] = useState(getBlockedUsers());
  const [customStatus, setCustomStatusState] = useState(getCustomStatus());
  const [statusText, setStatusText] = useState(customStatus.text || '');
  const [statusEmoji, setStatusEmoji] = useState(customStatus.emoji || '');
  const [showStatusEmojis, setShowStatusEmojis] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

  const toggleSettings = () => {
    setIsOpen(!isOpen);
    // Reset form values to current user settings when opening
    if (!isOpen) {
      setName(user.name);
      setColor(user.color);
      setFontStyle(user.fontStyle);
      setProfileImage(user.profileImage || '');
      setSavedRooms(getSavedRooms());
      setThemeState(getTheme());
      setNotificationSettingsState(getNotificationSettings());
      setChatSettingsState(getChatSettings());
      setPrivacySettingsState(getPrivacySettings());
      setBlockedUsers(getBlockedUsers());
      const status = getCustomStatus();
      setCustomStatusState(status);
      setStatusText(status.text || '');
      setStatusEmoji(status.emoji || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser({ name, color, fontStyle, profileImage });
    // Also save the current user's status when updating profile
    if (statusText || statusEmoji) {
      const status = {
        text: statusText,
        emoji: statusEmoji,
        expiresAt: null
      };
      setCustomStatus(status, user.id);
      
      // Also save to Firebase for real-time sharing
      import('../services/firebase').then(({ setUserStatus }) => {
        setUserStatus(user.id, status);
      });
    }
    setIsOpen(false);
  };

  const handleRemoveSavedRoom = (roomId: string) => {
    removeSavedRoom(roomId);
    setSavedRooms(getSavedRooms());
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }
    
    setIsUploadingImage(true);
    
    try {
      const imageUrl = await uploadImage(file);
      setProfileImage(imageUrl);
    } catch (error) {
      console.error('Error uploading profile image:', error);
      alert(`Failed to upload image: ${error.message}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const removeProfileImage = () => {
    setProfileImage('');
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'auto') => {
    setThemeState(newTheme);
    setTheme(newTheme);
    
    // Apply theme immediately
    if (newTheme === 'auto') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.toggle('dark', prefersDark);
    } else {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
    }
  };

  const handleNotificationChange = (key: string, value: any) => {
    const updated = { ...notificationSettings, [key]: value };
    setNotificationSettingsState(updated);
    setNotificationSettings(updated);
    
    // Request permission if notifications are being enabled
    if (key === 'enabled' && value && 'Notification' in window) {
      Notification.requestPermission().then((permission) => {
        setNotificationPermission(permission);
      });
    }
  };

  const handleChatSettingChange = (key: string, value: any) => {
    const updated = { ...chatSettings, [key]: value };
    setChatSettingsState(updated);
    setChatSettings(updated);
  };

  const handlePrivacyChange = (key: string, value: any) => {
    const updated = { ...privacySettings, [key]: value };
    setPrivacySettingsState(updated);
    setPrivacySettings(updated);
  };

  const handleUnblockUser = (userId: string) => {
    unblockUser(userId);
    setBlockedUsers(getBlockedUsers());
  };

  const handleStatusSave = () => {
    const status = {
      text: statusText,
      emoji: statusEmoji,
      expiresAt: null
    };
    setCustomStatusState(status);
    setCustomStatus(status, user.id);
    
    // Also save to Firebase for real-time sharing
    import('../services/firebase').then(({ setUserStatus }) => {
      setUserStatus(user.id, status);
    });
  };

  const exportData = () => {
    const data = {
      user: user,
      savedRooms: getSavedRooms(),
      settings: {
        theme: getTheme(),
        notifications: getNotificationSettings(),
        chat: getChatSettings(),
        privacy: getPrivacySettings()
      },
      customStatus: getCustomStatus(),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `doro-chat-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'appearance', name: 'Theme', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'chat', name: 'Chat', icon: MessageSquare },
    { id: 'privacy', name: 'Privacy', icon: Shield },
    { id: 'rooms', name: 'Saved', icon: Bookmark },
    { id: 'data', name: 'Data', icon: Download },
  ];

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
        <div className="absolute right-0 top-full mt-2 w-96 max-w-[90vw] max-h-[85vh] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 transition-all duration-300 transform animate-in slide-in-from-top-2 z-50 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex overflow-x-auto scrollbar-hide border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1 px-2 py-3 text-xs font-medium whitespace-nowrap transition-all duration-200 border-b-2 flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'border-violet-500 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          <div className="p-4 overflow-y-auto flex-1 scrollbar-hide min-h-0">
            {activeTab === 'profile' && (
              <form onSubmit={handleSubmit}>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User size={20} />
                  Profile Settings
                </h3>
                
                {/* Custom Status */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Custom Status
                  </label>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowStatusEmojis(!showStatusEmojis)}
                        className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center text-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                      >
                        {statusEmoji || '😀'}
                      </button>
                      {showStatusEmojis && (
                        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 grid grid-cols-4 gap-2 z-10 status-emoji-picker">
                          {statusEmojis.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => {
                                setStatusEmoji(emoji);
                                setShowStatusEmojis(false);
                              }}
                              className="w-12 h-12 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 text-xl hover:scale-110 hover:shadow-md"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      value={statusText}
                      onChange={(e) => setStatusText(e.target.value)}
                      placeholder="What's your status?"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm dark:bg-gray-700 dark:text-white"
                      maxLength={50}
                    />
                    <button
                      type="button"
                      onClick={handleStatusSave}
                      className="px-3 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors text-sm"
                    >
                      Save
                    </button>
                  </div>
                </div>
            
                {/* Profile Image Section */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      {profileImage ? (
                        <div className="relative">
                          <img
                            src={profileImage}
                            alt="Profile"
                            className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                          />
                          <button
                            type="button"
                            onClick={removeProfileImage}
                            className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold border-2 border-gray-200 dark:border-gray-600"
                          style={{ backgroundColor: color }}
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="profile-image-upload"
                        disabled={isUploadingImage}
                      />
                      <label
                        htmlFor="profile-image-upload"
                        className={`inline-flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors ${
                          isUploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Camera size={16} />
                        <span>{isUploadingImage ? 'Uploading...' : 'Upload Photo'}</span>
                      </label>
                    </div>
                  </div>
                </div>
            
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
                        className={`w-6 h-6 rounded-full transition-all duration-200 hover:scale-110 ${color === c.value ? 'ring-2 ring-offset-2 ring-gray-500 dark:ring-offset-gray-800' : ''}`}
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
                    className="flex items-center gap-1 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-md transition-all duration-200 transform hover:scale-105"
                  >
                    <Save size={16} />
                    Save
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Palette size={20} />
                  Appearance Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Theme
                    </label>
                    <div className="space-y-2">
                      {themes.map((themeOption) => (
                        <label key={themeOption.value} className="flex items-center">
                          <input
                            type="radio"
                            name="theme"
                            value={themeOption.value}
                            checked={theme === themeOption.value}
                            onChange={(e) => handleThemeChange(e.target.value as any)}
                            className="mr-2 text-violet-600 focus:ring-violet-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{themeOption.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Font Size
                    </label>
                    <select
                      value={chatSettings.fontSize}
                      onChange={(e) => handleChatSettingChange('fontSize', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      {fontSizes.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Bell size={20} />
                  Notification Settings
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Enable Notifications</span>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={notificationSettings.enabled}
                        onChange={(e) => handleNotificationChange('enabled', e.target.checked)}
                        className="rounded text-violet-600 focus:ring-violet-500"
                      />
                      {notificationPermission === 'denied' && (
                        <span className="text-xs text-red-500">Blocked</span>
                      )}
                      {notificationPermission === 'granted' && notificationSettings.enabled && (
                        <span className="text-xs text-green-500">Active</span>
                      )}
                    </div>
                  </label>
                  
                  {notificationPermission === 'denied' && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        Notifications are blocked. Please enable them in your browser settings.
                      </p>
                    </div>
                  )}
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Sound Notifications</span>
                    <input
                      type="checkbox"
                      checked={notificationSettings.sound}
                      onChange={(e) => handleNotificationChange('sound', e.target.checked)}
                      disabled={!notificationSettings.enabled}
                      className="rounded text-violet-600 focus:ring-violet-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Desktop Notifications</span>
                    <input
                      type="checkbox"
                      checked={notificationSettings.desktop}
                      onChange={(e) => handleNotificationChange('desktop', e.target.checked)}
                      disabled={!notificationSettings.enabled || notificationPermission !== 'granted'}
                      className="rounded text-violet-600 focus:ring-violet-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Mention Notifications</span>
                    <input
                      type="checkbox"
                      checked={notificationSettings.mentions}
                      onChange={(e) => handleNotificationChange('mentions', e.target.checked)}
                      disabled={!notificationSettings.enabled}
                      className="rounded text-violet-600 focus:ring-violet-500"
                    />
                  </label>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Volume2 size={16} className="inline mr-1" />
                      Sound Volume: {Math.round(notificationSettings.soundVolume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={notificationSettings.soundVolume}
                      onChange={(e) => handleNotificationChange('soundVolume', parseFloat(e.target.value))}
                      disabled={!notificationSettings.enabled || !notificationSettings.sound}
                      className="w-full"
                    />
                    <button
                      onClick={() => notificationManager.playNotificationSound(notificationSettings.soundVolume)}
                      disabled={!notificationSettings.enabled || !notificationSettings.sound}
                      className="mt-2 px-3 py-1 bg-violet-600 text-white rounded text-xs hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Test Sound
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageSquare size={20} />
                  Chat Settings
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Timestamps</span>
                    <input
                      type="checkbox"
                      checked={chatSettings.showTimestamps}
                      onChange={(e) => handleChatSettingChange('showTimestamps', e.target.checked)}
                      className="rounded text-violet-600 focus:ring-violet-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Read Receipts</span>
                    <input
                      type="checkbox"
                      checked={chatSettings.showReadReceipts}
                      onChange={(e) => handleChatSettingChange('showReadReceipts', e.target.checked)}
                      className="rounded text-violet-600 focus:ring-violet-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Typing Indicators</span>
                    <input
                      type="checkbox"
                      checked={chatSettings.showTypingIndicators}
                      onChange={(e) => handleChatSettingChange('showTypingIndicators', e.target.checked)}
                      className="rounded text-violet-600 focus:ring-violet-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Profile Pictures</span>
                    <input
                      type="checkbox"
                      checked={chatSettings.showProfilePictures}
                      onChange={(e) => handleChatSettingChange('showProfilePictures', e.target.checked)}
                      className="rounded text-violet-600 focus:ring-violet-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Enter to Send</span>
                    <input
                      type="checkbox"
                      checked={chatSettings.enterToSend}
                      onChange={(e) => handleChatSettingChange('enterToSend', e.target.checked)}
                      className="rounded text-violet-600 focus:ring-violet-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Auto Scroll</span>
                    <input
                      type="checkbox"
                      checked={chatSettings.autoScroll}
                      onChange={(e) => handleChatSettingChange('autoScroll', e.target.checked)}
                      className="rounded text-violet-600 focus:ring-violet-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Compact Mode</span>
                    <input
                      type="checkbox"
                      checked={chatSettings.compactMode}
                      onChange={(e) => handleChatSettingChange('compactMode', e.target.checked)}
                      className="rounded text-violet-600 focus:ring-violet-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Shield size={20} />
                  Privacy Settings
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Online Status</span>
                    <input
                      type="checkbox"
                      checked={privacySettings.showOnlineStatus}
                      onChange={(e) => handlePrivacyChange('showOnlineStatus', e.target.checked)}
                      className="rounded text-violet-600 focus:ring-violet-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Last Seen</span>
                    <input
                      type="checkbox"
                      checked={privacySettings.showLastSeen}
                      onChange={(e) => handlePrivacyChange('showLastSeen', e.target.checked)}
                      className="rounded text-violet-600 focus:ring-violet-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Read Receipts</span>
                    <input
                      type="checkbox"
                      checked={privacySettings.showReadReceipts}
                      onChange={(e) => handlePrivacyChange('showReadReceipts', e.target.checked)}
                      className="rounded text-violet-600 focus:ring-violet-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-300">Show Typing Status</span>
                    <input
                      type="checkbox"
                      checked={privacySettings.showTypingStatus}
                      onChange={(e) => handlePrivacyChange('showTypingStatus', e.target.checked)}
                      className="rounded text-violet-600 focus:ring-violet-500"
                    />
                  </label>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Profile Visibility
                    </label>
                    <select
                      value={privacySettings.profileVisibility}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    >
                      <option value="everyone">Everyone</option>
                      <option value="contacts">Contacts Only</option>
                      <option value="nobody">Nobody</option>
                    </select>
                  </div>
                  
                  {blockedUsers.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                        <UserX size={16} />
                        Blocked Users ({blockedUsers.length})
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {blockedUsers.map((userId) => (
                          <div key={userId} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                            <span className="text-sm text-gray-700 dark:text-gray-300">{userId}</span>
                            <button
                              onClick={() => handleUnblockUser(userId)}
                              className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400"
                            >
                              Unblock
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'rooms' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Bookmark size={20} />
                  Saved Rooms
                </h3>
              
                {Object.keys(savedRooms).length === 0 ? (
                  <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                    <Bookmark size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No saved rooms yet</p>
                    <p className="text-xs mt-1">Save rooms to access them quickly!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(savedRooms).map(([roomId, roomData]) => (
                      <div
                        key={roomId}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {roomData.name}
                          </p>
                          {roomData.password && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                              <Shield size={12} />
                              Password Protected
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveSavedRoom(roomId)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1 transition-all duration-200 transform hover:scale-110"
                          aria-label="Remove saved room"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'data' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Download size={20} />
                  Data Management
                </h3>
                
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">Export Data</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
                      Download all your chat data, settings, and saved rooms as a backup file.
                    </p>
                    <button
                      onClick={exportData}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Download size={16} />
                      Export Data
                    </button>
                  </div>
                  
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">Clear All Data</h4>
                    <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                      This will permanently delete all your data including settings, saved rooms, and profile information.
                    </p>
                    <button
                      onClick={clearAllData}
                      className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm"
                    >
                      <Trash2 size={16} />
                      Clear All Data
                    </button>
                  </div>
                  
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">Storage Usage</h4>
                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                      <p>• Profile Data: {JSON.stringify(user).length} bytes</p>
                      <p>• Saved Rooms: {Object.keys(savedRooms).length} rooms</p>
                      <p>• Settings: {JSON.stringify({theme, notificationSettings, chatSettings, privacySettings}).length} bytes</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettings;