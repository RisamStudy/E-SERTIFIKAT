import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminScaffold } from '../../components/admin/adminchrome';
import { StatusBadge } from '../../components/ui/statusbadge';
import { DesignColors, Radius } from '../../constants/theme';

interface Kehadiran {
  id: string;
  nama: string;
  avatar: string;
  waktuAbsen: string | null;
  hadir: boolean;
}

const seminarOptions = ['Seminar Nasional Cyber Security 2024', 'Workshop UI/UX Professional Design'];

const initialList: Kehadiran[] = [
  { id: '1', nama: 'Rangga Aditya', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', waktuAbsen: '09:02', hadir: true },
  { id: '2', nama: 'Sinta Maharani', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', waktuAbsen: '09:05', hadir: true },
  { id: '3', nama: 'Doni Prasetyo', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', waktuAbsen: null, hadir: false },
  { id: '4', nama: 'Melati Wijaya', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80', waktuAbsen: null, hadir: false },
];

export default function AdminAbsensiScreen() {
  const router = useRouter();
  const [activeSeminar, setActiveSeminar] = useState(seminarOptions[0]);
  const [list, setList] = useState<Kehadiran[]>(initialList);

  const hadirCount = list.filter((item) => item.hadir).length;
  const persentase = Math.round((hadirCount / list.length) * 100);

  const toggleHadir = (id: string) => {
    setList((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              hadir: !item.hadir,
              waktuAbsen: !item.hadir ? new Date().toTimeString().slice(0, 5) : null,
            }
          : item
      )
    );
  };

  const handleManualCheckin = () => {
    Alert.alert('Absensi Manual', 'Masukkan kode registrasi peserta untuk mencatat kehadiran secara manual.');
  };

  return (
    <AdminScaffold title="Absensi Seminar" onBack={() => router.back()} rightIcon="qr-code-outline" onRightPress={handleManualCheckin}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Seminar selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seminarSelectorRow}>
          {seminarOptions.map((title) => {
            const active = title === activeSeminar;
            return (
              <TouchableOpacity key={title} style={[styles.seminarChip, active && styles.seminarChipActive]} onPress={() => setActiveSeminar(title)}>
                <Text style={[styles.seminarChipText, active && styles.seminarChipTextActive]} numberOfLines={1}>{title}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLeft}>
            <Text style={styles.summaryPercent}>{persentase}%</Text>
            <Text style={styles.summaryLabel}>Tingkat Kehadiran</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryStats}>
            <View style={styles.summaryStatRow}>
              <View style={[styles.dot, { backgroundColor: DesignColors.statusGreen }]} />
              <Text style={styles.summaryStatText}>{hadirCount} Hadir</Text>
            </View>
            <View style={styles.summaryStatRow}>
              <View style={[styles.dot, { backgroundColor: DesignColors.slateGray }]} />
              <Text style={styles.summaryStatText}>{list.length - hadirCount} Belum Hadir</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeaderTitle}>Daftar Peserta</Text>
        {list.map((item) => (
          <TouchableOpacity key={item.id} style={styles.row} onPress={() => toggleHadir(item.id)} activeOpacity={0.75}>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.rowInfo}>
              <Text style={styles.nama}>{item.nama}</Text>
              <Text style={styles.waktu}>{item.hadir ? `Absen pukul ${item.waktuAbsen} WIB` : 'Belum melakukan absensi'}</Text>
            </View>
            <StatusBadge label={item.hadir ? 'Hadir' : 'Belum'} tone={item.hadir ? 'success' : 'pending'} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </AdminScaffold>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 32 },
  seminarSelectorRow: { marginBottom: 16 },
  seminarChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    backgroundColor: DesignColors.ivoryCard,
    marginRight: 8,
    maxWidth: 240,
  },
  seminarChipActive: { backgroundColor: DesignColors.navyDeep, borderColor: DesignColors.navyDeep },
  seminarChipText: { fontSize: 12, fontWeight: '600', color: DesignColors.slateGray },
  seminarChipTextActive: { color: DesignColors.gold },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: DesignColors.navyDeep,
    borderRadius: Radius.lg,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  summaryLeft: { alignItems: 'center', paddingRight: 20 },
  summaryPercent: { fontSize: 28, fontWeight: '800', color: DesignColors.gold },
  summaryLabel: { fontSize: 10, color: DesignColors.goldSoft, marginTop: 2, textAlign: 'center' },
  summaryDivider: { width: 1, height: 44, backgroundColor: DesignColors.navySoft, marginRight: 20 },
  summaryStats: { gap: 8 },
  summaryStatRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  summaryStatText: { fontSize: 12, color: DesignColors.offWhite, fontWeight: '600' },
  sectionHeaderTitle: { fontSize: 15, fontWeight: '700', color: DesignColors.navyDeep, marginBottom: 12 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  avatar: { width: 42, height: 42, borderRadius: 21 },
  rowInfo: { flex: 1 },
  nama: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep },
  waktu: { fontSize: 11, color: DesignColors.slateGray, marginTop: 2 },
});