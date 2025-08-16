import React, { useState, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { sendMessage, sendVoiceNote, deleteVoiceNote, setTypingIndicator, removeTypingIndicator } from '../services/firebase';
import { uploadImage } from '../utils/imgbb';
import { MessageType } from '../utils/types';
import { saveVoiceNote } from '../utils/storage';
import { Send, Image, Mic, MicOff, Smile, MoreHorizontal, X } from 'lucide-react';
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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useUser();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const recorderControls = useAudioRecorder();

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (message.trim() === '') return;
    
    try {
      await sendMessage(roomId, {
        senderId: user.id,
        senderName: user.name,
        senderColor: user.color,
        senderFontStyle: user.fontStyle,
        senderProfileImage: user.profileImage,
        content: message,
        type: MessageType.TEXT,
        replyTo: replyTo ? {
          id: replyTo.id,
          content: replyTo.content,
          senderName: replyTo.senderName
        } : null
      });
      
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      // Remove typing indicator when message is sent
      removeTypingIndicator(roomId, user.id);
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
    setUploadProgress(0);
    setShowTools(false);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        return Math.min(prev + Math.random() * 15, 95);
      });
    }, 200);
    
    uploadImage(file)
      .then(async (imageUrl) => {
        setUploadProgress(100);
        await sendMessage(roomId, {
          senderId: user.id,
          senderName: user.name,
          senderColor: user.color,
          senderFontStyle: user.fontStyle,
          senderProfileImage: user.profileImage,
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
        alert(`Failed to upload image: ${error.message}`);
      })
      .finally(() => {
        clearInterval(progressInterval);
        setIsUploading(false);
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        if (onCancelReply) onCancelReply();
      });
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    setShowTools(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
      adjustTextareaHeight();
    }
  };

  const toggleRecording = () => {
    if (recorderControls.isRecording) {
      recorderControls.stopRecording();
      setIsRecording(false);
      setRecordingTime(0);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }
    } else {
      recorderControls.startRecording();
      setIsRecording(true);
      setRecordingTime(0);
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    setShowTools(false);
  };

  const addAudioElement = async (blob: Blob) => {
    setIsRecording(false);
    setRecordingTime(0);
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = null;
    }
    
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
            senderProfileImage: user.profileImage,
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

  const handleTyping = () => {
    // Set typing indicator
    setTypingIndicator(roomId, user.id, user.name);
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to remove typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      removeTypingIndicator(roomId, user.id);
    }, 2000);
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2 md:p-4 message-input-container font-comic">
      {replyTo && (
        <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
              Replying to {replyTo.senderName}
            </p>
            <p className="text-xs md:text-sm truncate">{replyTo.content}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 ml-2 p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}
      
      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-blue-600 dark:text-blue-400">Uploading image...</span>
            <span className="text-sm text-blue-600 dark:text-blue-400">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {/* Recording Timeline */}
      {isRecording && (
        <div className="mb-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600 dark:text-red-400 font-medium">Recording...</span>
            </div>
            <span className="text-lg font-mono text-red-600 dark:text-red-400 font-bold">
              {formatRecordingTime(recordingTime)}
            </span>
          </div>
          <div className="mt-2 text-xs text-red-500 dark:text-red-400">
            Tap the mic button again to stop recording
          </div>
        </div>
      )}
      
      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
              adjustTextareaHeight();
            }}
            placeholder="Type a message..."
            className="w-full p-2 md:p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-gray-700 dark:text-white resize-none text-sm md:text-base"
            rows={1}
            style={{ 
              minHeight: '40px', 
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
        
        <div className="flex items-center gap-1 md:gap-2">
          {/* Desktop tools */}
          <div className="hidden md:flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
                className={`text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 cursor-pointer p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-label="Upload image"
              >
                <Image size={20} />
              </label>
            </div>
            
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2 rounded-full transition-colors ${isRecording ? 'text-red-500 animate-pulse bg-red-50 dark:bg-red-900/20' : 'text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              aria-label={isRecording ? 'Stop recording' : 'Start recording'}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          </div>
          
          {/* Mobile tools button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setShowTools(!showTools)}
              className="text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
          
          <button
            type="submit"
            disabled={message.trim() === '' || isUploading}
            className={`bg-violet-600 hover:bg-violet-700 text-white p-2 md:p-3 rounded-full transition-colors ${(message.trim() === '' || isUploading) ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'}`}
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
      
      {/* Mobile tools dropdown */}
      {showTools && (
        <div className="message-tools-dropdown">
          <button
            onClick={() => {
              setShowEmojiPicker(!showEmojiPicker);
              setShowTools(false);
            }}
            className="text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Smile size={24} />
          </button>
          
          <label
            htmlFor="image-upload-mobile"
            className="text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
          >
            <Image size={24} />
            <input
              id="image-upload-mobile"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploading}
            />
          </label>
          
          <button
            onClick={toggleRecording}
            className={`p-3 rounded-full transition-colors ${isRecording ? 'text-red-500 animate-pulse bg-red-50 dark:bg-red-900/20' : 'text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
          >
            {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
        </div>
      )}
      
      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 md:bottom-20 right-2 md:right-4 z-50">
          <div className="relative">
            <EmojiPicker 
              onEmojiClick={handleEmojiClick}
              width={280}
              height={350}
            />
          </div>
        </div>
      )}
      
      {/* Hidden audio recorder */}
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