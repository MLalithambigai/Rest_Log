import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SleepQuality } from '../types/sleep';
import { theme } from '../theme';

interface SleepQualityPickerProps {
  value: SleepQuality;
  onChange: (value: SleepQuality) => void;
}

const QUALITY_ITEMS: Array<{
  rating: SleepQuality;
  symbol: string;
}> = [
  { rating: 1, symbol: 'Ⅰ' },
  { rating: 2, symbol: 'Ⅱ' },
  { rating: 3, symbol: 'Ⅲ' },
  { rating: 4, symbol: 'Ⅳ' },
  { rating: 5, symbol: 'Ⅴ' },
];

export const SleepQualityPicker: React.FC<SleepQualityPickerProps> = ({
  value,
  onChange,
}) => {
  const activeMeta = theme.colors.quality[value];

  return (
    <View style={styles.container}>
      <View style={styles.scaleRow}>
        {QUALITY_ITEMS.map((item) => {
          const isSelected = item.rating === value;
          const config = theme.colors.quality[item.rating];

          return (
            <TouchableOpacity
              key={item.rating}
              onPress={() => onChange(item.rating)}
              activeOpacity={0.75}
              style={[
                styles.itemCard,
                isSelected && {
                  borderColor: config.color,
                  backgroundColor: config.bg,
                },
              ]}
            >
              <Text
                style={[
                  styles.ratingScore,
                  { color: isSelected ? config.color : theme.colors.textMuted },
                ]}
              >
                {item.rating}
              </Text>
              <Text
                style={[
                  styles.romanSymbol,
                  { color: isSelected ? config.color : theme.colors.textFaint },
                ]}
              >
                {item.symbol}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Dynamic descriptor card for selected score */}
      <View
        style={[
          styles.descriptorBox,
          {
            borderColor: activeMeta.border,
            backgroundColor: activeMeta.bg,
          },
        ]}
      >
        <View style={[styles.statusDot, { backgroundColor: activeMeta.color }]} />
        <View style={styles.descriptorTextWrap}>
          <Text style={[styles.descriptorTitle, { color: activeMeta.color }]}>
            Score {value}/5 • {activeMeta.label}
          </Text>
          <Text style={styles.descriptorSub}>{activeMeta.sub}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  scaleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  itemCard: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.bgInput,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
  },
  ratingScore: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  romanSymbol: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  descriptorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
    borderWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  descriptorTextWrap: {
    flex: 1,
  },
  descriptorTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  descriptorSub: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 1,
  },
});
