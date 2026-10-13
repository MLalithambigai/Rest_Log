import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { formatDurationVerbose } from '../utils/time';

interface DurationDisplayProps {
  durationMinutes: number;
  targetMinutes?: number; // default 480 (8 hours)
}

export const DurationDisplay: React.FC<DurationDisplayProps> = ({
  durationMinutes,
  targetMinutes = 480,
}) => {
  const percentage = Math.min(Math.round((durationMinutes / targetMinutes) * 100), 150);
  const hrs = (durationMinutes / 60).toFixed(1);

  // Status color based on duration
  let statusColor = theme.colors.accentAmber;
  let statusBadge = 'Moderate Duration';

  if (durationMinutes >= 420 && durationMinutes <= 540) {
    statusColor = theme.colors.accentSage;
    statusBadge = 'Optimal Target';
  } else if (durationMinutes < 360) {
    statusColor = theme.colors.accentCoral;
    statusBadge = 'Short Rest';
  } else if (durationMinutes > 540) {
    statusColor = theme.colors.accentTeal;
    statusBadge = 'Extended Rest';
  }

  const fillWidth = Math.min(Math.max((durationMinutes / targetMinutes) * 100, 4), 100);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.subTitle}>CALCULATED REST</Text>
          <Text style={styles.mainDuration}>
            {formatDurationVerbose(durationMinutes)}
          </Text>
        </View>

        <View style={[styles.badge, { borderColor: statusColor }]}>
          <View style={[styles.dot, { backgroundColor: statusColor }]} />
          <Text style={[styles.badgeText, { color: statusColor }]}>
            {statusBadge}
          </Text>
        </View>
      </View>

      {/* Target Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.track}>
          <View
            style={[
              styles.fill,
              { width: `${fillWidth}%`, backgroundColor: statusColor },
            ]}
          />
        </View>
        <View style={styles.goalRow}>
          <Text style={styles.goalText}>
            {hrs} hrs ({percentage}% of 8.0h baseline)
          </Text>
          <Text style={styles.baselineMarker}>Goal: 8.0 hrs</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.bgInput,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  subTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  mainDuration: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.textPrimary,
    marginTop: 2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  progressContainer: {
    marginTop: 2,
  },
  track: {
    height: 6,
    backgroundColor: theme.colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
  goalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  goalText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  baselineMarker: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '600',
  },
});
