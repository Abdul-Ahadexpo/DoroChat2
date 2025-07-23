export interface User {
  id: string;
  name: string;
  color: string;
  fontStyle: string;
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
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VOICE = 'voice'
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  senderFontStyle: string;
  content: string;
  type: MessageType;
  timestamp: number;
  editedAt?: number;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  } | null;
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