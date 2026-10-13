import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { theme } from '../theme';
import { parse24ToParts, formatPartsTo24, format24To12 } from '../utils/time';

interface TimePickerModalProps {
  visible: boolean;
  title: string;
  initialTime24: string;
  presets?: string[]; // array of "HH:mm"
  onConfirm: (selectedTime24: string) => void;
  onClose: () => void;
}

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export const TimePickerModal: React.FC<TimePickerModalProps> = ({
  visible,
  title,
  initialTime24,
  presets = [],
  onConfirm,
  onClose,
}) => {
  const [hour, setHour] = useState(11);
  const [minute, setMinute] = useState(0);
  const [period, setPeriod] = useState<'AM' | 'PM'>('PM');

  useEffect(() => {
    if (visible && initialTime24) {
      const parts = parse24ToParts(initialTime24);
      setHour(parts.hour12);
      // round to nearest 5 min or keep as is
      setMinute(parts.minute);
      setPeriod(parts.period);
    }
  }, [visible, initialTime24]);

  const handleConfirm = () => {
    const time24 = formatPartsTo24(hour, minute, period);
    onConfirm(time24);
  };

  const handleApplyPreset = (time24: string) => {
    const parts = parse24ToParts(time24);
    setHour(parts.hour12);
    setMinute(parts.minute);
    setPeriod(parts.period);
  };

  const currentTime24 = formatPartsTo24(hour, minute, period);
  const previewFormatted = format24To12(currentTime24);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.previewText}>{previewFormatted}</Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {presets.length > 0 && (
            <View style={styles.presetSection}>
              <Text style={styles.presetHeading}>Quick Select</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.presetScroll}
              >
                {presets.map((p) => {
                  const label = format24To12(p);
                  const isCurrent = p === currentTime24;
                  return (
                    <TouchableOpacity
                      key={p}
                      style={[styles.presetChip, isCurrent && styles.presetChipActive]}
                      onPress={() => handleApplyPreset(p)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.presetChipText,
                          isCurrent && styles.presetChipTextActive,
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Time Picker Controls */}
          <View style={styles.pickerContainer}>
            {/* Hour Wheel */}
            <View style={styles.columnBox}>
              <Text style={styles.colLabel}>HOUR</Text>
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollCol}
              >
                {HOURS.map((h) => {
                  const isSelected = h === hour;
                  const pad = h < 10 ? `0${h}` : `${h}`;
                  return (
                    <TouchableOpacity
                      key={h}
                      style={[styles.numberPill, isSelected && styles.numberPillSelected]}
                      onPress={() => setHour(h)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.numberPillText,
                          isSelected && styles.numberPillTextSelected,
                        ]}
                      >
                        {pad}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <Text style={styles.colonDivider}>:</Text>

            {/* Minute Wheel */}
            <View style={styles.columnBox}>
              <Text style={styles.colLabel}>MIN</Text>
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.scrollCol}
              >
                {MINUTES.map((m) => {
                  const isSelected = m === minute;
                  const pad = m < 10 ? `0${m}` : `${m}`;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[styles.numberPill, isSelected && styles.numberPillSelected]}
                      onPress={() => setMinute(m)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.numberPillText,
                          isSelected && styles.numberPillTextSelected,
                        ]}
                      >
                        {pad}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* AM/PM Switcher */}
            <View style={styles.periodCol}>
              <Text style={styles.colLabel}>PERIOD</Text>
              <View style={styles.periodBox}>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    period === 'AM' && styles.periodButtonActive,
                  ]}
                  onPress={() => setPeriod('AM')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.periodText,
                      period === 'AM' && styles.periodTextActive,
                    ]}
                  >
                    AM
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.periodButton,
                    period === 'PM' && styles.periodButtonActive,
                  ]}
                  onPress={() => setPeriod('PM')}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.periodText,
                      period === 'PM' && styles.periodTextActive,
                    ]}
                  >
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Action Footer */}
          <View style={styles.footerRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmButtonText}>Set Time</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  previewText: {
    fontSize: 26,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: theme.colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  presetSection: {
    marginBottom: 16,
  },
  presetHeading: {
    fontSize: 11,
    color: theme.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  presetScroll: {
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  presetChipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: theme.colors.accentAmber,
  },
  presetChipText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  presetChipTextActive: {
    color: theme.colors.accentAmber,
    fontWeight: '700',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.radius.lg,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  columnBox: {
    flex: 1,
    alignItems: 'center',
  },
  colLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
  },
  scrollCol: {
    height: 150,
    width: '100%',
  },
  numberPill: {
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: theme.radius.sm,
    marginVertical: 2,
  },
  numberPillSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.18)',
    borderWidth: 1,
    borderColor: theme.colors.accentAmber,
  },
  numberPillText: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  numberPillTextSelected: {
    color: theme.colors.accentAmber,
    fontWeight: '800',
    transform: [{ scale: 1.05 }],
  },
  colonDivider: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.textMuted,
    paddingHorizontal: 6,
    paddingTop: 16,
  },
  periodCol: {
    width: 76,
    alignItems: 'center',
  },
  periodBox: {
    width: '100%',
    gap: 8,
    marginTop: 10,
  },
  periodButton: {
    paddingVertical: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgCard,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: theme.colors.accentAmber,
    borderColor: theme.colors.accentAmber,
  },
  periodText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.textMuted,
  },
  periodTextActive: {
    color: '#000',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgCard,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  confirmButton: {
    flex: 1.5,
    paddingVertical: 13,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.accentAmber,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0A0D14',
  },
});
