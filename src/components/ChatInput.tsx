import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Auto-focus on keypress for desktop only (not mobile)
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only on desktop (screen width > 640px) and not touch devices
      if (window.innerWidth <= 640 || 'ontouchstart' in window) return;
      
      // Don't interfere if user is already typing in an input/textarea
      const activeElement = document.activeElement;
      if (activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.getAttribute('contenteditable') === 'true'
      )) {
        return;
      }

      // Don't interfere with keyboard shortcuts
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      
      // Don't interfere with special keys
      if (e.key.length > 1 && !['Backspace', 'Delete'].includes(e.key)) return;

      // Focus the input and let the character be typed
      if (inputRef.current && !disabled) {
        inputRef.current.focus();
        
        // If it's a printable character, add it to the input
        if (e.key.length === 1) {
          setMessage(prev => prev + e.key);
          e.preventDefault();
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [disabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-slate-900 via-slate-800/95 to-slate-800/90 backdrop-blur-xl border-t border-slate-700/50 p-3 sm:p-4 md:p-5 shadow-2xl animate-slide-in">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="flex items-end space-x-3 sm:space-x-4">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          <input
            ref={inputRef}
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything about SenTorial..."
            disabled={disabled}
              className="w-full border-2 border-slate-600/50 rounded-2xl pl-12 pr-4 py-3.5 sm:py-4 bg-slate-700/80 text-white placeholder-slate-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-base min-h-[52px] shadow-lg backdrop-blur-sm"
            style={{ fontSize: '16px' }}
          />
          </div>
          <button
            type="submit"
            disabled={disabled || !message.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3.5 sm:p-4 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl hover-lift focus-ring min-h-[52px] min-w-[52px] flex items-center justify-center group"
          >
            <Send size={20} className="sm:w-5 sm:h-5 group-hover:translate-x-0.5 transition-transform duration-200" />
          </button>
        </form>
        
        {/* Typing indicator */}
        {disabled && (
          <div className="flex items-center justify-center mt-3 text-slate-400 text-sm">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <span className="ml-2">AI is thinking...</span>
          </div>
        )}
      </div>
    </div>
  );
}