import React, { useEffect, useRef, useState } from 'react';
import { Message, MessageType } from '../utils/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import VoiceNotePlayer from './VoiceNotePlayer';
import ImageMessage from './ImageMessage';
import { Reply } from 'lucide-react';

interface MessageListProps {
  messages: Message[];
  roomId: string;
  onReply: (message: Message) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, roomId, onReply }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
    >
      {Object.keys(groupedMessages).length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      )}
      
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date} className="space-y-2">
          <div className="flex justify-center">
            <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-300">
              {date}
            </div>
          </div>
          
          {dateMessages.map((message) => (
            <div key={message.id} className="flex flex-col">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline space-x-2">
                  <span 
                    className={`font-medium ${message.senderFontStyle}`}
                    style={{ color: message.senderColor }}
                  >
                    {message.senderName}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <button
                  onClick={() => onReply(message)}
                  className="text-gray-500 hover:text-violet-600 dark:text-gray-400 dark:hover:text-violet-400"
                  aria-label="Reply to message"
                >
                  <Reply size={16} />
                </button>
              </div>
              
              {message.replyTo && (
                <div className="ml-4 mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded border-l-2 border-violet-500">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Replying to {message.replyTo.senderName}
                  </p>
                  <p className="text-sm truncate">{message.replyTo.content}</p>
                </div>
              )}
              
              <div className="mt-1 ml-1">
                {message.type === MessageType.TEXT && (
                  <div className="prose prose-sm dark:prose-invert max-w-none">
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
              </div>
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
          className="fixed bottom-24 right-8 bg-violet-600 text-white rounded-full p-2 shadow-lg hover:bg-violet-700 transition-colors"
          aria-label="Scroll to bottom"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      )}
    </div>
  );
};

export default MessageList;