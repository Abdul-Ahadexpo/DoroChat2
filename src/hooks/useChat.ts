import { useState, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { Message } from '../types';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showTeachModal, setShowTeachModal] = useState(false);
  const [lastUnknownQuestion, setLastUnknownQuestion] = useState('');

  useEffect(() => {
    // Initialize default responses
    chatService.initializeDefaultResponses();

    // Listen for messages
    const unsubscribe = chatService.onMessagesChange(setMessages);
    return unsubscribe;
  }, []);

  const sendMessage = async (text: string) => {
    setIsLoading(true);
    
    try {
      // Send user message
      await chatService.sendMessage(text, 'user');
      
      // Get bot response
      const botResponse = await chatService.getBotResponse(text);
      
      // Check if it's an unknown response
      if (botResponse.includes("I don't know how to answer that now")) {
        setLastUnknownQuestion(text);
        setShowTeachModal(true);
      }
      
      // Send bot message after a short delay for better UX
      setTimeout(async () => {
        await chatService.sendMessage(botResponse, 'bot');
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
    }
  };

  const handleTeachBot = async (question: string, answer: string) => {
    await chatService.addResponse(question, answer);
    setShowTeachModal(false);
    setLastUnknownQuestion('');
  };

  return {
    messages,
    sendMessage,
    isLoading,
    showTeachModal,
    lastUnknownQuestion,
    onCloseTeachModal: () => setShowTeachModal(false),
    onTeachBot: handleTeachBot
  };
}