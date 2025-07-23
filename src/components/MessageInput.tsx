import React, { useState, useRef } from 'react';
import { useUser } from '../contexts/UserContext';
import { sendMessage, sendVoiceNote, deleteVoiceNote } from '../services/firebase';
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
  const [isRecording, setIsRecording] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTools, setShowTools] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useUser();
  
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
    setShowTools(false);
    
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
    } else {
      recorderControls.startRecording();
      setIsRecording(true);
    }
    setShowTools(false);
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
      
      <form onSubmit={handleSendMessage} className="flex items-end gap-2">
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
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