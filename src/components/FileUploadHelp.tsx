import React, { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export function FileUploadHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const exampleFormat = {
    "hello": "Hello! How can I help you today?",
    "what is your name": "I'm Doro GPT, your learning assistant!",
    "how are you": "I'm doing great! Thanks for asking.",
    "goodbye": "Goodbye! Have a wonderful day!",
    "example with line breaks": "This is line 1\nThis is line 2\nThis is line 3"
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-gray-300 transition-colors"
        title="Upload format help"
      >
        <HelpCircle size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">JSON Upload Format</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-300"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-gray-300 text-sm">
                Upload a JSON file with question-answer pairs in this format:
              </p>
              
              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                {JSON.stringify(exampleFormat, null, 2)}
              </pre>
              
              <div className="text-gray-400 text-xs space-y-1">
                <p>• Questions will be automatically normalized to lowercase</p>
                <p>• Existing responses with same questions will be overwritten</p>
                <p>• Invalid entries will be skipped</p>
                <p>• Use \n for line breaks in responses</p>
                <p>• Spaces and formatting will be preserved in answers</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}