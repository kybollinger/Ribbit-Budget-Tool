import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAppearance } from '@/contexts/AppearanceContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

export default function TransactionsToSortScreen() {
  const { theme } = useAppearance();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Transactions to be sorted',
          headerStyle: { backgroundColor: theme.colors.cardBackground },
          headerTintColor: theme.colors.text.primary,
        }} 
      />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.colors.text.secondary, fontSize: 16 * theme.textScale }]}>
              No transactions to sort
            </Text>
          </View>
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
});
