import React, { useState, useEffect } from 'react';
import { getMessages } from '../services/firebase';
import { useUser } from '../contexts/UserContext';
import { saveRoom, removeSavedRoom, isRoomSaved } from '../utils/storage';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Message } from '../utils/types';
import { Bookmark, BookmarkCheck } from 'lucide-react';

interface ChatRoomProps {
  roomId: string;
  roomName: string;
  isPrivate?: boolean;
  password?: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, roomName, isPrivate, password }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [replyTo, setReplyTo] = useState<{
    id: string;
    content: string;
    senderName: string;
  } | null>(null);
  const { user } = useUser();

  useEffect(() => {
    setLoading(true);
    setSaved(isRoomSaved(roomId));
    
    const unsubscribe = getMessages(roomId, (messageList) => {
      const sortedMessages = [...messageList].sort((a, b) => a.timestamp - b.timestamp);
      setMessages(sortedMessages);
      setLoading(false);
    });
    
    return () => {
      unsubscribe;
    };
  }, [roomId]);

  const handleReply = (message: Message) => {
    setReplyTo({
      id: message.id,
      content: message.content,
      senderName: message.senderName
    });
  };

  const handleSaveRoom = () => {
    if (saved) {
      removeSavedRoom(roomId);
      setSaved(false);
    } else {
      saveRoom(roomId, roomName, password);
      setSaved(true);
    }
  };

  return (
    <div className="flex flex-col h-full transition-all duration-300 ease-in-out">
      <div className="p-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 transition-all duration-300">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white truncate font-comic">
          {roomName}
          </h2>
          <button
            onClick={handleSaveRoom}
            className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
              saved 
                ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30' 
                : 'text-gray-500 hover:text-yellow-500 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            aria-label={saved ? 'Remove from saved rooms' : 'Save room'}
          >
            {saved ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center transition-all duration-500">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-700 transition-all duration-300"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400 font-patrick animate-pulse">Loading messages...</p>
          </div>
        </div>
      ) : (
        <MessageList 
          messages={messages} 
          roomId={roomId}
          onReply={handleReply}
        />
      )}
      
      <MessageInput 
        roomId={roomId}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </div>
  );
};

export default ChatRoom;