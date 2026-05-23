import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEMO_USER, ensureDemoUserExists } from '../lib/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [hasSeenIntro, setHasSeenIntro] = useState(true);
  const [user, setUser] = useState(DEMO_USER);
  const isLoading = false;

  useEffect(() => {
    // Ensure the demo user profile exists in the Supabase public.users table
    ensureDemoUserExists();
  }, []);

  const login = async (token, userData) => {
    // Bypass for demo
    setIsLoggedIn(true);
    setUser(DEMO_USER);
  };

  const logout = async () => {
    // Do nothing or keep demo user to prevent logout issues
    setIsLoggedIn(true);
    setUser(DEMO_USER);
  };

  const markIntroSeen = async () => {
    setHasSeenIntro(true);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, hasSeenIntro, user, isLoading, login, logout, markIntroSeen }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthStore = () => useContext(AuthContext);
