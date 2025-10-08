import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import storage from '../utils/storage';
import { registerDevice, updateDeviceActivity } from '../services/firebase';
import { User } from '../utils/types';

interface UserContextType {
  user: User;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>({
    id: '',
    name: '',
    color: '',
    fontStyle: '',
  });

  // Load user data from localStorage on initial render
  useEffect(() => {
    // Initialize device tracking
    const initializeDevice = async () => {
      let deviceInfo = storage.getDeviceInfo();
      
      if (!deviceInfo) {
        const fingerprint = storage.generateDeviceFingerprint();
        const deviceName = storage.getDeviceName();
        
        deviceInfo = {
          fingerprint,
          deviceName,
          userAgent: navigator.userAgent,
          language: navigator.language,
          screenResolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          firstVisit: Date.now(),
        };
        
        storage.setDeviceInfo(deviceInfo);
        
        // Register device in Firebase
        try {
          await registerDevice(deviceInfo);
        } catch (error) {
          console.error('Error registering device:', error);
        }
      }
    };
    
    initializeDevice();
    
    const loadedUser: User = {
      id: storage.getUserId(),
      name: storage.getUserName(),
      color: storage.getUserColor(),
      fontStyle: storage.getUserFontStyle(),
      profileImage: storage.getUserProfileImage(),
    };
    
    setUser(loadedUser);
  }, []);

  // Update user data
  const updateUser = (updates: Partial<User>) => {
    setUser(prevUser => {
      const updatedUser = { ...prevUser, ...updates };
      
      // Persist changes to localStorage
      if (updates.name) storage.setUserName(updates.name);
      if (updates.color) storage.setUserColor(updates.color);
      if (updates.fontStyle) storage.setUserFontStyle(updates.fontStyle);
      if (updates.profileImage !== undefined) storage.setUserProfileImage(updates.profileImage);
      
      return updatedUser;
    });
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
};