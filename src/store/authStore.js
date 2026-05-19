import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [hasSeenIntro, setHasSeenIntro] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('@auth_token');
        const storedIntro = await AsyncStorage.getItem('@has_seen_intro');
        
        if (storedToken) {
          setIsLoggedIn(true);
          setUser({ phone: 'user' });
        }
        
        if (storedIntro === 'true') {
          setHasSeenIntro(true);
        }
      } catch (e) {
        console.error('Failed to load auth state', e);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAuthState();
  }, []);

  const login = async (token, userData) => {
    await AsyncStorage.setItem('@auth_token', token);
    setIsLoggedIn(true);
    setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@auth_token');
    setIsLoggedIn(false);
    setUser(null);
  };

  const markIntroSeen = async () => {
    await AsyncStorage.setItem('@has_seen_intro', 'true');
    setHasSeenIntro(true);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, hasSeenIntro, user, isLoading, login, logout, markIntroSeen }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthStore = () => useContext(AuthContext);
