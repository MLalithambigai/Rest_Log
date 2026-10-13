export const theme = {
  colors: {
    bg: '#0A0D14',
    bgElevated: '#111622',
    bgCard: '#151C2A',
    bgCardActive: '#1E273A',
    bgInput: '#0E131E',
    border: '#212B3E',
    borderLight: '#2D3A52',
    borderActive: '#F59E0B',
    
    // Warm celestial & restorative accents
    accentAmber: '#F59E0B',
    accentAmberLight: '#FBBF24',
    accentSage: '#10B981',
    accentTeal: '#14B8A6',
    accentCoral: '#EF4444',
    accentIndigo: '#6366F1',
    
    // Text levels
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textFaint: '#334155',
    
    // Quality tiers (1 to 5)
    quality: {
      1: {
        color: '#EF4444',
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.35)',
        label: 'Restless',
        sub: 'Tossing & turning',
      },
      2: {
        color: '#F97316',
        bg: 'rgba(249, 115, 22, 0.12)',
        border: 'rgba(249, 115, 22, 0.35)',
        label: 'Fragmented',
        sub: 'Woke up multiple times',
      },
      3: {
        color: '#F59E0B',
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.35)',
        label: 'Fair',
        sub: 'Average night',
      },
      4: {
        color: '#10B981',
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.35)',
        label: 'Sound',
        sub: 'Woke feeling rested',
      },
      5: {
        color: '#06B6D4',
        bg: 'rgba(6, 182, 212, 0.12)',
        border: 'rgba(6, 182, 212, 0.35)',
        label: 'Deep Rest',
        sub: 'Rejuvenated & sharp',
      },
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    xxl: 36,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 999,
  },
};
