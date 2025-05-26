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

export const createChatRoom = async (roomName: string, createdBy: string) => {
  const chatRoomsRef = ref(database, 'chatRooms');
  const newRoomRef = push(chatRoomsRef);
  
  await set(newRoomRef, {
    name: roomName,
    createdBy,
    createdAt: serverTimestamp(),
  });
  
  return newRoomRef.key;
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
  });
  
  return newMessageRef.key;
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

export default {
  database,
  createChatRoom,
  getChatRooms,
  sendMessage,
  getMessages,
  sendVoiceNote,
  deleteVoiceNote,
  deleteRoom,
};