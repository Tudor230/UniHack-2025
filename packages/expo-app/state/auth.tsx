import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const AUTH_STORAGE_KEY = 'authToken:v1';
const AUTH_USERNAME_KEY = 'authUsername:v1';

type AuthContextType = {
  token: string | null;
  username: string | null;
  isLoading: boolean;
  login: (token: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load token from storage on app start
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        const storedUsername = await AsyncStorage.getItem(AUTH_USERNAME_KEY);
        if (storedToken && storedUsername) {
          setToken(storedToken);
          setUsername(storedUsername);
        }
      } catch (e) {
        console.error('Failed to load auth token', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (token: string, username: string) => {
      try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, token);
      await AsyncStorage.setItem(AUTH_USERNAME_KEY, username);
      setToken(token);
      setUsername(username);
    } catch (e) {
      console.error('Failed to save auth token', e);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      await AsyncStorage.removeItem(AUTH_USERNAME_KEY);
      setToken(null);
      setUsername(null);
      // On logout, always send user to the login screen
      router.replace('/login');
    } catch (e) {
      console.error('Failed to remove auth token', e);
    }
  }, [router]);

  const value = useMemo(
    () => ({
      token,
      username,
      isLoading,
      login,
      logout,
    }),
    [token, username, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}