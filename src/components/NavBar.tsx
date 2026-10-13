import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';

export type ScreenTab = 'log' | 'history' | 'trends';

interface NavBarProps {
  currentTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
  historyCount?: number;
}

export const NavBar: React.FC<NavBarProps> = ({
  currentTab,
  onSelectTab,
  historyCount = 0,
}) => {
  const tabs: Array<{
    id: ScreenTab;
    label: string;
    icon: string;
    badge?: number;
  }> = [
    { id: 'log', label: 'Log Rest', icon: '☾' },
    { id: 'history', label: 'History', icon: '◷', badge: historyCount > 0 ? historyCount : undefined },
    { id: 'trends', label: 'Trends', icon: '∿' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.dock}>
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabButton, isActive && styles.tabButtonActive]}
              onPress={() => onSelectTab(tab.id)}
              activeOpacity={0.75}
            >
              <View style={styles.iconWrap}>
                <Text
                  style={[
                    styles.tabIcon,
                    isActive ? styles.tabIconActive : styles.tabIconInactive,
                  ]}
                >
                  {tab.icon}
                </Text>
                {tab.badge ? (
                  <View style={styles.badgeWrap}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  isActive ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {tab.label}
              </Text>
              {isActive && <View style={styles.activePill} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 8,
    backgroundColor: 'transparent',
  },
  dock: {
    flexDirection: 'row',
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.pill,
    padding: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  iconWrap: {
    position: 'relative',
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabIcon: {
    fontSize: 18,
    lineHeight: 20,
  },
  tabIconActive: {
    color: theme.colors.accentAmber,
  },
  tabIconInactive: {
    color: theme.colors.textMuted,
  },
  badgeWrap: {
    position: 'absolute',
    top: -4,
    right: -12,
    backgroundColor: theme.colors.accentAmber,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0A0D14',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    color: theme.colors.accentAmber,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  activePill: {
    position: 'absolute',
    bottom: 3,
    width: 12,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: theme.colors.accentAmber,
  },
});
