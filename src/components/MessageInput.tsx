import React, { useState, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { sendMessage, sendVoiceNote, deleteVoiceNote } from '../services/firebase';
import { uploadImage } from '../utils/imgbb';
import { MessageType } from '../utils/types';
import { saveVoiceNote } from '../utils/storage';
import { Send, Image, Mic, MicOff, Smile } from 'lucide-react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';

interface MessageInputProps {
  roomId: string;
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  } | null;
  onCancelReply?: () => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ roomId, replyTo, onCancelReply }) => {
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useUser();
  
  const recorderControls = useAudioRecorder();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() === '') return;
    
    try {
      await sendMessage(roomId, {
        senderId: user.id,
        senderName: user.name,
        senderColor: user.color,
        senderFontStyle: user.fontStyle,
        content: message,
        type: MessageType.TEXT,
        replyTo: replyTo ? {
          id: replyTo.id,
          content: replyTo.content,
          senderName: replyTo.senderName
        } : null
      });
      
      setMessage('');
      if (onCancelReply) onCancelReply();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    
    uploadImage(file)
      .then(async (imageUrl) => {
        await sendMessage(roomId, {
          senderId: user.id,
          senderName: user.name,
          senderColor: user.color,
          senderFontStyle: user.fontStyle,
          content: imageUrl,
          type: MessageType.IMAGE,
          replyTo: replyTo ? {
            id: replyTo.id,
            content: replyTo.content,
            senderName: replyTo.senderName
          } : null
        });
      })
      .catch((error) => {
        console.error('Error uploading image:', error);
        alert('Failed to upload image');
      })
      .finally(() => {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        if (onCancelReply) onCancelReply();
      });
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const toggleRecording = () => {
    if (recorderControls.isRecording) {
      recorderControls.stopRecording();
      setIsRecording(false);
    } else {
      recorderControls.startRecording();
      setIsRecording(true);
    }
  };

  const addAudioElement = async (blob: Blob) => {
    setIsRecording(false);
    
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    
    reader.onloadend = async () => {
      try {
        const audioDataUrl = reader.result as string;
        
        const voiceNoteId = await sendVoiceNote(roomId, {
          senderId: user.id,
          senderName: user.name,
          senderColor: user.color,
          senderFontStyle: user.fontStyle,
          audioUrl: audioDataUrl,
        });
        
        if (voiceNoteId) {
          saveVoiceNote(roomId, voiceNoteId, blob);
          
          await sendMessage(roomId, {
            senderId: user.id,
            senderName: user.name,
            senderColor: user.color,
            senderFontStyle: user.fontStyle,
            content: audioDataUrl,
            type: MessageType.VOICE,
            id: voiceNoteId,
            replyTo: replyTo ? {
              id: replyTo.id,
              content: replyTo.content,
              senderName: replyTo.senderName
            } : null
          });
          
          await deleteVoiceNote(roomId, voiceNoteId);
          if (onCancelReply) onCancelReply();
        }
      } catch (error) {
        console.error('Error sending voice note:', error);
      }
    };
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
      {replyTo && (
        <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex justify-between items-center">
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Replying to {replyTo.senderName}
            </p>
            <p className="text-sm truncate">{replyTo.content}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>
      )}
      
      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="w-full p-3 pr-24 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white resize-none"
            rows={1}
            style={{ 
              minHeight: '44px', 
              maxHeight: '120px'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 p-2"
            aria-label="Add emoji"
          >
            <Smile size={20} />
          </button>
          
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              id="image-upload"
              disabled={isUploading}
            />
            <label
              htmlFor="image-upload"
              className={`text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 cursor-pointer p-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Upload image"
            >
              <Image size={20} />
            </label>
          </div>
          
          <button
            type="button"
            onClick={toggleRecording}
            className={`p-2 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400'}`}
            aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <button
            type="submit"
            disabled={message.trim() === '' || isUploading}
            className={`bg-violet-600 hover:bg-violet-700 text-white p-3 rounded-lg transition-colors ${(message.trim() === '' || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
      
      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 z-10">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      
      <div className="hidden">
        <AudioRecorder 
          onRecordingComplete={addAudioElement}
          recorderControls={recorderControls}
        />
      </div>
    </div>
  );
};

export default MessageInput;