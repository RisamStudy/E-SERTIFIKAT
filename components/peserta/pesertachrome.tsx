import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DesignColors } from '../../constants/theme';

/** Shared chrome for peserta screens: top header + bottom tab bar. */

interface PesertaHeaderProps {
  title: string;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

export function PesertaHeader({ title, onBack, rightIcon, onRightPress }: PesertaHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.headerBar, { paddingTop: insets.top + 12 }]}>
      {onBack ? (
        <TouchableOpacity style={styles.headerIconBtn} onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color={DesignColors.gold} />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerIconBtn} />
      )}
      <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
      {rightIcon ? (
        <TouchableOpacity style={styles.headerIconBtn} onPress={onRightPress}>
          <Ionicons name={rightIcon} size={20} color={DesignColors.gold} />
        </TouchableOpacity>
      ) : (
        <View style={styles.headerIconBtn} />
      )}
    </View>
  );
}

const PESERTA_TABS: { key: string; route: string; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { key: 'beranda', route: '/peserta/dashboard', icon: 'home', label: 'Beranda' },
  { key: 'seminar', route: '/peserta/seminar_saya', icon: 'calendar-outline', label: 'Seminar' },
  { key: 'absensi', route: '/peserta/absensi', icon: 'qr-code-outline', label: 'Absensi' },
  { key: 'profil', route: '/peserta/profil', icon: 'person-outline', label: 'Profil' },
];

export function PesertaBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomTabBar, { paddingBottom: insets.bottom }]}>
      {PESERTA_TABS.map((tab) => {
        const active = pathname === tab.route;
        return (
          <TouchableOpacity key={tab.key} style={styles.tabItem} onPress={() => router.push(tab.route as any)}>
            <Ionicons name={tab.icon} size={22} color={active ? DesignColors.gold : DesignColors.goldSoft} />
            <Text style={[styles.tabLabel, active && { color: DesignColors.gold }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function PesertaScaffold({
  title,
  onBack,
  rightIcon,
  onRightPress,
  children,
}: PesertaHeaderProps & { children: React.ReactNode }) {
  return (
    <View style={styles.screen}>
      <PesertaHeader title={title} onBack={onBack} rightIcon={rightIcon} onRightPress={onRightPress} />
      <View style={styles.body}>{children}</View>
      <PesertaBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: DesignColors.offWhite },
  body: { flex: 1 },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DesignColors.navyDeep,
    paddingHorizontal: 12,
    paddingBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  headerIconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: DesignColors.gold,
    letterSpacing: 0.3,
  },
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: DesignColors.navyDeep,
    borderTopWidth: 1,
    borderTopColor: DesignColors.navySoft,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center', flex: 1, paddingTop: 10, paddingBottom: 10 },
  tabLabel: { fontSize: 9, fontWeight: '600', marginTop: 4, color: DesignColors.goldSoft },
});