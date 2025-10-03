import React from 'react';
import { TypingIndicator as TypingIndicatorType } from '../utils/types';

interface TypingIndicatorProps {
  typingUsers: TypingIndicatorType[];
  currentUserId: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ typingUsers, currentUserId }) => {
  const otherUsersTyping = typingUsers.filter(user => user.userId !== currentUserId);
  
  if (otherUsersTyping.length === 0) return null;

  const getTypingText = () => {
    if (otherUsersTyping.length === 1) {
      return `${otherUsersTyping[0].userName} is typing`;
    } else if (otherUsersTyping.length === 2) {
      return `${otherUsersTyping[0].userName} and ${otherUsersTyping[1].userName} are typing`;
    } else {
      return `${otherUsersTyping.length} people are typing`;
    }
  };

  return (
    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 italic animate-pulse">
      <div className="flex items-center space-x-2">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        <span>{getTypingText()}...</span>
      </div>
    </div>
  );
};

export default TypingIndicator;