import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

const STORAGE_KEY_AUTH = '@flow_auth';

interface User {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'apple';
  profilePicture?: string;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);

  const authQuery = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_AUTH);
        console.log('Loaded auth from storage:', stored ? 'found' : 'null');
        
        if (!stored) {
          return null;
        }
        
        const parsed = JSON.parse(stored);
        return parsed as User;
      } catch (error) {
        console.error('Error loading auth:', error);
        await AsyncStorage.removeItem(STORAGE_KEY_AUTH);
        return null;
      }
    },
  });

  useEffect(() => {
    if (authQuery.data !== undefined) {
      setUser(authQuery.data);
    }
  }, [authQuery.data]);

  const signInWithGoogleMutation = useMutation({
    mutationFn: async (credential: any) => {
      const mockUser: User = {
        id: Date.now().toString(),
        email: credential.email || 'user@gmail.com',
        name: credential.name || 'Google User',
        provider: 'google',
        profilePicture: credential.picture,
      };
      
      await AsyncStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(mockUser));
      return mockUser;
    },
    onSuccess: (data) => {
      setUser(data);
      console.log('Signed in with Google:', data);
    },
    onError: (error) => {
      console.error('Google sign-in error:', error);
    },
  });

  const signInWithAppleMutation = useMutation({
    mutationFn: async (credential: any) => {
      const mockUser: User = {
        id: Date.now().toString(),
        email: credential.email || 'user@icloud.com',
        name: credential.fullName?.givenName 
          ? `${credential.fullName.givenName} ${credential.fullName.familyName || ''}`.trim()
          : 'Apple User',
        provider: 'apple',
      };
      
      await AsyncStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(mockUser));
      return mockUser;
    },
    onSuccess: (data) => {
      setUser(data);
      console.log('Signed in with Apple:', data);
    },
    onError: (error) => {
      console.error('Apple sign-in error:', error);
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem(STORAGE_KEY_AUTH);
    },
    onSuccess: () => {
      setUser(null);
      console.log('Signed out successfully');
    },
  });

  return {
    user,
    isAuthenticated: !!user,
    isLoading: authQuery.isLoading,
    signInWithGoogle: signInWithGoogleMutation.mutate,
    signInWithApple: signInWithAppleMutation.mutate,
    signOut: signOutMutation.mutate,
    isSigningIn: signInWithGoogleMutation.isPending || signInWithAppleMutation.isPending,
    isSigningOut: signOutMutation.isPending,
  };
});
