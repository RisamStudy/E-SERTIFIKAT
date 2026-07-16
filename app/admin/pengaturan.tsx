import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { AdminScaffold } from '../../components/admin/adminchrome';
import { DesignColors, Radius } from '../../constants/theme';

interface ToggleSetting {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  value: boolean;
}

export default function AdminPengaturanScreen() {
  const router = useRouter();

  const [toggles, setToggles] = useState<ToggleSetting[]>([
    {
      key: 'notifikasi',
      icon: 'notifications-outline',
      label: 'Notifikasi Push',
      description: 'Terima info pendaftaran & sertifikat baru',
      value: true,
    },
    {
      key: 'email',
      icon: 'mail-outline',
      label: 'Ringkasan Email Mingguan',
      description: 'Kirim ringkasan statistik ke email admin',
      value: true,
    },
    {
      key: 'otomatis',
      icon: 'flash-outline',
      label: 'Generate Sertifikat Otomatis',
      description: 'Terbitkan sertifikat begitu peserta absen hadir',
      value: false,
    },
    {
      key: 'verifikasi',
      icon: 'qr-code-outline',
      label: 'Wajib Verifikasi QR',
      description: 'Peserta harus scan QR saat absensi seminar',
      value: true,
    },
  ]);

  const toggleSwitch = (key: string) => {
    setToggles((prev) => prev.map((item) => (item.key === key ? { ...item, value: !item.value } : item)));
  };

  const handleResetTemplate = () => {
    Alert.alert('Reset Template', 'Kembalikan template sertifikat ke pengaturan default?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => Alert.alert('Berhasil', 'Template sertifikat direset.') },
    ]);
  };

  return (
    <AdminScaffold title="Pengaturan" onBack={() => router.back()}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.groupTitle}>Preferensi Notifikasi & Sistem</Text>
        <View style={styles.card}>
          {toggles.map((item, index) => (
            <View key={item.key} style={[styles.row, index === toggles.length - 1 && styles.rowLast]}>
              <View style={styles.rowIconWrap}>
                <Ionicons name={item.icon} size={18} color={DesignColors.navyDeep} />
              </View>
              <View style={styles.rowTextWrap}>
                <Text style={styles.rowLabel}>{item.label}</Text>
                <Text style={styles.rowDescription}>{item.description}</Text>
              </View>
              <Switch
                value={item.value}
                onValueChange={() => toggleSwitch(item.key)}
                trackColor={{ false: DesignColors.borderLight, true: DesignColors.goldSoft }}
                thumbColor={item.value ? DesignColors.gold : '#FFFFFF'}
                ios_backgroundColor={DesignColors.borderLight}
              />
            </View>
          ))}
        </View>

        <Text style={styles.groupTitle}>Template Sertifikat</Text>
        <TouchableOpacity style={styles.linkCard} onPress={() => router.push('/admin/template_sertifikat')}>
          <View style={styles.rowIconWrap}>
            <Ionicons name="color-palette-outline" size={18} color={DesignColors.navyDeep} />
          </View>
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowLabel}>Kelola Desain Template</Text>
            <Text style={styles.rowDescription}>Ubah warna, logo, dan tanda tangan digital</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={DesignColors.slateGray} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.linkCard, { marginTop: 12 }]} onPress={handleResetTemplate}>
          <View style={[styles.rowIconWrap, { backgroundColor: 'rgba(179, 65, 58, 0.1)' }]}>
            <Ionicons name="refresh-outline" size={18} color={DesignColors.statusRed} />
          </View>
          <View style={styles.rowTextWrap}>
            <Text style={[styles.rowLabel, { color: DesignColors.statusRed }]}>Reset ke Default</Text>
            <Text style={styles.rowDescription}>Kembalikan pengaturan template awal</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.groupTitle}>Tentang Aplikasi</Text>
        <View style={styles.card}>
          <View style={[styles.row, styles.rowLast]}>
            <View style={styles.rowIconWrap}>
              <Ionicons name="information-circle-outline" size={18} color={DesignColors.navyDeep} />
            </View>
            <View style={styles.rowTextWrap}>
              <Text style={styles.rowLabel}>CertifyElite</Text>
              <Text style={styles.rowDescription}>Versi 1.0.0 • Build Akademik</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </AdminScaffold>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 32 },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: DesignColors.slateGray,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    overflow: 'hidden',
    marginBottom: 24,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: DesignColors.borderLight,
  },
  rowLast: { borderBottomWidth: 0 },
  rowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: DesignColors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTextWrap: { flex: 1 },
  rowLabel: { fontSize: 14, fontWeight: '600', color: DesignColors.navyDeep },
  rowDescription: { fontSize: 11, color: DesignColors.slateGray, marginTop: 2 },
});