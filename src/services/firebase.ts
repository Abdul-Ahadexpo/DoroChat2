import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, onValue, remove, update, get, serverTimestamp } from 'firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyC6i6KSsukpBfimknOOCEiRJSbtSDtwoJI",
  authDomain: "dorochat-3cc21.firebaseapp.com",
  projectId: "dorochat-3cc21",
  storageBucket: "dorochat-3cc21.firebasestorage.app",
  messagingSenderId: "103096100719",
  appId: "1:103096100719:web:6e3d78db86898632ed6a9a",
  databaseURL: "https://dorochat-3cc21-default-rtdb.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export const createChatRoom = async (roomData: {
  name: string;
  createdBy: string;
  isPrivate: boolean;
  password?: string;
  isTemporary: boolean;
  permanentCode?: string;
}) => {
  const chatRoomsRef = ref(database, 'chatRooms');
  const newRoomRef = push(chatRoomsRef);
  
  const roomInfo = {
    ...roomData,
    createdAt: serverTimestamp(),
    ...(roomData.isTemporary && !roomData.permanentCode && {
      expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 hours from now
    })
  };
  
  await set(newRoomRef, roomInfo);
  
  return newRoomRef.key;
};

export const updateChatRoom = async (roomId: string, updates: any) => {
  const roomRef = ref(database, `chatRooms/${roomId}`);
  await update(roomRef, updates);
};

export const cleanupExpiredRooms = async () => {
  const chatRoomsRef = ref(database, 'chatRooms');
  const snapshot = await get(chatRoomsRef);
  
  if (snapshot.exists()) {
    const rooms = snapshot.val();
    const now = Date.now();
    
    for (const [roomId, room] of Object.entries(rooms)) {
      const roomData = room as any;
      if (roomData.isTemporary && roomData.expiresAt && now > roomData.expiresAt) {
        await deleteRoom(roomId);
      }
    }
  }
};

export const deleteRoom = async (roomId: string) => {
  const roomRef = ref(database, `chatRooms/${roomId}`);
  const messagesRef = ref(database, `messages/${roomId}`);
  const voiceNotesRef = ref(database, `voiceNotes/${roomId}`);
  
  await remove(roomRef);
  await remove(messagesRef);
  await remove(voiceNotesRef);
};

export const getChatRooms = (callback: (rooms: any[]) => void) => {
  const chatRoomsRef = ref(database, 'chatRooms');
  
  onValue(chatRoomsRef, (snapshot) => {
    const data = snapshot.val();
    const rooms = data ? Object.entries(data).map(([id, room]) => ({
      id,
      ...room as object
    })) : [];
    
    callback(rooms);
  });
};

export const sendMessage = async (roomId: string, message: any) => {
  const messagesRef = ref(database, `messages/${roomId}`);
  const newMessageRef = push(messagesRef);
  
  await set(newMessageRef, {
    ...message,
    timestamp: serverTimestamp(),
    seenBy: {},
  });
  
  return newMessageRef.key;
};

export const editMessage = async (roomId: string, messageId: string, newContent: string) => {
  const messageRef = ref(database, `messages/${roomId}/${messageId}`);
  
  await update(messageRef, {
    content: newContent,
    editedAt: serverTimestamp(),
  });
};

export const deleteMessage = async (roomId: string, messageId: string) => {
  const messageRef = ref(database, `messages/${roomId}/${messageId}`);
  await remove(messageRef);
};

export const getMessages = (roomId: string, callback: (messages: any[]) => void) => {
  const messagesRef = ref(database, `messages/${roomId}`);
  
  onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    const messages = data ? Object.entries(data).map(([id, message]) => ({
      id,
      ...message as object
    })) : [];
    
    callback(messages);
  });
};

export const sendVoiceNote = async (roomId: string, voiceNote: any) => {
  const voiceNotesRef = ref(database, `voiceNotes/${roomId}`);
  const newVoiceNoteRef = push(voiceNotesRef);
  
  await set(newVoiceNoteRef, {
    ...voiceNote,
    timestamp: serverTimestamp(),
  });
  
  return newVoiceNoteRef.key;
};

export const deleteVoiceNote = async (roomId: string, voiceNoteId: string) => {
  const voiceNoteRef = ref(database, `voiceNotes/${roomId}/${voiceNoteId}`);
  await remove(voiceNoteRef);
};

// Typing indicators
export const setTypingIndicator = async (roomId: string, userId: string, userName: string) => {
  const typingRef = ref(database, `typing/${roomId}/${userId}`);
  await set(typingRef, {
    userName,
    timestamp: serverTimestamp(),
  });
  
  // Auto-remove after 3 seconds
  setTimeout(async () => {
    await remove(typingRef);
  }, 3000);
};

export const removeTypingIndicator = async (roomId: string, userId: string) => {
  const typingRef = ref(database, `typing/${roomId}/${userId}`);
  await remove(typingRef);
};

export const getTypingIndicators = (roomId: string, callback: (typing: any[]) => void) => {
  const typingRef = ref(database, `typing/${roomId}`);
  
  onValue(typingRef, (snapshot) => {
    const data = snapshot.val();
    const typing = data ? Object.entries(data).map(([userId, info]) => ({
      userId,
      ...info as object
    })) : [];
    
    callback(typing);
  });
};

// Read receipts
export const markMessageAsSeen = async (roomId: string, messageId: string, userId: string) => {
  const seenRef = ref(database, `messages/${roomId}/${messageId}/seenBy/${userId}`);
  await set(seenRef, serverTimestamp());
};

export const getLastSeenMessage = (roomId: string, callback: (lastSeen: any) => void) => {
  const lastSeenRef = ref(database, `lastSeen/${roomId}`);
  
  onValue(lastSeenRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || {});
  });
};

export const updateLastSeenMessage = async (roomId: string, userId: string, messageId: string) => {
  const lastSeenRef = ref(database, `lastSeen/${roomId}/${userId}`);
  await set(lastSeenRef, {
    messageId,
    timestamp: serverTimestamp(),
  });
};

export default {
  database,
  createChatRoom,
  getChatRooms,
  sendMessage,
  editMessage,
  deleteMessage,
  getMessages,
  sendVoiceNote,
  deleteVoiceNote,
  deleteRoom,
  setTypingIndicator,
  removeTypingIndicator,
  getTypingIndicators,
  markMessageAsSeen,
  getLastSeenMessage,
  updateLastSeenMessage,
};