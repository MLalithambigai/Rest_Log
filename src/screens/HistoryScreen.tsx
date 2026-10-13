import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { theme } from '../theme';
import { SleepEntry } from '../types/sleep';
import { deleteSleepEntry, seedDemoWeek } from '../services/storage';
import {
  format24To12,
  formatDurationCompact,
  getRelativeDayTag,
} from '../utils/time';
import { EmptyState } from '../components/EmptyState';

interface HistoryScreenProps {
  entries: SleepEntry[];
  onRefresh: () => void;
  onNavigateToLog: () => void;
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({
  entries,
  onRefresh,
  onNavigateToLog,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirmDelete = (item: SleepEntry) => {
    const message = `Remove sleep record for ${getRelativeDayTag(item.date)}?`;

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(message);
      if (confirmed) {
        executeDelete(item.id);
      }
    } else {
      Alert.alert(
        'Delete Sleep Record',
        message,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => executeDelete(item.id),
          },
        ],
        { cancelable: true }
      );
    }
  };

  const executeDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteSleepEntry(id);
      onRefresh();
    } catch (err) {
      Alert.alert('Error', 'Unable to delete entry.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSeed = async () => {
    await seedDemoWeek();
    onRefresh();
  };

  const renderItem = ({ item }: { item: SleepEntry }) => {
    const qualityMeta = theme.colors.quality[item.quality];
    const isDeleting = deletingId === item.id;

    let durationColor = theme.colors.accentAmber;
    if (item.durationMinutes >= 420 && item.durationMinutes <= 540) {
      durationColor = theme.colors.accentSage;
    } else if (item.durationMinutes < 360) {
      durationColor = theme.colors.accentCoral;
    }

    return (
      <View style={[styles.entryCard, isDeleting && styles.entryCardDeleting]}>
        {/* Card Header: Date & Delete button */}
        <View style={styles.cardHeader}>
          <View style={styles.dateBlock}>
            <Text style={styles.dayLabel}>{getRelativeDayTag(item.date)}</Text>
            <Text style={styles.dateNumeric}>{item.date}</Text>
          </View>

          <View style={styles.headerRight}>
            {/* Duration Badge */}
            <View style={[styles.durationBadge, { borderColor: durationColor }]}>
              <View style={[styles.statusDot, { backgroundColor: durationColor }]} />
              <Text style={[styles.durationText, { color: durationColor }]}>
                {formatDurationCompact(item.durationMinutes)}
              </Text>
            </View>

            {/* Delete button */}
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => confirmDelete(item)}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.deleteIcon}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Middle Row: Schedule Interval and Quality Pill */}
        <View style={styles.detailRow}>
          <View style={styles.intervalBox}>
            <Text style={styles.intervalIcon}>☾</Text>
            <Text style={styles.intervalText}>
              {format24To12(item.bedtime)}
            </Text>
            <Text style={styles.intervalArrow}>→</Text>
            <Text style={styles.intervalIcon}>☼</Text>
            <Text style={styles.intervalText}>
              {format24To12(item.wakeTime)}
            </Text>
          </View>

          <View
            style={[
              styles.qualityBadge,
              {
                backgroundColor: qualityMeta.bg,
                borderColor: qualityMeta.border,
              },
            ]}
          >
            <Text style={[styles.qualityScore, { color: qualityMeta.color }]}>
              {item.quality}/5 • {qualityMeta.label}
            </Text>
          </View>
        </View>

        {/* Optional Notes */}
        {item.note ? (
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>"{item.note}"</Text>
          </View>
        ) : null}

        {/* Optional Tags */}
        {item.tags && item.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {item.tags.map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>JOURNAL</Text>
          <Text style={styles.subtitle}>
            {entries.length} {entries.length === 1 ? 'record' : 'records'} logged
          </Text>
        </View>
        {entries.length > 0 && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={onNavigateToLog}
            activeOpacity={0.8}
          >
            <Text style={styles.addBtnText}>+ Log New</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Entry List or Empty State */}
      {entries.length === 0 ? (
        <EmptyState
          title="No Sleep Logs Yet"
          description="Track last night's rest to start building your sleep journal and trends."
          actionLabel="Log First Night"
          onAction={onNavigateToLog}
          secondaryActionLabel="Load 7-Day Sample Dataset"
          onSecondaryAction={handleSeed}
        />
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 16,
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
  addBtn: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: theme.colors.accentAmber,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
  },
  addBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.colors.accentAmber,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  entryCard: {
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  entryCardDeleting: {
    opacity: 0.4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dateBlock: {
    flex: 1,
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.colors.textPrimary,
  },
  dateNumeric: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    backgroundColor: theme.colors.bgInput,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '800',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    color: theme.colors.accentCoral,
    fontSize: 12,
    fontWeight: '800',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  intervalBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  intervalIcon: {
    fontSize: 11,
    color: theme.colors.accentAmberLight,
  },
  intervalText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  intervalArrow: {
    fontSize: 12,
    color: theme.colors.textMuted,
    paddingHorizontal: 2,
  },
  qualityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  qualityScore: {
    fontSize: 11,
    fontWeight: '700',
  },
  noteBox: {
    borderLeftWidth: 2,
    borderLeftColor: theme.colors.accentAmber,
    paddingLeft: 10,
    marginVertical: 4,
  },
  noteText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  tagPill: {
    backgroundColor: theme.colors.bgCard,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
});
