import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminScaffold } from '../../components/admin/adminchrome';
import { db } from '../../config/firebase';
import { DesignColors, Radius } from '../../constants/theme';

const PERIODS = ['6 Bulan', '1 Tahun', 'Semua'] as const;

interface SeminarDoc {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  participantCount?: number;
}

interface SertifikatDoc {
  id: string;
  seminarId: string;
  seminarTitle: string;
  createdAt: string;
}

interface MonthStat {
  label: string;
  seminar: number;
  sertifikat: number;
}

interface TopSeminar {
  title: string;
  peserta: number;
  sertifikat: number;
}

function getMonthLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { month: 'short' });
}

function filterByPeriod(dateStr: string, period: typeof PERIODS[number]): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  if (period === 'Semua') return true;
  const monthsAgo = period === '6 Bulan' ? 6 : 12;
  const cutoff = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  return d >= cutoff;
}

export default function AdminLaporanScreen() {
  const router = useRouter();
  const [activePeriod, setActivePeriod] = useState<typeof PERIODS[number]>('6 Bulan');
  const [loading, setLoading] = useState(true);

  const [seminars, setSeminars] = useState<SeminarDoc[]>([]);
  const [sertifikats, setSertifikats] = useState<SertifikatDoc[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [semSnap, certSnap] = await Promise.all([
          getDocs(query(collection(db, 'seminar'), orderBy('createdAt', 'asc'))),
          getDocs(query(collection(db, 'sertifikat'), orderBy('createdAt', 'asc'))),
        ]);
        setSeminars(semSnap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<SeminarDoc, 'id'>) })));
        setSertifikats(certSnap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<SertifikatDoc, 'id'>) })));
      } catch {
        // Firestore belum ada data
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Filter berdasarkan period
  const filteredSeminars = seminars.filter(s => filterByPeriod(s.createdAt, activePeriod));
  const filteredCerts = sertifikats.filter(c => filterByPeriod(c.createdAt, activePeriod));

  // Buat data per bulan
  const monthMap: Record<string, MonthStat> = {};
  filteredSeminars.forEach(s => {
    const label = getMonthLabel(s.createdAt);
    if (!monthMap[label]) monthMap[label] = { label, seminar: 0, sertifikat: 0 };
    monthMap[label].seminar += 1;
  });
  filteredCerts.forEach(c => {
    const label = getMonthLabel(c.createdAt);
    if (!monthMap[label]) monthMap[label] = { label, seminar: 0, sertifikat: 0 };
    monthMap[label].sertifikat += 1;
  });
  const monthlyData: MonthStat[] = Object.values(monthMap).slice(-6);
  const maxSertifikat = Math.max(1, ...monthlyData.map(d => d.sertifikat));
  const maxSeminar = Math.max(1, ...monthlyData.map(d => d.seminar));

  // Top seminars: seminar dengan sertifikat terbanyak
  const seminarCertCount: Record<string, { title: string; sertifikat: number; peserta: number }> = {};
  filteredCerts.forEach(c => {
    if (!seminarCertCount[c.seminarId]) {
      seminarCertCount[c.seminarId] = { title: c.seminarTitle, sertifikat: 0, peserta: 0 };
    }
    seminarCertCount[c.seminarId].sertifikat += 1;
  });
  filteredSeminars.forEach(s => {
    if (seminarCertCount[s.id]) {
      seminarCertCount[s.id].peserta = s.participantCount ?? 0;
    }
  });
  const topSeminars: TopSeminar[] = Object.values(seminarCertCount)
    .sort((a, b) => b.sertifikat - a.sertifikat)
    .slice(0, 5);

  // Summary
  const totalSeminar = filteredSeminars.length;
  const totalCert = filteredCerts.length;
  const prevCert = sertifikats.filter(c => {
    const d = new Date(c.createdAt);
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    return d >= start && d < end;
  }).length;
  const thisCert = sertifikats.filter(c => {
    const d = new Date(c.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
  const growth = prevCert > 0 ? (((thisCert - prevCert) / prevCert) * 100).toFixed(1) : null;

  return (
    <AdminScaffold title="Laporan" subtitle="Ringkasan performa seminar & sertifikat" onBack={() => router.back()}>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={DesignColors.gold} />
          <Text style={styles.loadingText}>Memuat data laporan...</Text>
        </View>
      ) : (
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
              <Ionicons name="calendar-outline" size={18} color={DesignColors.gold} />
              <Text style={styles.summaryValue}>{totalSeminar}</Text>
              <Text style={styles.summaryLabel}>Total Seminar</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="ribbon-outline" size={18} color={DesignColors.gold} />
              <Text style={styles.summaryValue}>{totalCert.toLocaleString('id-ID')}</Text>
              <Text style={styles.summaryLabel}>Total Sertifikat</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Ionicons
                name={growth !== null && parseFloat(growth) >= 0 ? 'trending-up-outline' : 'trending-down-outline'}
                size={18}
                color={growth !== null && parseFloat(growth) >= 0 ? DesignColors.statusGreen : DesignColors.statusRed}
              />
              <Text style={styles.summaryValue}>
                {growth !== null ? `${parseFloat(growth) >= 0 ? '+' : ''}${growth}%` : '—'}
              </Text>
              <Text style={styles.summaryLabel}>Pertumbuhan Bulan Ini</Text>
            </View>
            <View style={styles.summaryCard}>
              <Ionicons name="today-outline" size={18} color={DesignColors.gold} />
              <Text style={styles.summaryValue}>{thisCert.toLocaleString('id-ID')}</Text>
              <Text style={styles.summaryLabel}>Sertifikat Bulan Ini</Text>
            </View>
          </View>

          {monthlyData.length === 0 ? (
            <View style={styles.emptyChart}>
              <Ionicons name="bar-chart-outline" size={32} color={DesignColors.slateGray} />
              <Text style={styles.emptyChartText}>Belum ada data pada periode ini</Text>
            </View>
          ) : (
            <>
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
                          <View style={[styles.barFill, { height: `${heightPct}%` as any }]} />
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
                      <View style={[styles.horizontalBarFill, { width: `${(item.seminar / maxSeminar) * 100}%` as any }]} />
                    </View>
                    <Text style={styles.horizontalBarValue}>{item.seminar}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Top seminars */}
          {topSeminars.length > 0 && (
            <>
              <Text style={styles.sectionHeaderTitle}>Seminar Sertifikat Terbanyak</Text>
              {topSeminars.map((seminar, index) => (
                <View key={index} style={styles.rankCard}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankBadgeText}>{index + 1}</Text>
                  </View>
                  <View style={styles.rankInfo}>
                    <Text style={styles.rankTitle} numberOfLines={2}>{seminar.title}</Text>
                    <Text style={styles.rankMeta}>
                      {seminar.sertifikat.toLocaleString('id-ID')} sertifikat terbit
                      {seminar.peserta > 0 ? ` • ${seminar.peserta.toLocaleString('id-ID')} peserta` : ''}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      )}
    </AdminScaffold>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 13, color: DesignColors.slateGray },
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
  summaryRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  summaryCard: {
    flex: 1,
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 16,
  },
  summaryValue: { fontSize: 20, fontWeight: '800', color: DesignColors.navyDeep, marginTop: 8 },
  summaryLabel: { fontSize: 11, color: DesignColors.slateGray, marginTop: 2 },
  emptyChart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 10,
    marginBottom: 20,
  },
  emptyChartText: { fontSize: 12, color: DesignColors.slateGray },
  chartCard: {
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 18,
    marginBottom: 20,
    marginTop: 8,
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
