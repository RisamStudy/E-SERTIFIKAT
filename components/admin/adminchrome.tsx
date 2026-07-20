import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DesignColors, Radius } from '../../constants/theme';

/**
 * Shared chrome for admin screens: top header bar + bottom tab bar.
 * Keeps every /app/admin/* screen visually consistent with design.md
 * without repeating the same markup in each file.
 */

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

export function AdminHeader({ title, subtitle, onBack, rightIcon, onRightPress }: AdminHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.headerBar, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerRow}>
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
      {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const ADMIN_TABS: { key: string; route: string; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
  { key: 'beranda', route: '/admin/dashboard', icon: 'home', label: 'Beranda' },
  { key: 'pendaftaran', route: '/admin/pendaftaran', icon: 'person-add-outline', label: 'Pendaftaran' },
  { key: 'seminar', route: '/admin/seminar', icon: 'calendar-outline', label: 'Seminar' },
  { key: 'profil', route: '/admin/profil', icon: 'person-outline', label: 'Profil' },
];

export function AdminBottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bottomTabBar, { paddingBottom: insets.bottom }]}>
      {ADMIN_TABS.map((tab) => {
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

export function AdminScaffold({
  title,
  subtitle,
  onBack,
  rightIcon,
  onRightPress,
  children,
}: AdminHeaderProps & { children: React.ReactNode }) {
  return (
    <View style={styles.screen}>
      <AdminHeader title={title} subtitle={subtitle} onBack={onBack} rightIcon={rightIcon} onRightPress={onRightPress} />
      <View style={styles.body}>{children}</View>
      <AdminBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DesignColors.offWhite,
  },
  body: {
    flex: 1,
  },
  headerBar: {
    backgroundColor: DesignColors.navyDeep,
    paddingHorizontal: 12,
    paddingBottom: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '700',
    color: DesignColors.gold,
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    textAlign: 'center',
    fontSize: 12,
    color: DesignColors.goldSoft,
    marginTop: 4,
    paddingHorizontal: 24,
  },
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: DesignColors.navyDeep,
    borderTopWidth: 1,
    borderTopColor: DesignColors.navySoft,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
    color: DesignColors.goldSoft,
  },
});

export { Radius as AdminRadius };
