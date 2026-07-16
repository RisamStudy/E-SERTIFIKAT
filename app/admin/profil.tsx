import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminScaffold } from '../../components/admin/adminchrome';
import { auth } from '../../config/firebase';
import { DesignColors, Radius } from '../../constants/theme';

interface MenuItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
  tone?: 'default' | 'danger';
}

export default function AdminProfilScreen() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const adminUser = auth.currentUser;
  const displayName = adminUser?.displayName || 'Administrator';
  const email = adminUser?.email || 'admin@certifyelite.id';

  const handleLogout = () => {
    Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar dari akun admin?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          setLoggingOut(true);
          try {
            await signOut(auth);
            router.replace('/login');
          } catch {
            Alert.alert('Error', 'Gagal keluar dari sesi.');
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    {
      key: 'pengaturan',
      icon: 'settings-outline',
      label: 'Pengaturan',
      description: 'Preferensi akun & aplikasi',
      onPress: () => router.push('/admin/pengaturan'),
    },
    {
      key: 'laporan',
      icon: 'bar-chart-outline',
      label: 'Laporan',
      description: 'Statistik seminar & sertifikat',
      onPress: () => router.push('/admin/laporan'),
    },
    {
      key: 'template',
      icon: 'ribbon-outline',
      label: 'Template Sertifikat',
      description: 'Atur tampilan sertifikat digital',
      onPress: () => router.push('/admin/template_sertifikat'),
    },
    {
      key: 'bantuan',
      icon: 'help-circle-outline',
      label: 'Pusat Bantuan',
      description: 'FAQ & hubungi tim support',
      onPress: () => Alert.alert('Bantuan', 'Hubungi support@certifyelite.id untuk bantuan lebih lanjut.'),
    },
    {
      key: 'keluar',
      icon: 'log-out-outline',
      label: 'Keluar',
      description: 'Akhiri sesi admin saat ini',
      onPress: handleLogout,
      tone: 'danger',
    },
  ];

  return (
    <AdminScaffold title="Profil Admin">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Identity Card */}
        <View style={styles.identityCard}>
          <View style={styles.avatarRing}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80' }}
              style={styles.avatar}
            />
          </View>
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.email}>{email}</Text>
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark-outline" size={12} color={DesignColors.navyDeep} />
            <Text style={styles.roleText}>Administrator</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStatsRow}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>42</Text>
            <Text style={styles.quickStatLabel}>Seminar</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>11,205</Text>
            <Text style={styles.quickStatLabel}>Sertifikat</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>3 thn</Text>
            <Text style={styles.quickStatLabel}>Bergabung</Text>
          </View>
        </View>

        {/* Menu List */}
        <View style={styles.menuGroup}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuRow, index === menuItems.length - 1 && styles.menuRowLast]}
              onPress={item.onPress}
              disabled={item.key === 'keluar' && loggingOut}
            >
              <View
                style={[
                  styles.menuIconWrap,
                  item.tone === 'danger' && { backgroundColor: 'rgba(179, 65, 58, 0.1)' },
                ]}
              >
                <Ionicons
                  name={item.icon}
                  size={18}
                  color={item.tone === 'danger' ? DesignColors.statusRed : DesignColors.navyDeep}
                />
              </View>
              <View style={styles.menuTextWrap}>
                <Text style={[styles.menuLabel, item.tone === 'danger' && { color: DesignColors.statusRed }]}>
                  {item.label}
                </Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={DesignColors.slateGray} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.versionText}>CertifyElite Admin • v1.0.0</Text>
      </ScrollView>
    </AdminScaffold>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 32 },
  identityCard: {
    backgroundColor: DesignColors.navyDeep,
    borderRadius: Radius.xl,
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: DesignColors.gold,
    padding: 3,
    marginBottom: 14,
  },
  avatar: { width: '100%', height: '100%', borderRadius: 39 },
  name: { fontSize: 18, fontWeight: '700', color: DesignColors.offWhite, marginBottom: 2 },
  email: { fontSize: 12, color: DesignColors.goldSoft, marginBottom: 12 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: DesignColors.gold,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.xl,
  },
  roleText: { fontSize: 11, fontWeight: '700', color: DesignColors.navyDeep },
  quickStatsRow: {
    flexDirection: 'row',
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    paddingVertical: 16,
    marginBottom: 20,
  },
  quickStat: { flex: 1, alignItems: 'center' },
  quickStatValue: { fontSize: 16, fontWeight: '700', color: DesignColors.navyDeep },
  quickStatLabel: { fontSize: 10, color: DesignColors.slateGray, marginTop: 4 },
  quickStatDivider: { width: 1, backgroundColor: DesignColors.borderLight },
  menuGroup: {
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    overflow: 'hidden',
    marginBottom: 20,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: DesignColors.borderLight,
    gap: 12,
  },
  menuRowLast: { borderBottomWidth: 0 },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: DesignColors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextWrap: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: DesignColors.navyDeep },
  menuDescription: { fontSize: 11, color: DesignColors.slateGray, marginTop: 2 },
  versionText: { textAlign: 'center', fontSize: 11, color: DesignColors.slateGray },
});