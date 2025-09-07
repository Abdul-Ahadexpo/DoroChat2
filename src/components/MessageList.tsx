import React, { useEffect, useRef, useState } from 'react';
import { Message, MessageType } from '../utils/types';
import { useUser } from '../contexts/UserContext';
import { editMessage, deleteMessage, markMessageAsSeen, updateLastSeenMessage, getAllUserStatuses } from '../services/firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VoiceNotePlayer from './VoiceNotePlayer';
import ImageMessage from './ImageMessage';
import YouTubeEmbed from './YouTubeEmbed';
import { notificationManager } from '../utils/notifications';
import { getNotificationSettings } from '../utils/storage';
import { Reply, Edit, Trash2, MoreVertical, Check, X } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  roomId: string;
  onReply: (message: Message) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, roomId, onReply }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [userStatuses, setUserStatuses] = useState<{ [userId: string]: any }>({});
  const { user } = useUser();

  // Initialize notifications
  useEffect(() => {
    const initNotifications = async () => {
      const settings = getNotificationSettings();
      if (settings.enabled) {
        await notificationManager.requestPermission();
      }
    };
    
    initNotifications();
  }, []);

  // Handle new message notifications
  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    
    // Don't notify for own messages or old messages
    if (lastMessage.senderId === user.id) return;
    if (Date.now() - lastMessage.timestamp > 5000) return; // Ignore messages older than 5 seconds
    
    // Only process text messages with valid content
    if (lastMessage.type !== MessageType.TEXT || !lastMessage.content) return;
    
    const settings = getNotificationSettings();
    
    // Check if user is mentioned
    const isMentioned = lastMessage.content.toLowerCase().includes(user.name?.toLowerCase() || '');
    
    if (isMentioned) {
      notificationManager.notifyMention(lastMessage.senderName, lastMessage.content, settings);
    } else {
      notificationManager.notifyNewMessage(lastMessage.senderName, lastMessage.content, settings);
    }
  }, [messages, user.id, user.name]);

  // Mark messages as seen when they come into view
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.senderId !== user.id) {
        markMessageAsSeen(roomId, lastMessage.id, user.id);
        updateLastSeenMessage(roomId, user.id, lastMessage.id);
      }
    }
  }, [messages, roomId, user.id]);

  // Listen for all user statuses
  useEffect(() => {
    getAllUserStatuses((statuses) => {
      setUserStatuses(statuses);
    });
  }, []);

  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const atBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(atBottom);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const groupedMessages: { [key: string]: Message[] } = {};
  messages.forEach(message => {
    const date = new Date(message.timestamp);
    const dateKey = date.toLocaleDateString();
    
    if (!groupedMessages[dateKey]) {
      groupedMessages[dateKey] = [];
    }
    
    groupedMessages[dateKey].push(message);
  });

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleEditMessage = async (messageId: string) => {
    if (editContent.trim() === '') return;
    
    try {
      await editMessage(roomId, messageId, editContent.trim());
      setEditingMessage(null);
      setEditContent('');
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await deleteMessage(roomId, messageId);
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    }
  };

  const startEditing = (message: Message) => {
    setEditingMessage(message.id);
    setEditContent(message.content);
    setShowMenu(null);
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditContent('');
  };

  const getSeenCount = (message: Message) => {
    if (!message.seenBy) return 0;
    return Object.keys(message.seenBy).filter(userId => userId !== message.senderId).length;
  };

  const [showStatusModal, setShowStatusModal] = useState<{
    show: boolean;
    status: any;
    userName: string;
    profileImage?: string;
  }>({ show: false, status: null, userName: '', profileImage: '' });

  const handleProfileClick = (senderId: string, senderName: string, senderProfileImage?: string) => {
    // Get the user's custom status from Firebase data
    const userStatus = userStatuses[senderId] || { text: '', emoji: '' };
    
    if (userStatus.text || userStatus.emoji) {
      setShowStatusModal({
        show: true,
        status: userStatus,
        userName: senderName,
        profileImage: senderProfileImage
      });
    }
  };

  const closeStatusModal = () => {
    setShowStatusModal({ show: false, status: null, userName: '', profileImage: '' });
  };

  const ProfileImage: React.FC<{ 
    src?: string; 
    name: string; 
    color: string; 
    size?: number;
    onClick?: () => void;
    hasStatus?: boolean;
  }> = ({
    src, 
    name, 
    color, 
    size = 32,
    onClick,
    hasStatus = false
  }) => {
    const safeName = name || 'Unknown';
    
    const profileContent = (
      <div className={`relative ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
        {src ? (
          <img
            src={src}
            alt={`${safeName}'s profile`}
            className={`rounded-full object-cover flex-shrink-0 transition-all duration-200 ${
              hasStatus ? 'ring-2 ring-violet-400 ring-opacity-60 shadow-lg shadow-violet-200 dark:shadow-violet-800' : ''
            } ${onClick ? 'hover:scale-105' : ''}`}
            style={{ width: size, height: size }}
          />
        ) : (
          <div
            className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 transition-all duration-200 ${
              hasStatus ? 'ring-2 ring-violet-400 ring-opacity-60 shadow-lg shadow-violet-200 dark:shadow-violet-800' : ''
            } ${onClick ? 'hover:scale-105' : ''}`}
            style={{ 
              width: size, 
              height: size, 
              backgroundColor: color,
              fontSize: size * 0.4
            }}
          >
            {safeName.charAt(0).toUpperCase()}
          </div>
        )}
        
        {hasStatus && (
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-violet-500 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
    );

    return profileContent;
  };

  // Check if user has status by looking up their stored status
  const userHasStatus = (senderId: string) => {
    const userStatus = userStatuses[senderId] || { text: '', emoji: '' };
    return userStatus.text || userStatus.emoji;
  };

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-2 md:p-4 space-y-2 md:space-y-4 bg-gray-50 dark:bg-gray-900"
    >
      {Object.keys(groupedMessages).length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      )}
      
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="space-y-1 md:space-y-2">
          <div className="flex justify-center">
            <div className="bg-gray-200 dark:bg-gray-700 px-2 md:px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-300">
              {date}
            </div>
          </div>
          
          {dateMessages.map((message) => (
            <div key={message.id} className="flex flex-col">
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <ProfileImage 
                    src={message.senderProfileImage} 
                    name={message.senderName} 
                    color={message.senderColor}
                    size={24}
                    onClick={() => handleProfileClick(message.senderId, message.senderName, message.senderProfileImage)}
                    hasStatus={userHasStatus(message.senderId)}
                  />
                  <div className="flex items-baseline space-x-1 md:space-x-2">
                  <span 
                    className={`font-medium text-sm md:text-base ${message.senderFontStyle}`}
                    style={{ color: message.senderColor }}
                  >
                    {message.senderName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(message.timestamp)}
                    {message.editedAt && (
                      <span className="ml-1 text-gray-400">(edited)</span>
                    )}
                  </span>
                </div>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => onReply(message)}
                    className="text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 p-1"
                    aria-label="Reply to message"
                  >
                    <Reply size={14} />
                  </button>
                  
                  {message.senderId === user.id && (
                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(showMenu === message.id ? null : message.id)}
                        className="text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400 p-1"
                        aria-label="Message options"
                      >
                        <MoreVertical size={14} />
                      </button>
                      
                      {showMenu === message.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 min-w-[120px]">
                          {message.type === MessageType.TEXT && (
                            <button
                              onClick={() => startEditing(message)}
                              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                            >
                              <Edit size={14} />
                              <span>Edit</span>
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(message.id)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-red-600"
                          >
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {message.replyTo && (
                <div className="ml-2 md:ml-4 mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded border-l-2 border-violet-500">
                  <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                    Replying to {message.replyTo.senderName}
                  </p>
                  <p className="text-xs md:text-sm truncate">{message.replyTo.content}</p>
                </div>
              )}
              
              <div className="mt-1 ml-1">
                {editingMessage === message.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm dark:bg-gray-700 dark:text-white"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleEditMessage(message.id);
                        } else if (e.key === 'Escape') {
                          cancelEditing();
                        }
                      }}
                      autoFocus
                    />
                    <button
                      onClick={() => handleEditMessage(message.id)}
                      className="text-green-600 hover:text-green-700 p-1"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="text-red-600 hover:text-red-700 p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    {message.type === MessageType.TEXT && (
                      <div className="prose prose-sm dark:prose-invert max-w-none text-sm md:text-base">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    
                    {message.type === MessageType.IMAGE && (
                      <ImageMessage imageUrl={message.content} />
                    )}
                    
                    {message.type === MessageType.VOICE && (
                      <VoiceNotePlayer 
                        roomId={roomId}
                        voiceNoteId={message.id}
                        audioUrl={message.content}
                      />
                    )}
                    
                    {message.type === MessageType.YOUTUBE && (
                      <YouTubeEmbed url={message.content} />
                    )}
                    
                    {message.type === MessageType.LIVE_YOUTUBE_INITIATE && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-red-600 dark:text-red-400 text-lg">🔴</span>
                          <span className="text-red-700 dark:text-red-300 font-medium">
                            Live video session started
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              {/* Read receipts for sender's messages */}
              {message.senderId === user.id && getSeenCount(message) > 0 && (
                <div className="text-xs text-gray-400 dark:text-gray-500 ml-8 mt-1">
                  Seen by {getSeenCount(message)}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}
      
      <div ref={messagesEndRef} />
      
      {!autoScroll && messages.length > 0 && (
        <button
          onClick={() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            setAutoScroll(true);
          }}
          className="fixed bottom-20 md:bottom-24 right-4 md:right-8 bg-violet-600 text-white rounded-full p-2 md:p-3 shadow-lg hover:bg-violet-700 transition-colors z-10"
          aria-label="Scroll to bottom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      )}
      
      {/* Custom Status Modal */}
      {showStatusModal.show && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 transition-all duration-300"
          onClick={closeStatusModal}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full transform transition-all duration-300 animate-in zoom-in-95">
            <div 
              onClick={(e) => e.stopPropagation()}
              className="w-full"
            >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {showStatusModal.userName}'s Status
              </h3>
              <button
                onClick={closeStatusModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* User Profile Section */}
            <div className="flex items-center space-x-3 mb-4">
              <ProfileImage 
                src={showStatusModal.profileImage} 
                name={showStatusModal.userName} 
                color="#8B5CF6"
                size={48}
                hasStatus={true}
              />
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  {showStatusModal.userName}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Custom Status
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {showStatusModal.status.emoji && (
                <div className="text-4xl">
                  {showStatusModal.status.emoji}
                </div>
              )}
              <div className="flex-1">
                {showStatusModal.status.text && (
                  <p className="text-gray-800 dark:text-gray-200 font-medium text-lg">
                    {showStatusModal.status.text}
                  </p>
                )}
                {!showStatusModal.status.text && showStatusModal.status.emoji && (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No status message
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={closeStatusModal}
                className="px-4 py-2 bg-violet-600 text-white rounded-md hover:bg-violet-700 transition-colors"
              >
                Close
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;