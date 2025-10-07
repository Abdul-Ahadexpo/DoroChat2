import React, { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { Message } from '../types';
import { MessageBubble } from './MessageBubble';

interface ChatWindowProps {
  messages: Message[];
}

export function ChatWindow({ messages }: ChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current && chatContainerRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div 
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-900 via-slate-850 to-slate-800 p-2 sm:p-3 md:p-4 pt-16 sm:pt-18 md:pt-20 lg:pt-24 pb-32 sm:pb-36 md:pb-40"
      style={{ 
        height: 'calc(100vh - 120px)', 
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      <div className="max-w-4xl mx-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full animate-fade-in">
            <div className="text-center text-slate-400 max-w-xs sm:max-w-sm md:max-w-md mx-auto px-2 sm:px-4">
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-700/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-slate-600/30 hover:border-slate-500/50 transition-all duration-500 hover-lift animate-bounce-in">
                <div className="bg-gradient-to-br from-purple-500/30 to-blue-500/30 p-3 sm:p-4 rounded-2xl w-fit mx-auto mb-4 sm:mb-6 animate-pulse-slow">
                  <Bot size={24} className="sm:w-8 sm:h-8 md:w-8 md:h-8 text-purple-400" />
                </div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 sm:mb-4 text-white bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Welcome to SenTorial-CHAT!</h3>
                <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed mb-4 sm:mb-6">Your intelligent assistant for SenTorial candles. Ask me anything!</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-400">
                  <div className="flex items-center space-x-2 bg-slate-700/50 rounded-lg p-2">
                    <span className="text-purple-400">🕯️</span>
                    <span>Candle expertise</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-700/50 rounded-lg p-2">
                    <span className="text-blue-400">🧮</span>
                    <span>Math calculations</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-700/50 rounded-lg p-2">
                    <span className="text-green-400">🔗</span>
                    <span>Website navigation</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-slate-700/50 rounded-lg p-2">
                    <span className="text-yellow-400">🧠</span>
                    <span>Learning & adapting</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageBubble
              key={message.id}
              message={message}
              isLatest={index === messages.length - 1}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}