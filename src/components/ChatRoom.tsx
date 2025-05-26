import React, { useState, useEffect } from 'react';
import { getMessages } from '../services/firebase';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { Message } from '../utils/types';

interface ChatRoomProps {
  roomId: string;
  roomName: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, roomName }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<{
    id: string;
    content: string;
    senderName: string;
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    
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

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white truncate">
          {roomName}
        </h2>
      </div>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-700"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading messages...</p>
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