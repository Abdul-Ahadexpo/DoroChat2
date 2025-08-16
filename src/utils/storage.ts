// Constants for localStorage keys
const USER_ID_KEY = 'doro-chat-user-id';
const USER_NAME_KEY = 'doro-chat-user-name';
const USER_COLOR_KEY = 'doro-chat-user-color';
const USER_FONT_STYLE_KEY = 'doro-chat-user-font-style';
const VOICE_NOTES_KEY = 'doro-chat-voice-notes';
const SAVED_ROOMS_KEY = 'doro-chat-saved-rooms';

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

export default {
  getUserId,
  getUserName,
  setUserName,
  getUserColor,
  setUserColor,
  getUserFontStyle,
  setUserFontStyle,
  saveVoiceNote,
  getVoiceNote,
  getSavedRooms,
  saveRoom,
  removeSavedRoom,
  isRoomSaved,
  getSavedRoomPassword,
};