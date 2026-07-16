import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminScaffold } from '../../components/admin/adminchrome';
import { DesignColors, Radius } from '../../constants/theme';

const PERIODS = ['6 Bulan', '1 Tahun', 'Semua'] as const;

const monthlyData = [
  { label: 'Feb', seminar: 4, sertifikat: 320 },
  { label: 'Mar', seminar: 6, sertifikat: 540 },
  { label: 'Apr', seminar: 5, sertifikat: 410 },
  { label: 'Mei', seminar: 8, sertifikat: 780 },
  { label: 'Jun', seminar: 7, sertifikat: 690 },
  { label: 'Jul', seminar: 9, sertifikat: 940 },
];

const topSeminars = [
  { title: 'Seminar Nasional Cyber Security 2024', peserta: 1240, kehadiran: 92 },
  { title: 'Workshop UI/UX Professional Design', peserta: 850, kehadiran: 88 },
  { title: 'Konferensi Rekayasa Perangkat Lunak', peserta: 610, kehadiran: 81 },
];

export default function AdminLaporanScreen() {
  const router = useRouter();
  const [activePeriod, setActivePeriod] = useState<(typeof PERIODS)[number]>('6 Bulan');

  const maxSertifikat = Math.max(...monthlyData.map((d) => d.sertifikat));

  return (
    <AdminScaffold title="Laporan" subtitle="Ringkasan performa seminar & sertifikat" onBack={() => router.back()}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Period Filter */}
        <View style={styles.periodRow}>
          {PERIODS.map((period) => {
            const active = period === activePeriod;
            return (
              <TouchableOpacity
                key={period}
                style={[styles.periodChip, active && styles.periodChipActive]}
                onPress={() => setActivePeriod(period)}
              >
                <Text style={[styles.periodText, active && styles.periodTextActive]}>{period}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Summary row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Ionicons name="trending-up-outline" size={18} color={DesignColors.statusGreen} />
            <Text style={styles.summaryValue}>+18.2%</Text>
            <Text style={styles.summaryLabel}>Pertumbuhan Peserta</Text>
          </View>
          <View style={styles.summaryCard}>
            <Ionicons name="ribbon-outline" size={18} color={DesignColors.gold} />
            <Text style={styles.summaryValue}>3,680</Text>
            <Text style={styles.summaryLabel}>Sertifikat Bulan Ini</Text>
          </View>
        </View>

        {/* Bar chart - Sertifikat terbit per bulan */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Sertifikat Terbit per Bulan</Text>
          <View style={styles.chartArea}>
            {monthlyData.map((item) => {
              const heightPct = (item.sertifikat / maxSertifikat) * 100;
              return (
                <View key={item.label} style={styles.barColumn}>
                  <Text style={styles.barValue}>{item.sertifikat}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${heightPct}%` }]} />
                  </View>
                  <Text style={styles.barLabel}>{item.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Seminar count mini bars */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Jumlah Seminar Diselenggarakan</Text>
          {monthlyData.map((item) => (
            <View key={item.label} style={styles.horizontalBarRow}>
              <Text style={styles.horizontalBarLabel}>{item.label}</Text>
              <View style={styles.horizontalBarTrack}>
                <View style={[styles.horizontalBarFill, { width: `${(item.seminar / 9) * 100}%` }]} />
              </View>
              <Text style={styles.horizontalBarValue}>{item.seminar}</Text>
            </View>
          ))}
        </View>

        {/* Top seminars */}
        <Text style={styles.sectionHeaderTitle}>Seminar Berkinerja Terbaik</Text>
        {topSeminars.map((seminar, index) => (
          <View key={seminar.title} style={styles.rankCard}>
            <View style={styles.rankBadge}>
              <Text style={styles.rankBadgeText}>{index + 1}</Text>
            </View>
            <View style={styles.rankInfo}>
              <Text style={styles.rankTitle} numberOfLines={2}>{seminar.title}</Text>
              <Text style={styles.rankMeta}>{seminar.peserta.toLocaleString('id-ID')} peserta • {seminar.kehadiran}% kehadiran</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </AdminScaffold>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 32 },
  periodRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  periodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    backgroundColor: DesignColors.ivoryCard,
  },
  periodChipActive: { backgroundColor: DesignColors.navyDeep, borderColor: DesignColors.navyDeep },
  periodText: { fontSize: 12, fontWeight: '600', color: DesignColors.slateGray },
  periodTextActive: { color: DesignColors.gold },
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  summaryCard: {
    flex: 1,
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 16,
  },
  summaryValue: { fontSize: 18, fontWeight: '700', color: DesignColors.navyDeep, marginTop: 8 },
  summaryLabel: { fontSize: 11, color: DesignColors.slateGray, marginTop: 2 },
  chartCard: {
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 18,
    marginBottom: 20,
  },
  chartTitle: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep, marginBottom: 16 },
  chartArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 140 },
  barColumn: { alignItems: 'center', flex: 1 },
  barValue: { fontSize: 9, color: DesignColors.slateGray, marginBottom: 4, fontWeight: '600' },
  barTrack: {
    width: 16,
    height: 90,
    backgroundColor: DesignColors.offWhite,
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', backgroundColor: DesignColors.gold, borderRadius: 6 },
  barLabel: { fontSize: 10, color: DesignColors.slateGray, marginTop: 8, fontWeight: '600' },
  horizontalBarRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  horizontalBarLabel: { width: 28, fontSize: 11, fontWeight: '600', color: DesignColors.slateGray },
  horizontalBarTrack: { flex: 1, height: 8, backgroundColor: DesignColors.offWhite, borderRadius: 4, overflow: 'hidden' },
  horizontalBarFill: { height: '100%', backgroundColor: DesignColors.statusGreen, borderRadius: 4 },
  horizontalBarValue: { width: 20, fontSize: 11, fontWeight: '700', color: DesignColors.navyDeep, textAlign: 'right' },
  sectionHeaderTitle: { fontSize: 15, fontWeight: '700', color: DesignColors.navyDeep, marginBottom: 12 },
  rankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DesignColors.navyDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeText: { fontSize: 12, fontWeight: '700', color: DesignColors.gold },
  rankInfo: { flex: 1 },
  rankTitle: { fontSize: 13, fontWeight: '600', color: DesignColors.navyDeep, marginBottom: 4 },
  rankMeta: { fontSize: 11, color: DesignColors.slateGray },
});