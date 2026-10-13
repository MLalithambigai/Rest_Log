import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { theme } from './src/theme';
import { SleepEntry } from './src/types/sleep';
import { fetchSleepEntries } from './src/services/storage';
import { NavBar, ScreenTab } from './src/components/NavBar';
import { LogSleepScreen } from './src/screens/LogSleepScreen';
import { HistoryScreen } from './src/screens/HistoryScreen';
import { TrendsScreen } from './src/screens/TrendsScreen';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ScreenTab>('log');
  const [entries, setEntries] = useState<SleepEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    const data = await fetchSleepEntries();
    setEntries(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.container}>
          <View style={styles.screenContainer}>
            {currentTab === 'log' && (
              <LogSleepScreen
                onEntrySaved={loadData}
                onNavigateToHistory={() => setCurrentTab('history')}
              />
            )}

            {currentTab === 'history' && (
              <HistoryScreen
                entries={entries}
                onRefresh={loadData}
                onNavigateToLog={() => setCurrentTab('log')}
              />
            )}

            {currentTab === 'trends' && (
              <TrendsScreen
                entries={entries}
                onRefresh={loadData}
                onNavigateToLog={() => setCurrentTab('log')}
              />
            )}
          </View>

          <NavBar
            currentTab={currentTab}
            onSelectTab={setCurrentTab}
            historyCount={entries.length}
          />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  screenContainer: {
    flex: 1,
  },
});
