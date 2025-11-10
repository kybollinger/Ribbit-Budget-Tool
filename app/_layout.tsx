import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BudgetProvider } from "@/contexts/BudgetContext";
import { AnalysisProvider } from "@/contexts/AnalysisContext";
import { AppearanceProvider } from "@/contexts/AppearanceContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { trpc, trpcClient } from "@/lib/trpc";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="category/[id]"
        options={{
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="add-expense"
        options={{
          presentation: "modal",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="transaction-type-modal"
        options={{
          presentation: "transparentModal",
          animation: "fade",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="appearance-settings"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="recurring-payments"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-recurring-payment"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit-recurring-payment/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="categories-management"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-category"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit-category/[id]"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="notifications-settings"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        const storageKeys = [
          '@flow_transactions',
          '@flow_categories',
          '@flow_appearance'
        ];
        
        for (const key of storageKeys) {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            const trimmed = value.trim();
            if (trimmed.startsWith('[object') || trimmed === 'undefined' || trimmed === 'null' || trimmed === '') {
              console.log(`Clearing corrupted data for ${key}`);
              await AsyncStorage.removeItem(key);
            } else if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
              console.log(`Clearing invalid JSON data for ${key}`);
              await AsyncStorage.removeItem(key);
            } else {
              try {
                JSON.parse(trimmed);
              } catch (e) {
                console.log(`Clearing unparseable data for ${key}`);
                await AsyncStorage.removeItem(key);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        SplashScreen.hideAsync();
      }
    };
    
    initializeApp();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppearanceProvider>
          <NotificationsProvider>
            <BudgetProvider>
              <AnalysisProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </AnalysisProvider>
            </BudgetProvider>
          </NotificationsProvider>
        </AppearanceProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
