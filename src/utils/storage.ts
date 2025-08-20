// Constants for localStorage keys
const USER_ID_KEY = 'doro-chat-user-id';
const USER_NAME_KEY = 'doro-chat-user-name';
const USER_COLOR_KEY = 'doro-chat-user-color';
const USER_FONT_STYLE_KEY = 'doro-chat-user-font-style';
const USER_PROFILE_IMAGE_KEY = 'doro-chat-user-profile-image';
const VOICE_NOTES_KEY = 'doro-chat-voice-notes';
const SAVED_ROOMS_KEY = 'doro-chat-saved-rooms';
const THEME_KEY = 'doro-chat-theme';
const NOTIFICATION_SETTINGS_KEY = 'doro-chat-notification-settings';
const CHAT_SETTINGS_KEY = 'doro-chat-chat-settings';
const PRIVACY_SETTINGS_KEY = 'doro-chat-privacy-settings';
const BLOCKED_USERS_KEY = 'doro-chat-blocked-users';
const CUSTOM_STATUS_KEY = 'doro-chat-custom-status';

// Generate a random user ID if one doesn't exist
export const getUserId = (): string => {
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    userId = `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
};

// User name functions
export const getUserName = (): string => {
  const userName = localStorage.getItem(USER_NAME_KEY);
  return userName || `Guest_${Math.floor(Math.random() * 1000)}`;
};

export const setUserName = (name: string): void => {
  localStorage.setItem(USER_NAME_KEY, name);
};

// User color functions
export const getUserColor = (): string => {
  const userColor = localStorage.getItem(USER_COLOR_KEY);
  return userColor || '#8B5CF6'; // Default color: purple
};

export const setUserColor = (color: string): void => {
  localStorage.setItem(USER_COLOR_KEY, color);
};

// User font style functions
export const getUserFontStyle = (): string => {
  const userFontStyle = localStorage.getItem(USER_FONT_STYLE_KEY);
  return userFontStyle || 'normal'; // Default font style
};

export const setUserFontStyle = (fontStyle: string): void => {
  localStorage.setItem(USER_FONT_STYLE_KEY, fontStyle);
};

// User profile image functions
export const getUserProfileImage = (): string => {
  const userProfileImage = localStorage.getItem(USER_PROFILE_IMAGE_KEY);
  return userProfileImage || '';
};

export const setUserProfileImage = (profileImage: string): void => {
  localStorage.setItem(USER_PROFILE_IMAGE_KEY, profileImage);
};

// Voice notes storage
export const saveVoiceNote = (roomId: string, voiceNoteId: string, audioBlob: Blob): void => {
  // Get existing voice notes or initialize empty object
  const voiceNotesJson = localStorage.getItem(VOICE_NOTES_KEY) || '{}';
  const voiceNotes = JSON.parse(voiceNotesJson);
  
  // Create room entry if it doesn't exist
  if (!voiceNotes[roomId]) {
    voiceNotes[roomId] = {};
  }
  
  // Convert Blob to base64 string
  const reader = new FileReader();
  reader.readAsDataURL(audioBlob);
  reader.onloadend = () => {
    const base64data = reader.result as string;
    
    // Save the voice note
    voiceNotes[roomId][voiceNoteId] = base64data;
    localStorage.setItem(VOICE_NOTES_KEY, JSON.stringify(voiceNotes));
  };
};

export const getVoiceNote = (roomId: string, voiceNoteId: string): string | null => {
  const voiceNotesJson = localStorage.getItem(VOICE_NOTES_KEY) || '{}';
  const voiceNotes = JSON.parse(voiceNotesJson);
  
  if (voiceNotes[roomId] && voiceNotes[roomId][voiceNoteId]) {
    return voiceNotes[roomId][voiceNoteId];
  }
  
  return null;
};

// Saved rooms functions
export const getSavedRooms = (): { [roomId: string]: { name: string; password?: string } } => {
  const savedRoomsJson = localStorage.getItem(SAVED_ROOMS_KEY) || '{}';
  return JSON.parse(savedRoomsJson);
};

export const saveRoom = (roomId: string, roomName: string, password?: string): void => {
  const savedRooms = getSavedRooms();
  savedRooms[roomId] = { name: roomName, password };
  localStorage.setItem(SAVED_ROOMS_KEY, JSON.stringify(savedRooms));
};

export const removeSavedRoom = (roomId: string): void => {
  const savedRooms = getSavedRooms();
  delete savedRooms[roomId];
  localStorage.setItem(SAVED_ROOMS_KEY, JSON.stringify(savedRooms));
};

export const isRoomSaved = (roomId: string): boolean => {
  const savedRooms = getSavedRooms();
  return roomId in savedRooms;
};

export const getSavedRoomPassword = (roomId: string): string | undefined => {
  const savedRooms = getSavedRooms();
  return savedRooms[roomId]?.password;
};

// Theme settings
export const getTheme = (): 'light' | 'dark' | 'auto' => {
  const theme = localStorage.getItem(THEME_KEY);
  return (theme as 'light' | 'dark' | 'auto') || 'auto';
};

export const setTheme = (theme: 'light' | 'dark' | 'auto'): void => {
  localStorage.setItem(THEME_KEY, theme);
};

// Notification settings
export const getNotificationSettings = () => {
  const settings = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
  return settings ? JSON.parse(settings) : {
    enabled: true,
    sound: true,
    desktop: true,
    mentions: true,
    privateMessages: true,
    soundVolume: 0.5,
    customSound: 'default'
  };
};

export const setNotificationSettings = (settings: any): void => {
  localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
};

// Chat settings
export const getChatSettings = () => {
  const settings = localStorage.getItem(CHAT_SETTINGS_KEY);
  return settings ? JSON.parse(settings) : {
    fontSize: 'medium',
    messageGrouping: true,
    showTimestamps: true,
    showReadReceipts: true,
    showTypingIndicators: true,
    autoScroll: true,
    compactMode: false,
    showProfilePictures: true,
    messagePreview: true,
    enterToSend: true
  };
};

export const setChatSettings = (settings: any): void => {
  localStorage.setItem(CHAT_SETTINGS_KEY, JSON.stringify(settings));
};

// Privacy settings
export const getPrivacySettings = () => {
  const settings = localStorage.getItem(PRIVACY_SETTINGS_KEY);
  return settings ? JSON.parse(settings) : {
    showOnlineStatus: true,
    allowDirectMessages: true,
    showLastSeen: true,
    showReadReceipts: true,
    allowRoomInvites: true,
    showTypingStatus: true,
    profileVisibility: 'everyone'
  };
};

export const setPrivacySettings = (settings: any): void => {
  localStorage.setItem(PRIVACY_SETTINGS_KEY, JSON.stringify(settings));
};

// Blocked users
export const getBlockedUsers = (): string[] => {
  const blocked = localStorage.getItem(BLOCKED_USERS_KEY);
  return blocked ? JSON.parse(blocked) : [];
};

export const blockUser = (userId: string): void => {
  const blocked = getBlockedUsers();
  if (!blocked.includes(userId)) {
    blocked.push(userId);
    localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(blocked));
  }
};

export const unblockUser = (userId: string): void => {
  const blocked = getBlockedUsers();
  const filtered = blocked.filter(id => id !== userId);
  localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(filtered));
};

export const isUserBlocked = (userId: string): boolean => {
  return getBlockedUsers().includes(userId);
};

// Custom status
export const getCustomStatus = () => {
  const status = localStorage.getItem(CUSTOM_STATUS_KEY);
  return status ? JSON.parse(status) : {
    text: '',
    emoji: '',
    expiresAt: null
  };
};

export const setCustomStatus = (status: any): void => {
  localStorage.setItem(CUSTOM_STATUS_KEY, JSON.stringify(status));
};

export default {
  getUserId,
  getUserName,
  setUserName,
  getUserColor,
  setUserColor,
  getUserFontStyle,
  setUserFontStyle,
  getUserProfileImage,
  setUserProfileImage,
  saveVoiceNote,
  getVoiceNote,
  getSavedRooms,
  saveRoom,
  removeSavedRoom,
  isRoomSaved,
  getSavedRoomPassword,
  getTheme,
  setTheme,
  getNotificationSettings,
  setNotificationSettings,
  getChatSettings,
  setChatSettings,
  getPrivacySettings,
  setPrivacySettings,
  getBlockedUsers,
  blockUser,
  unblockUser,
  isUserBlocked,
  getCustomStatus,
  setCustomStatus,
};