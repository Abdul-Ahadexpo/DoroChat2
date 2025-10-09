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
const DEVICE_INFO_KEY = 'doro-chat-device-info';
const ROOM_VISITS_KEY = 'doro-chat-room-visits';

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
    autoScroll: false,
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
export const getCustomStatus = (userId?: string) => {
  const key = userId ? `${CUSTOM_STATUS_KEY}-${userId}` : CUSTOM_STATUS_KEY;
  const status = localStorage.getItem(key);
  return status ? JSON.parse(status) : {
    text: '',
    emoji: '',
    expiresAt: null
  };
};

export const setCustomStatus = (status: any, userId?: string): void => {
  const key = userId ? `${CUSTOM_STATUS_KEY}-${userId}` : CUSTOM_STATUS_KEY;
  localStorage.setItem(key, JSON.stringify(status));
};

// Device tracking
export const getDeviceInfo = () => {
  const deviceInfo = localStorage.getItem(DEVICE_INFO_KEY);
  return deviceInfo ? JSON.parse(deviceInfo) : null;
};

export const setDeviceInfo = (deviceInfo: any): void => {
  localStorage.setItem(DEVICE_INFO_KEY, JSON.stringify(deviceInfo));
};

export const generateDeviceFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx!.textBaseline = 'top';
  ctx!.font = '14px Arial';
  ctx!.fillText('Device fingerprint', 2, 2);
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash).toString(36);
};

export const getDeviceName = (): string => {
  const userAgent = navigator.userAgent;
  let deviceName = 'Unknown Device';
  
  // Detect device type and browser
  if (/iPhone/i.test(userAgent)) {
    deviceName = 'iPhone';
  } else if (/iPad/i.test(userAgent)) {
    deviceName = 'iPad';
  } else if (/Android/i.test(userAgent)) {
    if (/Mobile/i.test(userAgent)) {
      deviceName = 'Android Phone';
    } else {
      deviceName = 'Android Tablet';
    }
  } else if (/Windows/i.test(userAgent)) {
    deviceName = 'Windows PC';
  } else if (/Macintosh/i.test(userAgent)) {
    deviceName = 'Mac';
  } else if (/Linux/i.test(userAgent)) {
    deviceName = 'Linux PC';
  }
  
  // Add browser info
  if (/Chrome/i.test(userAgent) && !/Edge/i.test(userAgent)) {
    deviceName += ' (Chrome)';
  } else if (/Firefox/i.test(userAgent)) {
    deviceName += ' (Firefox)';
  } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    deviceName += ' (Safari)';
  } else if (/Edge/i.test(userAgent)) {
    deviceName += ' (Edge)';
  }
  
  return deviceName;
};

// Room visits tracking
export const trackRoomVisit = (roomId: string, roomName: string): void => {
  const visits = getRoomVisits();
  const timestamp = Date.now();
  
  if (!visits[roomId]) {
    visits[roomId] = {
      roomName,
      visits: []
    };
  }
  
  visits[roomId].visits.push(timestamp);
  visits[roomId].roomName = roomName; // Update room name in case it changed
  
  localStorage.setItem(ROOM_VISITS_KEY, JSON.stringify(visits));
};

export const getRoomVisits = () => {
  const visits = localStorage.getItem(ROOM_VISITS_KEY);
  return visits ? JSON.parse(visits) : {};
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
  getDeviceInfo,
  setDeviceInfo,
  generateDeviceFingerprint,
  getDeviceName,
  trackRoomVisit,
  getRoomVisits,
};