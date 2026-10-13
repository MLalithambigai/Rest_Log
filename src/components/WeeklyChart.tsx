import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DaySleepPoint, SleepEntry } from '../types/sleep';
import { theme } from '../theme';
import { format24To12, formatDurationCompact } from '../utils/time';

interface WeeklyChartProps {
  days: DaySleepPoint[];
  entriesMap: Record<string, SleepEntry>;
  targetHours?: number; // default 8.0
}

const MAX_CHART_HOURS = 10;
const CHART_HEIGHT = 160;

export const WeeklyChart: React.FC<WeeklyChartProps> = ({
  days,
  entriesMap,
  targetHours = 8.0,
}) => {
  // Default selected day to the last recorded day with entry, or today
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(
    () => {
      const recorded = [...days].reverse().find((d) => d.hasEntry);
      return recorded ? recorded.dateStr : days[days.length - 1]?.dateStr || null;
    }
  );

  const targetLineY = CHART_HEIGHT - (targetHours / MAX_CHART_HOURS) * CHART_HEIGHT;
  const selectedEntry = selectedDateStr ? entriesMap[selectedDateStr] : null;
  const selectedDayPoint = days.find((d) => d.dateStr === selectedDateStr);

  return (
    <View style={styles.container}>
      {/* Target Marker Header */}
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>7-DAY SLEEP PATTERN</Text>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.accentSage }]} />
          <Text style={styles.legendText}>Optimal (7h+)</Text>
          <View style={[styles.legendDot, { backgroundColor: theme.colors.accentCoral, marginLeft: 8 }]} />
          <Text style={styles.legendText}>Deficit (&lt;6h)</Text>
        </View>
      </View>

      {/* Chart Canvas Area */}
      <View style={styles.canvasContainer}>
        {/* Baseline Guideline for 8.0 Hours */}
        <View style={[styles.guidelineRow, { top: targetLineY }]}>
          <View style={styles.guidelineDashed} />
          <Text style={styles.guidelineLabel}>8h Goal</Text>
        </View>

        {/* 7 Columns */}
        <View style={styles.barsRow}>
          {days.map((item) => {
            const isSelected = item.dateStr === selectedDateStr;
            const heightPercent = Math.min((item.durationHours / MAX_CHART_HOURS), 1);
            const barHeight = Math.max(heightPercent * CHART_HEIGHT, item.hasEntry ? 12 : 4);

            let barColor = theme.colors.accentAmber;
            if (item.durationHours >= 7 && item.durationHours <= 9) {
              barColor = theme.colors.accentSage;
            } else if (item.durationHours < 6) {
              barColor = theme.colors.accentCoral;
            } else if (item.durationHours > 9) {
              barColor = theme.colors.accentTeal;
            }

            return (
              <TouchableOpacity
                key={item.dateStr}
                style={[styles.column, isSelected && styles.columnSelected]}
                onPress={() => setSelectedDateStr(item.dateStr)}
                activeOpacity={0.7}
              >
                {/* Top Duration Value */}
                <View style={styles.valWrapper}>
                  {item.hasEntry ? (
                    <Text
                      style={[
                        styles.barHoursText,
                        isSelected && { color: theme.colors.textPrimary, fontWeight: '700' },
                      ]}
                    >
                      {item.durationHours.toFixed(1)}h
                    </Text>
                  ) : (
                    <Text style={styles.emptyDash}>-</Text>
                  )}
                </View>

                {/* Bar track and bar fill */}
                <View style={styles.barTrack}>
                  {item.hasEntry ? (
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: barHeight,
                          backgroundColor: barColor,
                          borderTopLeftRadius: 6,
                          borderTopRightRadius: 6,
                        },
                        isSelected && styles.barFillActive,
                      ]}
                    />
                  ) : (
                    <View style={styles.barPlaceholder} />
                  )}
                </View>

                {/* Day Label */}
                <View style={[styles.dayLabelWrap, isSelected && styles.dayLabelWrapActive]}>
                  <Text style={[styles.dayLabelText, isSelected && styles.dayLabelTextActive]}>
                    {item.dayLabel}
                  </Text>
                </View>

                {/* Quality Score Dot */}
                <View style={styles.scoreDotWrap}>
                  {item.quality ? (
                    <View
                      style={[
                        styles.scoreMiniPill,
                        { backgroundColor: theme.colors.quality[item.quality].bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.scoreMiniText,
                          { color: theme.colors.quality[item.quality].color },
                        ]}
                      >
                        {item.quality}★
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.emptyScoreDot} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Selected Night Detail Peek Card */}
      {selectedDayPoint && (
        <View style={styles.detailCard}>
          {selectedEntry ? (
            <View>
              <View style={styles.detailHeader}>
                <View>
                  <Text style={styles.detailDay}>{selectedDayPoint.dayLabel} Night</Text>
                  <Text style={styles.detailDate}>{selectedDayPoint.dateStr}</Text>
                </View>
                <View style={styles.detailBadgeRow}>
                  <View style={styles.timePill}>
                    <Text style={styles.timePillText}>
                      {format24To12(selectedEntry.bedtime)} → {format24To12(selectedEntry.wakeTime)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.scorePill,
                      {
                        backgroundColor:
                          theme.colors.quality[selectedEntry.quality].bg,
                        borderColor:
                          theme.colors.quality[selectedEntry.quality].border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.scorePillText,
                        {
                          color:
                            theme.colors.quality[selectedEntry.quality].color,
                        },
                      ]}
                    >
                      {selectedEntry.quality}/5 •{' '}
                      {theme.colors.quality[selectedEntry.quality].label}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.detailMetrics}>
                <Text style={styles.detailMetricDuration}>
                  {formatDurationCompact(selectedEntry.durationMinutes)} total sleep
                </Text>
                {selectedEntry.note ? (
                  <Text style={styles.detailNoteText} numberOfLines={2}>
                    "{selectedEntry.note}"
                  </Text>
                ) : null}
              </View>
            </View>
          ) : (
            <View style={styles.noEntryPrompt}>
              <Text style={styles.noEntryPromptText}>
                No sleep log recorded for {selectedDayPoint.dayLabel} ({selectedDayPoint.dateStr})
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textMuted,
    letterSpacing: 0.8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  legendText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  canvasContainer: {
    height: CHART_HEIGHT + 70,
    position: 'relative',
    justifyContent: 'flex-start',
  },
  guidelineRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
  },
  guidelineDashed: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.25)',
    borderStyle: 'dashed',
  },
  guidelineLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.colors.textMuted,
    marginLeft: 6,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: CHART_HEIGHT,
    zIndex: 2,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  columnSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  valWrapper: {
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  barHoursText: {
    fontSize: 10,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  emptyDash: {
    fontSize: 10,
    color: theme.colors.textFaint,
  },
  barTrack: {
    width: 22,
    height: CHART_HEIGHT - 24,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
  },
  barFillActive: {
    opacity: 1,
    shadowColor: '#fff',
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  barPlaceholder: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.textFaint,
    marginBottom: 4,
  },
  dayLabelWrap: {
    marginTop: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dayLabelWrapActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  dayLabelText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  dayLabelTextActive: {
    color: theme.colors.accentAmber,
    fontWeight: '700',
  },
  scoreDotWrap: {
    marginTop: 4,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreMiniPill: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  scoreMiniText: {
    fontSize: 9,
    fontWeight: '700',
  },
  emptyScoreDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.colors.textFaint,
  },
  detailCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgInput,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  detailDay: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  detailDate: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  detailBadgeRow: {
    alignItems: 'flex-end',
    gap: 4,
  },
  timePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: theme.colors.bgCard,
    borderRadius: 4,
  },
  timePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  scorePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  scorePillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  detailMetrics: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
  },
  detailMetricDuration: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.colors.accentAmberLight,
    marginBottom: 2,
  },
  detailNoteText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  noEntryPrompt: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  noEntryPromptText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontStyle: 'italic',
  },
});
