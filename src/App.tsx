import React, { useState } from 'react';
import { UserProvider } from './contexts/UserContext';
import { MessageCircle } from 'lucide-react';
import UserSettings from './components/UserSettings';
import ChatRoomList from './components/ChatRoomList';
import ChatRoom from './components/ChatRoom';
import { ChatRoom as ChatRoomType } from './utils/types';

function App() {
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);

  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-8 w-8 text-violet-600 dark:text-violet-400" />
                <h1 className="text-2xl font-bold text-violet-900 dark:text-violet-300">Doro Chat</h1>
              </div>
              <UserSettings />
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
            {/* Sidebar with chat rooms */}
            <div className="md:col-span-1">
              <ChatRoomList 
                onRoomSelect={setSelectedRoom} 
                selectedRoomId={selectedRoom?.id || null} 
              />
            </div>
            
            {/* Chat area */}
            <div className="md:col-span-3 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col h-full">
              {selectedRoom ? (
                <ChatRoom 
                  roomId={selectedRoom.id} 
                  roomName={selectedRoom.name} 
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <MessageCircle className="h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" />
                  <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Welcome to Doro Chat
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 max-w-md">
                    Select a chat room from the sidebar or create a new one to start messaging.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </UserProvider>
  );
}

export default App;