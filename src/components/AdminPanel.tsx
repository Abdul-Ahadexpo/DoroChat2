import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { 
  getChatRooms, 
  getMessages, 
  deleteMessage, 
  deleteRoom,
  database,
  getAllDevices
} from '../services/firebase';
import { ref, remove, get } from 'firebase/database';
import { ChatRoom, Message, MessageType } from '../utils/types';
import { 
  Shield, 
  Trash2, 
  Eye, 
  Lock, 
  Unlock, 
  MessageSquare, 
  Download, 
  Play, 
  Pause, 
  Volume2,
  Users,
  Calendar,
  Clock,
  User,
  Monitor,
  Smartphone,
  MapPin
} from 'lucide-react';

interface VoiceMessage {
  id: string;
  roomId: string;
  roomName: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  content: string;
  timestamp: number;
}

const AdminPanel: React.FC = () => {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [roomMessages, setRoomMessages] = useState<Message[]>([]);
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'rooms' | 'voices' | 'devices'>('rooms');
  const [loading, setLoading] = useState(true);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});
  const { user } = useUser();

  useEffect(() => {
    loadRooms();
    loadAllVoiceMessages();
    loadAllDevices();
  }, []);

  const loadRooms = () => {
    getChatRooms((roomList) => {
      // Show ALL rooms including hidden ones for admin
      setRooms(roomList);
      setLoading(false);
    });
  };

  const loadAllVoiceMessages = async () => {
    try {
      const voicesRef = ref(database, 'messages');
      const snapshot = await get(voicesRef);
      
      if (snapshot.exists()) {
        const allMessages = snapshot.val();
        const voices: VoiceMessage[] = [];
        
        // Get room names for reference
        const roomsRef = ref(database, 'chatRooms');
        const roomsSnapshot = await get(roomsRef);
        const roomsData = roomsSnapshot.exists() ? roomsSnapshot.val() : {};
        
        Object.entries(allMessages).forEach(([roomId, messages]: [string, any]) => {
          const roomName = roomsData[roomId]?.name || 'Unknown Room';
          
          Object.entries(messages).forEach(([messageId, message]: [string, any]) => {
            if (message.type === MessageType.VOICE) {
              voices.push({
                id: messageId,
                roomId,
                roomName,
                senderId: message.senderId,
                senderName: message.senderName,
                senderColor: message.senderColor,
                content: message.content,
                timestamp: message.timestamp
              });
            }
          });
        });
        
        // Sort by room, then sender, then time
        voices.sort((a, b) => {
          if (a.roomName !== b.roomName) return a.roomName.localeCompare(b.roomName);
          if (a.senderName !== b.senderName) return a.senderName.localeCompare(b.senderName);
          return a.timestamp - b.timestamp;
        });
        
        setVoiceMessages(voices);
      }
    } catch (error) {
      console.error('Error loading voice messages:', error);
    }
  };

  const loadAllDevices = () => {
    getAllDevices((deviceList) => {
      // Sort devices by last seen (most recent first)
      const sortedDevices = deviceList.sort((a, b) => b.lastSeen - a.lastSeen);
      setDevices(sortedDevices);
    });
  };

  const loadRoomMessages = (room: ChatRoom) => {
    setSelectedRoom(room);
    getMessages(room.id, (messages) => {
      setRoomMessages(messages);
    });
  };

  const clearRoomMessages = async (roomId: string) => {
    if (window.confirm('Are you sure you want to clear ALL messages in this room? This cannot be undone!')) {
      try {
        const messagesRef = ref(database, `messages/${roomId}`);
        await remove(messagesRef);
        
        // Reload messages if this room is currently selected
        if (selectedRoom?.id === roomId) {
          setRoomMessages([]);
        }
        
        alert('Room messages cleared successfully!');
      } catch (error) {
        console.error('Error clearing room messages:', error);
        alert('Failed to clear room messages');
      }
    }
  };

  const deleteRoomPermanently = async (roomId: string) => {
    if (window.confirm('Are you sure you want to PERMANENTLY DELETE this room and all its data? This cannot be undone!')) {
      try {
        await deleteRoom(roomId);
        
        if (selectedRoom?.id === roomId) {
          setSelectedRoom(null);
          setRoomMessages([]);
        }
        
        alert('Room deleted permanently!');
        loadRooms(); // Refresh room list
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Failed to delete room');
      }
    }
  };

  const playVoiceMessage = (voiceId: string, audioUrl: string) => {
    // Stop any currently playing audio
    Object.values(audioElements).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    
    if (playingVoice === voiceId) {
      setPlayingVoice(null);
      return;
    }
    
    const audio = new Audio(audioUrl);
    audio.play().then(() => {
      setPlayingVoice(voiceId);
      setAudioElements(prev => ({ ...prev, [voiceId]: audio }));
      
      audio.onended = () => {
        setPlayingVoice(null);
      };
    }).catch(error => {
      console.error('Error playing audio:', error);
    });
  };

  const downloadVoiceMessage = (audioUrl: string, senderName: string, timestamp: number) => {
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `voice-${senderName}-${new Date(timestamp).toISOString()}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const deleteVoiceMessage = async (voiceMessage: VoiceMessage) => {
    if (window.confirm(`Delete voice message from ${voiceMessage.senderName}?`)) {
      try {
        await deleteMessage(voiceMessage.roomId, voiceMessage.id);
        loadAllVoiceMessages(); // Refresh voice messages
        alert('Voice message deleted!');
      } catch (error) {
        console.error('Error deleting voice message:', error);
        alert('Failed to delete voice message');
      }
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return 'Recent';
  };

  // Group voice messages by room and sender
  const groupedVoiceMessages = voiceMessages.reduce((acc, voice) => {
    if (!acc[voice.roomName]) acc[voice.roomName] = {};
    if (!acc[voice.roomName][voice.senderName]) acc[voice.roomName][voice.senderName] = [];
    acc[voice.roomName][voice.senderName].push(voice);
    return acc;
  }, {} as { [roomName: string]: { [senderName: string]: VoiceMessage[] } });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Admin Panel...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-red-800 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Shield className="h-8 w-8 text-red-200" />
            <h1 className="text-2xl font-bold text-red-100">Admin Control Panel</h1>
          </div>
          <div className="text-red-200">
            Logged in as: {user.name} (Admin)
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'rooms'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <MessageSquare className="inline w-5 h-5 mr-2" />
              Room Management ({rooms.length})
            </button>
            <button
              onClick={() => setActiveTab('voices')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'voices'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Volume2 className="inline w-5 h-5 mr-2" />
              Voice Messages ({voiceMessages.length})
            </button>
            <button
              onClick={() => setActiveTab('devices')}
              className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'devices'
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Monitor className="inline w-5 h-5 mr-2" />
              Devices ({devices.length})
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'rooms' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rooms List */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-4">
                <h2 className="text-xl font-semibold mb-4 text-gray-100">All Rooms</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {rooms.map((room) => (
                    <div
                      key={room.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedRoom?.id === room.id
                          ? 'bg-red-700 text-white'
                          : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                      }`}
                      onClick={() => loadRoomMessages(room)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium truncate">{room.name}</span>
                            {room.isPrivate && <Lock size={14} className="text-yellow-400" />}
                            {room.isHidden && <Eye size={14} className="text-gray-400" />}
                            {!room.isTemporary && <Shield size={14} className="text-green-400" />}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            Created: {formatTime(room.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearRoomMessages(room.id);
                          }}
                          className="text-xs bg-yellow-600 hover:bg-yellow-700 px-2 py-1 rounded text-white"
                        >
                          Clear Messages
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRoomPermanently(room.id);
                          }}
                          className="text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-white"
                        >
                          Delete Room
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Room Details */}
            <div className="lg:col-span-2">
              {selectedRoom ? (
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-100">
                      {selectedRoom.name}
                    </h2>
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Users size={16} />
                      <span>Messages: {roomMessages.length}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {roomMessages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        No messages in this room
                      </div>
                    ) : (
                      roomMessages.map((message) => (
                        <div key={message.id} className="bg-gray-700 p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span 
                                className="font-medium"
                                style={{ color: message.senderColor }}
                              >
                                {message.senderName}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatTime(message.timestamp)}
                              </span>
                              <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                                {message.type}
                              </span>
                            </div>
                            <button
                              onClick={() => deleteMessage(selectedRoom.id, message.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="text-sm text-gray-300">
                            {message.type === MessageType.TEXT && message.content}
                            {message.type === MessageType.IMAGE && '📷 Image'}
                            {message.type === MessageType.VOICE && '🎤 Voice Message'}
                            {message.type === MessageType.YOUTUBE && '📺 YouTube Video'}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 rounded-lg p-8 text-center">
                  <MessageSquare size={48} className="mx-auto text-gray-600 mb-4" />
                  <p className="text-gray-400">Select a room to view its messages</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'voices' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">
              All Voice Messages ({voiceMessages.length})
            </h2>
            
            {Object.keys(groupedVoiceMessages).length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Volume2 size={48} className="mx-auto mb-4 opacity-50" />
                <p>No voice messages found</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedVoiceMessages).map(([roomName, senders]) => (
                  <div key={roomName} className="border border-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-blue-400 mb-3 flex items-center">
                      <MessageSquare size={20} className="mr-2" />
                      {roomName}
                    </h3>
                    
                    {Object.entries(senders).map(([senderName, voices]) => (
                      <div key={senderName} className="mb-4 last:mb-0">
                        <h4 className="text-md font-medium text-green-400 mb-2 flex items-center">
                          <User size={16} className="mr-2" />
                          {senderName} ({voices.length} messages)
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {voices.map((voice) => (
                            <div key={voice.id} className="bg-gray-700 p-3 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <Clock size={14} className="text-gray-400" />
                                  <span className="text-xs text-gray-400">
                                    {formatTime(voice.timestamp)}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {formatDuration(voice.timestamp)}
                                </span>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => playVoiceMessage(voice.id, voice.content)}
                                  className={`p-2 rounded-full transition-colors ${
                                    playingVoice === voice.id
                                      ? 'bg-red-600 text-white'
                                      : 'bg-gray-600 hover:bg-gray-500 text-gray-200'
                                  }`}
                                >
                                  {playingVoice === voice.id ? <Pause size={16} /> : <Play size={16} />}
                                </button>
                                
                                <button
                                  onClick={() => downloadVoiceMessage(voice.content, voice.senderName, voice.timestamp)}
                                  className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white"
                                  title="Download"
                                >
                                  <Download size={16} />
                                </button>
                                
                                <button
                                  onClick={() => deleteVoiceMessage(voice)}
                                  className="p-2 bg-red-600 hover:bg-red-700 rounded-full text-white"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'devices' && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-100">
              All Devices ({devices.length})
            </h2>
            
            {devices.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <Monitor size={48} className="mx-auto mb-4 opacity-50" />
                <p>No devices found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {devices.map((device) => (
                  <div key={device.fingerprint} className="border border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                          {device.deviceName?.includes('Phone') || device.deviceName?.includes('iPhone') ? (
                            <Smartphone size={20} className="text-white" />
                          ) : (
                            <Monitor size={20} className="text-white" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-blue-400">
                            {device.deviceName || 'Unknown Device'}
                          </h3>
                          <p className="text-sm text-gray-400">
                            ID: {device.fingerprint}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-400">
                        <p>Last Seen: {formatTime(device.lastSeen)}</p>
                        <p>First Visit: {formatTime(device.firstVisit)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-300">Device Info</h4>
                        <div className="text-xs text-gray-400 space-y-1">
                          <p><strong>Language:</strong> {device.language}</p>
                          <p><strong>Screen:</strong> {device.screenResolution}</p>
                          <p><strong>Timezone:</strong> {device.timezone}</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium text-gray-300">Browser Info</h4>
                        <div className="text-xs text-gray-400">
                          <p className="truncate" title={device.userAgent}>
                            {device.userAgent?.substring(0, 60)}...
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {device.roomVisits && Object.keys(device.roomVisits).length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2 flex items-center">
                          <MapPin size={16} className="mr-2" />
                          Room Visits ({Object.keys(device.roomVisits).length} rooms)
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {Object.entries(device.roomVisits).map(([roomId, roomData]: [string, any]) => (
                            <div key={roomId} className="bg-gray-700 p-2 rounded">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-green-400 font-medium">
                                  {roomData.roomName}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {roomData.visits?.length || 0} visits
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Last visit: {formatTime(Math.max(...(roomData.visits || [0])))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;