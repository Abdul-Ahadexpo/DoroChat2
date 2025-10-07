import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../utils/types';
import { Heart, Smile, ThumbsUp, Reply, MoreVertical, CreditCard as Edit, Trash2 } from 'lucide-react';
import { updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../services/firebase';
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
  }, [messages]);

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
    const message = messages.find(m => m.id === messageId);
    
    if (!message) return;

    const existingReaction = message.reactions?.find(r => r.emoji === emoji);
    
    if (existingReaction) {
      if (existingReaction.users.includes(user.id)) {
        // Remove user from reaction
        const updatedUsers = existingReaction.users.filter(id => id !== user.id);
        if (updatedUsers.length === 0) {
          // Remove entire reaction if no users left
          await updateDoc(messageRef, {
            reactions: arrayRemove(existingReaction)
          });
        } else {
          // Update reaction with remaining users
          await updateDoc(messageRef, {
            reactions: arrayRemove(existingReaction)
          });
          await updateDoc(messageRef, {
            reactions: arrayUnion({
              emoji,
              users: updatedUsers,
              count: updatedUsers.length
            })
          });
        }
      } else {
        // Add user to existing reaction
        const updatedReaction = {
          emoji,
          users: [...existingReaction.users, user.id],
          count: existingReaction.count + 1
        };
        await updateDoc(messageRef, {
          reactions: arrayRemove(existingReaction)
        });
        await updateDoc(messageRef, {
          reactions: arrayUnion(updatedReaction)
        });
      }
    } else {
      // Create new reaction
      await updateDoc(messageRef, {
        reactions: arrayUnion({
          emoji,
          users: [user.id],
          count: 1
        })
      });
    }
    
    setShowEmojiPicker(null);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!user) return;
    
    const message = messages.find(m => m.id === messageId);
    if (!message || message.userId !== user.id) return;

    try {
      const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
      await updateDoc(messageRef, {
        deleted: true,
        content: '[Message deleted]'
      });
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
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageContent = (message: Message) => {
    if (message.deleted) {
      return <span className="italic text-gray-500">[Message deleted]</span>;
    }

    if (message.type === 'image' && message.imageUrl) {
      return <ImageMessage imageUrl={message.imageUrl} />;
    }

    if (message.type === 'youtube' && message.youtubeUrl) {
      return <YouTubeEmbed url={message.youtubeUrl} />;
    }

    if (message.type === 'voice' && message.voiceUrl) {
      return <VoiceNotePlayer voiceUrl={message.voiceUrl} />;
    }

    return <span>{message.content}</span>;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${message.userId === user?.id ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg relative group ${
              message.userId === user?.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
            }`}
          >
            {message.replyTo && (
              <div className="mb-2 p-2 bg-black bg-opacity-20 rounded text-sm">
                <div className="font-semibold">{message.replyTo.username}</div>
                <div className="opacity-75 truncate">{message.replyTo.content}</div>
              </div>
            )}
            
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="font-semibold text-sm mb-1">{message.username}</div>
                <div className="break-words">{renderMessageContent(message)}</div>
                <div className="text-xs opacity-75 mt-1">
                  {formatTimestamp(message.timestamp)}
                </div>
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
                
                {message.userId === user?.id && (
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

            {/* Quick Reactions */}
            <div className="flex flex-wrap gap-1 mt-2">
              {quickReactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(message.id, emoji)}
                  className="text-lg p-1 hover:bg-black hover:bg-opacity-20 rounded transition-colors active:scale-95 touch-manipulation min-w-[32px] min-h-[32px] flex items-center justify-center"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Reactions Display */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {message.reactions.map((reaction, index) => (
                  <button
                    key={index}
                    onClick={() => handleReaction(message.id, reaction.emoji)}
                    className={`text-sm px-2 py-1 rounded-full flex items-center space-x-1 transition-colors ${
                      reaction.users.includes(user?.id || '')
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                        : 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                    }`}
                  >
                    <span>{reaction.emoji}</span>
                    <span>{reaction.count}</span>
                  </button>
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
            {showDropdown === message.id && message.userId === user?.id && (
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