export interface User {
  id: string;
  name: string;
  color: string;
  fontStyle: string;
  profileImage?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  createdBy: string;
  createdAt: number;
  isPrivate: boolean;
  password?: string;
  isTemporary: boolean;
  expiresAt?: number;
  permanentCode?: string;
  isHidden?: boolean;
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VOICE = 'voice',
  YOUTUBE = 'youtube',
  LIVE_YOUTUBE_INITIATE = 'live_youtube_initiate'
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  senderFontStyle: string;
  senderProfileImage?: string;
  content: string;
  type: MessageType;
  timestamp: number;
  editedAt?: number;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  } | null;
  seenBy?: { [userId: string]: number };
  reactions?: { [emoji: string]: { [userId: string]: { userName: string; timestamp: number } } };
}

export interface VoiceNote {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  senderFontStyle: string;
  audioUrl: string;
  timestamp: number;
}

export interface ImageMessage extends Message {
  imageUrl: string;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  timestamp: number;
}

export interface ReadReceipt {
  userId: string;
  userName: string;
  timestamp: number;
}

export interface LiveVideoState {
  videoId: string;
  startedAt: number;
  currentPlaybackTime: number;
  isPlaying: boolean;
  initiatedBy: string;
  initiatedByName: string;
  title?: string;
}