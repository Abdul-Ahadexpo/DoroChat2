import React, { useState } from 'react';
import { Brain, X, Send } from 'lucide-react';

interface TeachBotModalProps {
  isOpen: boolean;
  question: string;
  onClose: () => void;
  onTeach: (question: string, answer: string) => void;
}

export function TeachBotModal({ isOpen, question, onClose, onTeach }: TeachBotModalProps) {
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (answer.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onTeach(question, answer.trim());
        setAnswer('');
        onClose();
      } catch (error) {
        console.error('Error teaching bot:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setAnswer('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-4 z-50 animate-fade-in">
      <div className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-4 md:p-6 border border-slate-700 animate-scale-in hover-lift">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="bg-purple-100 p-1.5 md:p-2 rounded-full animate-bounce-in">
              <Brain size={20} className="text-purple-600" />
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white">Teach SenTorial</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-white transition-all duration-200 hover-lift focus-ring rounded-full p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3 md:space-y-4">
          <div>
            <label className="block text-xs md:text-sm font-medium text-slate-300 mb-2">
              Question Asked:
            </label>
            <div className="bg-slate-700 p-2 md:p-3 rounded-lg border border-slate-600 animate-slide-in-left">
              <p className="text-white text-xs md:text-sm">{question}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-slate-300 mb-2">
                Teach the correct answer:
              </label>
              <textarea
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type the correct answer here...\n\nTip: Press Enter for line breaks - they will be preserved in the response!"
                className="w-full p-2 md:p-3 border border-slate-600 rounded-lg focus-ring bg-slate-700 text-white placeholder-slate-400 resize-none transition-all duration-200 text-sm md:text-base"
                rows={5}
                disabled={isSubmitting}
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                type="submit"
                disabled={!answer.trim() || isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-2 md:py-3 rounded-lg transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 hover-lift focus-ring text-sm md:text-base"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-white"></div>
                    <span>Teaching...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} className="md:w-4 md:h-4" />
                    <span>Teach Bot</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-4 md:px-6 bg-slate-600 hover:bg-slate-700 text-white py-2 md:py-3 rounded-lg transition-all duration-200 font-medium hover-lift focus-ring text-sm md:text-base"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}