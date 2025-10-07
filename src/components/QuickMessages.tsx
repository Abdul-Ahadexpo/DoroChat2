import React, { useState, useEffect } from 'react';
import { Zap, ChevronUp, ChevronDown } from 'lucide-react';
import { chatService } from '../services/chatService';

interface QuickMessagesProps {
  onSendMessage: (message: string) => void;
}

export function QuickMessages({ onSendMessage }: QuickMessagesProps) {
  const [quickMessages, setQuickMessages] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const unsubscribe = chatService.onQuickMessagesChange(setQuickMessages);
    return unsubscribe;
  }, []);

  if (quickMessages.length === 0) return null;

  const visibleMessages = isExpanded ? quickMessages : quickMessages.slice(0, 3);

  return (
    <div className="fixed bottom-20 sm:bottom-24 md:bottom-28 left-0 right-0 z-40 px-3 sm:px-4 md:px-5 animate-slide-in">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-slate-800/95 to-slate-700/95 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-3 sm:p-4 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center space-x-1 sm:space-x-2">
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-1 rounded-lg">
                <Zap size={12} className="sm:w-4 sm:h-4 text-white" />
              </div>
              <span className="text-white text-xs sm:text-sm font-semibold">Quick Actions</span>
            </div>
            {quickMessages.length > 3 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-slate-400 hover:text-white transition-all duration-200 hover-lift bg-slate-700/50 rounded-lg p-1"
              >
                {isExpanded ? <ChevronDown size={12} className="sm:w-4 sm:h-4" /> : <ChevronUp size={12} className="sm:w-4 sm:h-4" />}
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {visibleMessages.map((message, index) => (
              <button
                key={index}
                onClick={() => onSendMessage(message)}
                className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 hover:from-purple-600/60 hover:to-blue-600/60 text-purple-200 hover:text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-300 border border-purple-500/20 hover:border-purple-400/60 hover-lift animate-scale-in min-h-[36px] flex items-center shadow-lg hover:shadow-xl backdrop-blur-sm"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <span className="truncate max-w-[120px] sm:max-w-none">{message}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}