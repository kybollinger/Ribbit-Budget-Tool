import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useState, useEffect } from 'react';

const STORAGE_KEY_AUTH = '@flow_auth';

interface User {
  id: string;
  email: string;
  name: string;
  provider: 'google' | 'apple' | 'email';
  profilePicture?: string;
  financeGoalNotes?: string;
  financeGoals?: string[];
  streakData?: {
    currentStreak: number;
    lastTransactionDate?: string;
    longestStreak: number;
  };
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);

  const authQuery = useQuery({
    queryKey: ['auth'],
    queryFn: async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY_AUTH);
        console.log('Loaded auth from storage:', stored ? `found (${stored.substring(0, 50)}...)` : 'null');
        
        if (!stored || stored === 'null' || stored === 'undefined' || stored.trim() === '') {
          console.log('No valid stored data found');
          return null;
        }
        
        if (stored.startsWith('[object') || stored === '[object Object]') {
          console.error('Invalid data format detected (object toString):', stored.substring(0, 100));
          await AsyncStorage.removeItem(STORAGE_KEY_AUTH);
          return null;
        }
        
        try {
          const parsed = JSON.parse(stored);
          
          if (!parsed || typeof parsed !== 'object') {
            console.error('Parsed data is not an object:', typeof parsed);
            await AsyncStorage.removeItem(STORAGE_KEY_AUTH);
            return null;
          }
          
          if (!parsed.id || !parsed.email || !parsed.name) {
            console.error('Parsed data is missing required fields:', parsed);
            await AsyncStorage.removeItem(STORAGE_KEY_AUTH);
            return null;
          }
          
          console.log('Successfully loaded user:', parsed.email);
          return parsed as User;
        } catch (parseError) {
          console.error('JSON parse error:', parseError, 'Data:', stored.substring(0, 100));
          await AsyncStorage.removeItem(STORAGE_KEY_AUTH);
          return null;
        }
      } catch (error) {
        console.error('Error loading auth (outer catch):', error);
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
      
      const stringified = JSON.stringify(mockUser);
      if (!stringified || stringified === 'undefined' || stringified.startsWith('[object')) {
        throw new Error('Failed to serialize user data');
      }
      await AsyncStorage.setItem(STORAGE_KEY_AUTH, stringified);
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
      
      const stringified = JSON.stringify(mockUser);
      if (!stringified || stringified === 'undefined' || stringified.startsWith('[object')) {
        throw new Error('Failed to serialize user data');
      }
      await AsyncStorage.setItem(STORAGE_KEY_AUTH, stringified);
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

  const signUpWithEmailMutation = useMutation({
    mutationFn: async (params: { name: string; email: string }) => {
      if (!params.name || !params.email) {
        throw new Error('Name and email are required');
      }
      
      if (!params.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      const mockUser: User = {
        id: Date.now().toString(),
        email: params.email,
        name: params.name,
        provider: 'email',
      };
      
      const stringified = JSON.stringify(mockUser);
      if (!stringified || stringified === 'undefined' || stringified.startsWith('[object')) {
        throw new Error('Failed to serialize user data');
      }
      await AsyncStorage.setItem(STORAGE_KEY_AUTH, stringified);
      return mockUser;
    },
    onSuccess: (data) => {
      setUser(data);
      console.log('Signed up with email:', data);
    },
    onError: (error) => {
      console.error('Email sign-up error:', error);
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

  const updateProfileMutation = useMutation({
    mutationFn: async ({ name, profilePicture, financeGoalNotes, financeGoals, streakData }: { name?: string; profilePicture?: string; financeGoalNotes?: string; financeGoals?: string[]; streakData?: User['streakData'] }) => {
      if (!user) throw new Error('No user to update');
      
      const updates: Partial<User> = {};
      if (name !== undefined) updates.name = name;
      if (profilePicture !== undefined) updates.profilePicture = profilePicture;
      if (financeGoalNotes !== undefined) updates.financeGoalNotes = financeGoalNotes;
      if (financeGoals !== undefined) {
        if (!Array.isArray(financeGoals)) {
          console.error('financeGoals is not an array:', financeGoals);
          throw new Error('financeGoals must be an array');
        }
        updates.financeGoals = financeGoals;
      }
      if (streakData !== undefined) {
        if (typeof streakData !== 'object' || streakData === null) {
          console.error('streakData is invalid:', streakData);
          throw new Error('streakData must be an object');
        }
        updates.streakData = streakData;
      }
      
      const updatedUser: User = {
        ...user,
        ...updates,
      };
      
      console.log('Attempting to save user:', JSON.stringify(updatedUser, null, 2));
      
      let stringified: string;
      try {
        stringified = JSON.stringify(updatedUser);
      } catch (e) {
        console.error('JSON.stringify failed:', e, updatedUser);
        throw new Error('Failed to serialize user data: ' + e);
      }
      
      console.log('Stringified user data length:', stringified.length);
      
      if (!stringified || stringified === 'undefined' || stringified.startsWith('[object')) {
        console.error('Invalid stringified data:', stringified);
        throw new Error('Failed to serialize user data - invalid format');
      }
      
      try {
        await AsyncStorage.setItem(STORAGE_KEY_AUTH, stringified);
        console.log('User data saved successfully');
      } catch (e) {
        console.error('AsyncStorage.setItem failed:', e);
        throw new Error('Failed to save user data: ' + e);
      }
      
      return updatedUser;
    },
    onSuccess: (data) => {
      setUser(data);
      console.log('Profile updated:', data);
    },
    onError: (error) => {
      console.error('Profile update error:', error);
    },
  });

  const updateStreak = (transactionDate: string) => {
    if (!user) return { isNewStreak: false, currentStreak: 0 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const txDate = new Date(transactionDate);
    txDate.setHours(0, 0, 0, 0);

    const currentStreakData = user.streakData || {
      currentStreak: 0,
      longestStreak: 0,
    };

    const lastDate = currentStreakData.lastTransactionDate
      ? new Date(currentStreakData.lastTransactionDate)
      : null;
    
    if (lastDate) {
      lastDate.setHours(0, 0, 0, 0);
    }

    if (lastDate && lastDate.getTime() === today.getTime()) {
      return { isNewStreak: false, currentStreak: currentStreakData.currentStreak };
    }

    let newStreak = currentStreakData.currentStreak;
    let isNewStreak = false;

    if (!lastDate) {
      newStreak = 1;
      isNewStreak = true;
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastDate.getTime() === yesterday.getTime()) {
        newStreak = currentStreakData.currentStreak + 1;
        isNewStreak = true;
      } else if (txDate.getTime() === today.getTime()) {
        newStreak = 1;
        isNewStreak = true;
      } else {
        newStreak = 1;
        isNewStreak = false;
      }
    }

    const longestStreak = Math.max(newStreak, currentStreakData.longestStreak);

    const newStreakData = {
      currentStreak: newStreak,
      lastTransactionDate: today.toISOString(),
      longestStreak,
    };

    updateProfileMutation.mutate({ streakData: newStreakData });

    return { isNewStreak, currentStreak: newStreak };
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: authQuery.isLoading,
    signInWithGoogle: signInWithGoogleMutation.mutate,
    signInWithApple: signInWithAppleMutation.mutate,
    signUpWithEmail: signUpWithEmailMutation.mutate,
    signOut: signOutMutation.mutate,
    updateProfile: updateProfileMutation.mutate,
    updateStreak,
    isSigningIn: signInWithGoogleMutation.isPending || signInWithAppleMutation.isPending || signUpWithEmailMutation.isPending,
    isSigningOut: signOutMutation.isPending,
    isUpdatingProfile: updateProfileMutation.isPending,
  };
});
