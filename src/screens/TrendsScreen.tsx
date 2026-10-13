import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { theme } from '../theme';
import { DaySleepPoint, SleepEntry } from '../types/sleep';
import { getLast7DaysRolling, formatDurationCompact } from '../utils/time';
import { WeeklyChart } from '../components/WeeklyChart';
import { MetricCard } from '../components/MetricCard';
import { seedDemoWeek, clearAllSleepEntries } from '../services/storage';

interface TrendsScreenProps {
  entries: SleepEntry[];
  onRefresh: () => void;
  onNavigateToLog: () => void;
}

export const TrendsScreen: React.FC<TrendsScreenProps> = ({
  entries,
  onRefresh,
  onNavigateToLog,
}) => {
  // Map entries by dateStr (YYYY-MM-DD)
  const entriesMap: Record<string, SleepEntry> = {};
  entries.forEach((e) => {
    // If multiple entries on same date, pick the longest or latest
    if (!entriesMap[e.date] || e.durationMinutes > entriesMap[e.date].durationMinutes) {
      entriesMap[e.date] = e;
    }
  });

  // Build the 7-day rolling window
  const rolling7 = getLast7DaysRolling();
  const dayPoints: DaySleepPoint[] = rolling7.map((item) => {
    const matched = entriesMap[item.dateStr];
    const durationMinutes = matched ? matched.durationMinutes : 0;
    const durationHours = durationMinutes / 60;
    const quality = matched ? matched.quality : null;

    return {
      dayLabel: item.dayLabel,
      dateStr: item.dateStr,
      durationMinutes,
      durationHours,
      quality,
      hasEntry: !!matched,
    };
  });

  // Calculate statistics over recorded entries
  const recordedEntries = entries.filter((e) => e.durationMinutes > 0);
  const totalDurationMinutes = recordedEntries.reduce(
    (sum, e) => sum + e.durationMinutes,
    0
  );
  const avgMinutes =
    recordedEntries.length > 0
      ? Math.round(totalDurationMinutes / recordedEntries.length)
      : 0;

  const totalScore = recordedEntries.reduce((sum, e) => sum + e.quality, 0);
  const avgScore =
    recordedEntries.length > 0
      ? (totalScore / recordedEntries.length).toFixed(1)
      : '0.0';

  const optimalNights = recordedEntries.filter(
    (e) => e.durationMinutes >= 420
  ).length;

  // Sleep debt calculation based on 8h (480 mins) target
  const weeklyTargetMinutes = 7 * 480;
  const recordedWeeklyMins = dayPoints.reduce(
    (sum, d) => sum + d.durationMinutes,
    0
  );
  const diffHours = ((recordedWeeklyMins - weeklyTargetMinutes) / 60).toFixed(1);

  const handleSeedData = async () => {
    await seedDemoWeek();
    onRefresh();
  };

  const handleClearData = async () => {
    const message = 'Are you sure you want to erase all logged sleep sessions?';
    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        await clearAllSleepEntries();
        onRefresh();
      }
    } else {
      Alert.alert(
        'Reset Sleep Data',
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Clear All',
            style: 'destructive',
            onPress: async () => {
              await clearAllSleepEntries();
              onRefresh();
            },
          },
        ]
      );
    }
  };

  // Generate dynamic contextual insight text
  const generateInsightMessage = () => {
    if (recordedEntries.length === 0) {
      return 'No sleep sessions recorded yet. Start logging nightly rest to view duration patterns and sleep quality trends.';
    }
    const scoreNum = parseFloat(avgScore);
    if (scoreNum >= 4.0 && avgMinutes >= 420) {
      return `Excellent sleep restoration! Your average sleep of ${formatDurationCompact(avgMinutes)} and quality score of ${avgScore}/5 indicate consistent circadian stability.`;
    }
    if (avgMinutes < 390) {
      return `You are averaging ${formatDurationCompact(avgMinutes)} per night, below the recommended 7.0-hour threshold. Prioritizing an earlier wind-down may reduce sleep deficit.`;
    }
    return `Your average sleep duration is ${formatDurationCompact(avgMinutes)} with a quality score of ${avgScore}/5. Keep maintaining a consistent bedtime window.`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>TRENDS & INSIGHTS</Text>
          <Text style={styles.subtitle}>7-day sleep duration and recovery analysis</Text>
        </View>
      </View>

      {/* Main Weekly Sleep Bar Chart */}
      <View style={styles.chartWrapper}>
        <WeeklyChart days={dayPoints} entriesMap={entriesMap} targetHours={8.0} />
      </View>

      {/* Key Metric Cards Grid */}
      <View style={styles.metricGrid}>
        <View style={styles.metricRow}>
          <MetricCard
            label="Avg Duration"
            value={recordedEntries.length > 0 ? formatDurationCompact(avgMinutes) : '0h'}
            subValue="Per night recorded"
            accentColor={avgMinutes >= 420 ? theme.colors.accentSage : theme.colors.accentAmber}
            badge={avgMinutes >= 420 ? 'Optimal' : 'Needs attention'}
          />
          <MetricCard
            label="Avg Sleep Score"
            value={recordedEntries.length > 0 ? `${avgScore} / 5` : '-'}
            subValue={`${recordedEntries.length} logged nights`}
            accentColor={parseFloat(avgScore) >= 3.8 ? theme.colors.accentSage : theme.colors.accentAmberLight}
          />
        </View>

        <View style={styles.metricRow}>
          <MetricCard
            label="Optimal Nights"
            value={`${optimalNights} / ${dayPoints.length}`}
            subValue="Met 7+ hours threshold"
            accentColor={theme.colors.accentIndigo}
          />
          <MetricCard
            label="Weekly Balance"
            value={recordedEntries.length > 0 ? `${diffHours}h` : '0h'}
            subValue="Relative to 8h daily target"
            accentColor={parseFloat(diffHours) >= 0 ? theme.colors.accentSage : theme.colors.accentCoral}
            badge={parseFloat(diffHours) >= 0 ? 'Surplus' : 'Deficit'}
          />
        </View>
      </View>

      {/* Sleep Insights Card */}
      <View style={styles.insightCard}>
        <View style={styles.insightHeader}>
          <Text style={styles.insightIcon}>✦</Text>
          <Text style={styles.insightTitle}>RECOVERY ANALYSIS</Text>
        </View>
        <Text style={styles.insightText}>{generateInsightMessage()}</Text>
      </View>

      {/* Testing Utilities Card */}
      <View style={styles.utilityCard}>
        <Text style={styles.utilityTitle}>EVALUATION UTILITIES</Text>
        <Text style={styles.utilitySubtitle}>
          Helper actions for review: quickly prefill realistic 7-day data or reset records.
        </Text>
        <View style={styles.utilityBtnRow}>
          <TouchableOpacity
            style={styles.utilityBtnSeed}
            onPress={handleSeedData}
            activeOpacity={0.8}
          >
            <Text style={styles.utilityBtnSeedText}>Load 7-Day Sample Dataset</Text>
          </TouchableOpacity>

          {entries.length > 0 && (
            <TouchableOpacity
              style={styles.utilityBtnClear}
              onPress={handleClearData}
              activeOpacity={0.8}
            >
              <Text style={styles.utilityBtnClearText}>Clear All Data</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  chartWrapper: {
    marginBottom: 16,
  },
  metricGrid: {
    gap: 12,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 12,
  },
  insightCard: {
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  insightIcon: {
    color: theme.colors.accentAmber,
    fontSize: 14,
    marginRight: 6,
  },
  insightTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1,
  },
  insightText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  utilityCard: {
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 20,
  },
  utilityTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  utilitySubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginBottom: 12,
    lineHeight: 16,
  },
  utilityBtnRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  utilityBtnSeed: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: theme.colors.accentAmber,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: theme.radius.pill,
  },
  utilityBtnSeedText: {
    color: theme.colors.accentAmber,
    fontSize: 12,
    fontWeight: '700',
  },
  utilityBtnClear: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: theme.radius.pill,
  },
  utilityBtnClearText: {
    color: theme.colors.accentCoral,
    fontSize: 12,
    fontWeight: '700',
  },
});
