import React from 'react';
import { Bot, Settings } from 'lucide-react';

interface ChatHeaderProps {
  onAdminClick: () => void;
}

export function ChatHeader({ onAdminClick }: ChatHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-800/95 backdrop-blur-md text-white p-2 sm:p-3 md:p-4 shadow-lg border-b border-slate-700 animate-slide-in-down">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
          <div className="bg-purple-500/20 p-1 sm:p-1.5 md:p-2 rounded-full animate-pulse-slow hover-lift">
            <Bot size={16} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold animate-fade-in">SenTorial-CHAT</h1>
            <p className="text-slate-300 text-xs sm:text-xs md:text-sm animate-fade-in flex items-center space-x-1">
           
              <span>Made By{" "}</span>
              <a 
                href="https://www.facebook.com/Nazim.AbdulAhad" 
                className="text-purple-400 hover:text-purple-300 underline transition-colors duration-200"
                target="_blank" 
                rel="noopener noreferrer"
              >
                <span className="sm:hidden">Abdul Ahad</span>
                <span className="hidden sm:inline">Abdul Ahad</span>
              </a>
            </p>
          </div>
        </div>
        <button
          onClick={onAdminClick}
          className="bg-purple-500/20 hover:bg-purple-500/40 p-1.5 sm:p-2 md:p-2 rounded-full transition-all duration-200 hover-lift focus-ring min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center"
        >
          <Settings size={16} className="sm:w-5 sm:h-5 md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  );
}