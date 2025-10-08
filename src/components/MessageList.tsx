import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../utils/types';
import { Heart, Smile, ThumbsUp, Reply, MoreVertical, CreditCard as Edit, Trash2 } from 'lucide-react';
import { addReaction, removeReaction, deleteMessage, markMessageAsSeen, updateLastSeenMessage } from '../services/firebase';
import { useUser } from '../contexts/UserContext';
import ImageMessage from './ImageMessage';
import YouTubeEmbed from './YouTubeEmbed';
import VoiceNotePlayer from './VoiceNotePlayer';

interface MessageListProps {
  messages: Message[];
  roomId: string;
  onReply: (message: Message) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, roomId, onReply }) => {
  const { user } = useUser();
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    
    // Mark messages as seen when they come into view
    if (messages.length > 0 && user?.id && user?.name) {
      messages.forEach(message => {
        if (message.senderId !== user.id) {
          // Mark message as seen by this user
          markMessageAsSeen(roomId, message.id, user.id, user.name).catch(console.error);
        }
      });
      
      // Update last seen message for this user
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        updateLastSeenMessage(roomId, user.id, lastMessage.id).catch(console.error);
      }
    }
  }, [messages, roomId, user?.id, user?.name]);

  const getSeenByText = (message: Message) => {
    if (!message.seenBy || message.senderId !== user?.id) return null;
    
    const seenEntries = Object.entries(message.seenBy).filter(([userId]) => userId !== message.senderId);
    const seenCount = seenEntries.length;
    
    if (seenCount === 0) return null;
    
    if (seenCount === 1) {
      return 'Seen by 1';
    } else {
      return `Seen by ${seenCount}`;
    }
  };

  const getSeenByDetails = (message: Message) => {
    if (!message.seenBy || message.senderId !== user?.id) return [];
    
    const seenEntries = Object.entries(message.seenBy || {})
      .filter(([userId]) => userId !== message.senderId)
      .map(([userId, data]) => {
        const seenData = data as any;
        return {
          userId,
          userName: seenData.userName || userId,
          timestamp: seenData.timestamp || Date.now()
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp);
    
    if (seenEntries.length === 0) return [];
    
    return seenEntries.map(entry => ({
      userId: entry.userId,
      userName: entry.userName,
      time: new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));
  };

  const [showSeenDetails, setShowSeenDetails] = useState<string | null>(null);

  useEffect(() => {
    scrollToBottom();
    
    // Mark visible messages as seen
    if (messages.length > 0 && user?.id) {
      // Mark all visible messages as seen (not sent by current user)
      messages.forEach(message => {
        if (message.senderId !== user.id) {
          markMessageAsSeen(roomId, message.id, user.id).catch(console.error);
        }
      });
    }
  }, [messages]);

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      const message = messages.find(m => m.id === messageId);
      if (!message) return;

      // Check if user already reacted with this emoji
      const userAlreadyReacted = message.reactions && 
        message.reactions[emoji] && 
        message.reactions[emoji][user.id];

      if (userAlreadyReacted) {
        // Remove reaction
        await removeReaction(roomId, messageId, emoji, user.id, user.name);
      } else {
        // Add reaction
        await addReaction(roomId, messageId, emoji, user.id, user.name);
      }
      
      setShowEmojiPicker(null);
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!user) return;
    
    const message = messages.find(m => m.id === messageId);
    if (!message || message.senderId !== user.id) return;

    try {
      await deleteMessage(roomId, messageId);
      setShowDropdown(null);
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const quickReactions = ['❤️', '😂', '👍', '😮', '😢', '😡'];
  const allEmojis = [
    '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
    '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
    '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
    '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
    '😔', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢',
    '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱',
    '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶',
    '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱',
    '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷',
    '🤒', '🤕', '🤑', '🤠', '😈', '👿', '👹', '👺', '🤡', '💩',
    '👻', '💀', '☠️', '👽', '👾', '🤖', '🎃', '😺', '😸', '😹',
    '😻', '😼', '😽', '🙀', '😿', '😾', '❤️', '🧡', '💛', '💚',
    '💙', '💜', '🤎', '🖤', '🤍', '💔', '❣️', '💕', '💞', '💓',
    '💗', '💖', '💘', '💝', '💟', '👍', '👎', '👌', '🤏', '✌️',
    '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️',
    '👋', '🤚', '🖐️', '✋', '🖖', '👏', '🙌', '🤲', '🤝', '🙏'
  ];

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = (message: Message) => {
    if (message.type === 'image') {
      return <ImageMessage imageUrl={message.content} />;
    }

    if (message.type === 'youtube') {
      return <YouTubeEmbed url={message.content} />;
    }

    if (message.type === 'voice') {
      return <VoiceNotePlayer roomId={roomId} voiceNoteId={message.id} audioUrl={message.content} />;
    }

    return <span>{message.content}</span>;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
              message.senderId === user?.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          >
            {message.replyTo && (
              <div className="mb-2 p-2 bg-black bg-opacity-20 rounded text-sm">
                <div className="font-semibold">{message.replyTo.senderName}</div>
                <div className="opacity-75 truncate">{message.replyTo.content}</div>
              </div>
            )}
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1" style={{ color: message.senderId === user?.id ? 'white' : message.senderColor }}>{message.senderName}</div>
                <div className="break-words">{renderMessageContent(message)}</div>
                <div className="text-xs opacity-75 mt-1">
                  {formatTimestamp(message.timestamp)}
                </div>
                {message.senderId === user?.id && getSeenByText(message) && (
                  <div 
                    className="text-xs mt-1 text-blue-400 cursor-pointer hover:text-blue-600 flex items-center gap-1"
                    onClick={() => setShowSeenDetails(showSeenDetails === message.id ? null : message.id)}
                  >
                    <span>✓✓</span>
                    <span>{getSeenByText(message)}</span>
                  </div>
                )}
              </div>
              
              {/* Message Actions */}
              <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                <button
                  onClick={() => onReply(message)}
                  className="p-1 hover:bg-black hover:bg-opacity-20 rounded"
                  title="Reply"
                >
                  <Reply size={14} />
                </button>
                
                <button
                  onClick={() => setShowEmojiPicker(showEmojiPicker === message.id ? null : message.id)}
                  className="p-1 hover:bg-black hover:bg-opacity-20 rounded"
                  title="React"
                >
                  <Smile size={14} />
                </button>
                
                {message.senderId === user?.id && (
                  <button
                    onClick={() => setShowDropdown(showDropdown === message.id ? null : message.id)}
                    className="p-1 hover:bg-black hover:bg-opacity-20 rounded"
                    title="More options"
                  >
                    <MoreVertical size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Reactions Display */}
            {message.reactions && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(message.reactions).map(([emoji, users]) => {
                  const userIds = Object.keys(users as Record<string, boolean>);
                  const count = userIds.length;
                  const userReacted = userIds.includes(user?.id || '');
                  
                  if (count === 0) return null;
                  
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(message.id, emoji)}
                      className={`text-sm px-2 py-1 rounded-full flex items-center space-x-1 transition-colors touch-manipulation min-h-[32px] ${
                        userReacted
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                      }`}
                      style={{ WebkitTapHighlightColor: 'transparent' }}
                    >
                      <span>{emoji}</span>
                      <span>{count}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Seen Details Popup */}
            {showSeenDetails === message.id && getSeenByDetails(message) && getSeenByDetails(message).length > 0 && (
              <div className="absolute bottom-full left-0 mb-2 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-lg z-20 min-w-40">
                <div className="font-semibold mb-1">Seen by:</div>
                {getSeenByDetails(message).map((seen, index) => (
                  <div key={index} className="flex justify-between items-center mb-1">
                    <span className="truncate mr-2">{seen.userName || seen.userId}</span>
                    <span className="ml-2 opacity-75">{seen.time}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Emoji Picker Modal */}
            {showEmojiPicker === message.id && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-sm w-full mx-4 max-h-96 overflow-y-auto">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Choose Reaction</h3>
                    <button
                      onClick={() => setShowEmojiPicker(null)}
                      className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {allEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(message.id, emoji)}
                        className="text-2xl p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors active:scale-95 touch-manipulation min-w-[48px] min-h-[48px] flex items-center justify-center"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Dropdown Menu */}
            {showDropdown === message.id && message.senderId === user?.id && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-1 z-10">
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left"
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
