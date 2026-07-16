import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DesignColors, Radius } from '../../constants/theme';

export type StatusTone = 'success' | 'pending' | 'danger' | 'info';

const TONE_MAP: Record<StatusTone, { bg: string; fg: string }> = {
  success: { bg: 'rgba(62, 122, 93, 0.15)', fg: DesignColors.statusGreen },
  pending: { bg: '#EDEAE2', fg: DesignColors.slateGray },
  danger: { bg: 'rgba(179, 65, 58, 0.15)', fg: DesignColors.statusRed },
  info: { bg: 'rgba(201, 162, 75, 0.15)', fg: '#8A6A25' },
};

export function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  const colors = TONE_MAP[tone];
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
});