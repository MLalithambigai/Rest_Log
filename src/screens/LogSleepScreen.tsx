import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { theme } from '../theme';
import { SleepQuality } from '../types/sleep';
import { saveSleepEntry } from '../services/storage';
import {
  calculateSleepDuration,
  format24To12,
  getTodayDateString,
  getYesterdayDateString,
  formatDateLabel,
} from '../utils/time';
import { TimePickerModal } from '../components/TimePickerModal';
import { SleepQualityPicker } from '../components/SleepQualityPicker';
import { DurationDisplay } from '../components/DurationDisplay';

interface LogSleepScreenProps {
  onEntrySaved: () => void;
  onNavigateToHistory: () => void;
}

const QUICK_TAGS = ['Reading', 'Cool room', 'Workout', 'No screens', 'Late coffee', 'Melatonin'];

export const LogSleepScreen: React.FC<LogSleepScreenProps> = ({
  onEntrySaved,
  onNavigateToHistory,
}) => {
  // Default: Went to bed 23:00 (11:00 PM), woke up 07:15 (7:15 AM)
  const [bedtime24, setBedtime24] = useState('23:00');
  const [wakeTime24, setWakeTime24] = useState('07:15');
  const [quality, setQuality] = useState<SleepQuality>(4);
  const [note, setNote] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateStr, setDateStr] = useState(getTodayDateString());

  // Picker modal states
  const [activePicker, setActivePicker] = useState<'bed' | 'wake' | null>(null);

  // Success banner feedback state
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculated duration in minutes
  const durationMinutes = calculateSleepDuration(bedtime24, wakeTime24);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSave = async () => {
    if (durationMinutes === 0) {
      Alert.alert('Invalid Duration', 'Bedtime and wake-up time cannot be identical.');
      return;
    }

    setIsSubmitting(true);
    try {
      await saveSleepEntry({
        date: dateStr,
        bedtime: bedtime24,
        wakeTime: wakeTime24,
        quality,
        note: note.trim(),
        tags: selectedTags,
      });

      setSuccessBanner('Sleep entry successfully recorded!');
      onEntrySaved();

      // Reset note & tags after 2.5s or keep UI fresh
      setTimeout(() => {
        setSuccessBanner(null);
      }, 4000);
    } catch (err) {
      Alert.alert('Error', 'Failed to save sleep log. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appTitle}>RESTLOG</Text>
            <Text style={styles.appSubtitle}>Record your sleep window & recovery</Text>
          </View>
        </View>

        {/* Night Date Selector */}
        <View style={styles.nightSelectorRow}>
          <Text style={styles.nightSelectorLabel}>NIGHT</Text>
          <View style={styles.nightToggleGroup}>
            {[getTodayDateString(), getYesterdayDateString()].map((d) => {
              const isToday = d === getTodayDateString();
              const isActive = d === dateStr;
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.nightToggleBtn, isActive && styles.nightToggleBtnActive]}
                  onPress={() => setDateStr(d)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.nightToggleText, isActive && styles.nightToggleTextActive]}>
                    {isToday ? 'Tonight / Today' : 'Last Night'}
                  </Text>
                  <Text style={[styles.nightToggleSub, isActive && styles.nightToggleSubActive]}>
                    {formatDateLabel(d)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Success Confirmation Toast */}
        {successBanner && (
          <View style={styles.successCard}>
            <View style={styles.successLeft}>
              <Text style={styles.successCheck}>✓</Text>
              <Text style={styles.successText}>{successBanner}</Text>
            </View>
            <TouchableOpacity
              onPress={onNavigateToHistory}
              style={styles.viewHistoryBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.viewHistoryBtnText}>View Logs →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Time Selector Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>SLEEP SCHEDULE</Text>

          <View style={styles.timeCardRow}>
            {/* Bedtime Card */}
            <TouchableOpacity
              style={styles.timeCard}
              onPress={() => setActivePicker('bed')}
              activeOpacity={0.75}
            >
              <View style={styles.timeCardTop}>
                <Text style={styles.timeCardIcon}>☽</Text>
                <Text style={styles.timeCardLabel}>BEDTIME</Text>
              </View>
              <Text style={styles.timeCardValue}>{format24To12(bedtime24)}</Text>
              <Text style={styles.tapToEditHint}>Tap to adjust</Text>
            </TouchableOpacity>

            {/* Wake-up Time Card */}
            <TouchableOpacity
              style={styles.timeCard}
              onPress={() => setActivePicker('wake')}
              activeOpacity={0.75}
            >
              <View style={styles.timeCardTop}>
                <Text style={styles.timeCardIcon}>☼</Text>
                <Text style={styles.timeCardLabel}>WAKE UP</Text>
              </View>
              <Text style={styles.timeCardValue}>{format24To12(wakeTime24)}</Text>
              <Text style={styles.tapToEditHint}>Tap to adjust</Text>
            </TouchableOpacity>
          </View>

          {/* Auto-Calculated Duration Component */}
          <DurationDisplay durationMinutes={durationMinutes} />
        </View>

        {/* Sleep Quality Rating Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>SLEEP QUALITY RATING</Text>
          <SleepQualityPicker value={quality} onChange={setQuality} />
        </View>

        {/* Sleep Notes & Tags Section */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionHeader}>HYGIENE TAGS & OBSERVATIONS</Text>

          {/* Quick Tags Chips */}
          <View style={styles.tagWrap}>
            {QUICK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <TouchableOpacity
                  key={tag}
                  style={[styles.tagChip, isSelected && styles.tagChipActive]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.tagChipText,
                      isSelected && styles.tagChipTextActive,
                    ]}
                  >
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Note Input */}
          <TextInput
            style={styles.noteInput}
            value={note}
            onChangeText={setNote}
            placeholder="Add notes (e.g. read book, no coffee after 2 PM, room temp 19°C)..."
            placeholderTextColor={theme.colors.textMuted}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.saveBtn, isSubmitting && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {isSubmitting ? 'Saving Session...' : 'Save Sleep Record'}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Bedtime Picker Modal */}
      <TimePickerModal
        visible={activePicker === 'bed'}
        title="Set Bedtime"
        initialTime24={bedtime24}
        presets={['22:00', '22:30', '23:00', '23:30', '00:00', '00:30']}
        onConfirm={(val) => {
          setBedtime24(val);
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />

      {/* Wake-up Time Picker Modal */}
      <TimePickerModal
        visible={activePicker === 'wake'}
        title="Set Wake-up Time"
        initialTime24={wakeTime24}
        presets={['06:00', '06:30', '07:00', '07:15', '07:45', '08:30']}
        onConfirm={(val) => {
          setWakeTime24(val);
          setActivePicker(null);
        }}
        onClose={() => setActivePicker(null)}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: theme.colors.textPrimary,
    letterSpacing: 2,
  },
  appSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
  nightSelectorRow: {
    marginBottom: 16,
  },
  nightSelectorLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  nightToggleGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  nightToggleBtn: {
    flex: 1,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  nightToggleBtnActive: {
    borderColor: theme.colors.accentAmber,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  nightToggleText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textSecondary,
  },
  nightToggleTextActive: {
    color: theme.colors.accentAmber,
  },
  nightToggleSub: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  nightToggleSubActive: {
    color: theme.colors.accentAmberLight,
  },
  successCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
  },
  successLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  successCheck: {
    color: theme.colors.accentSage,
    fontSize: 16,
    fontWeight: '800',
    marginRight: 8,
  },
  successText: {
    color: theme.colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  viewHistoryBtn: {
    paddingLeft: 10,
  },
  viewHistoryBtnText: {
    color: theme.colors.accentSage,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 1,
    marginBottom: 14,
  },
  timeCardRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  timeCard: {
    flex: 1,
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  timeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeCardIcon: {
    fontSize: 14,
    color: theme.colors.accentAmber,
    marginRight: 6,
  },
  timeCardLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
  },
  timeCardValue: {
    fontSize: 19,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  tapToEditHint: {
    fontSize: 10,
    color: theme.colors.accentAmberLight,
    fontWeight: '500',
  },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.bgInput,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tagChipActive: {
    borderColor: theme.colors.accentAmber,
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
  },
  tagChipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  tagChipTextActive: {
    color: theme.colors.accentAmber,
    fontWeight: '700',
  },
  noteInput: {
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.radius.md,
    padding: 12,
    color: theme.colors.textPrimary,
    fontSize: 13,
    minHeight: 70,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  saveBtn: {
    backgroundColor: theme.colors.accentAmber,
    borderRadius: theme.radius.pill,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 24,
    shadowColor: theme.colors.accentAmber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0A0D14',
    letterSpacing: 0.5,
  },
});
