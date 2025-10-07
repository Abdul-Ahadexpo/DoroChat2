import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import UserSettings from './components/UserSettings';
import ChatRoomList from './components/ChatRoomList';
import ChatRoom from './components/ChatRoom';
import AdminLogin from './components/AdminLogin';
import AdminPanel from './components/AdminPanel';
import { ChatRoom as ChatRoomType } from './utils/types';

function App() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);

  // Admin login handlers
  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    setShowAdminLogin(false);
  };

  const handleBackToChat = () => {
    setIsAdminLoggedIn(false);
    setShowAdminLogin(false);
  };

  // Show admin login modal
  if (showAdminLogin && !isAdminLoggedIn) {
    return <AdminLogin onLogin={handleAdminLogin} />;
  }

  // Show admin panel if logged in
  if (isAdminLoggedIn) {
    return (
      <div>
        <AdminPanel />
        <button
          onClick={handleBackToChat}
          className="fixed top-4 right-4 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors z-50"
        >
          Back to Chat
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-pink-50 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 md:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-6 md:h-8 w-6 md:w-8 text-violet-600 dark:text-violet-400" />
              <h1 className="text-xl md:text-2xl font-bold text-violet-900 dark:text-violet-300 font-comic">
                Doro Chat 💬
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowAdminLogin(true)}
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                title="Admin Panel"
              >
                <MessageCircle size={20} />
              </button>
              <UserSettings />
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto px-2 md:px-6 lg:px-8 py-3 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-6 h-[calc(100vh-5rem)] md:h-[calc(100vh-8rem)]">
          {/* Sidebar with chat rooms */}
          <div className="md:col-span-1 order-2 md:order-1">
            <ChatRoomList 
              onRoomSelect={setSelectedRoom} 
              selectedRoomId={selectedRoom?.id || null} 
            />
          </div>
          
          {/* Chat area */}
          <div className="md:col-span-3 order-1 md:order-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
            {selectedRoom ? (
              <ChatRoom 
                roomId={selectedRoom.id} 
                roomName={selectedRoom.name} 
                isPrivate={selectedRoom.isPrivate}
                password={selectedRoom.password}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 text-center">
                <MessageCircle className="h-12 md:h-16 w-12 md:w-16 text-gray-400 dark:text-gray-600 mb-4" />
                <h2 className="text-lg md:text-xl font-medium text-gray-700 dark:text-gray-300 mb-2 font-comic">
                  Welcome to Doro Chat! 🎉
                </h2>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 max-w-md font-patrick">
                  Search for a chat room or create a new one to start messaging with friends!
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;