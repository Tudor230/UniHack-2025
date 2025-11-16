import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const AUTH_STORAGE_KEY = 'authToken:v1';

type AuthContextType = {
  token: string | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Load token from storage on app start
  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
        if (storedToken) {
          setToken(storedToken);
        }
      } catch (e) {
        console.error('Failed to load auth token', e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (token: string) => {
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, token);
      setToken(token);
    } catch (e) {
      console.error('Failed to save auth token', e);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      setToken(null);
      // On logout, always send user to the login screen
      router.replace('/login');
    } catch (e) {
      console.error('Failed to remove auth token', e);
    }
  }, [router]);

  const value = useMemo(
    () => ({
      token,
      isLoading,
      login,
      logout,
    }),
    [token, isLoading, login, logout]
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