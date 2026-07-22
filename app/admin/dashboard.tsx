import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AdminBottomNav } from '../../components/admin/adminchrome';
import { auth, db } from '../../config/firebase';
import { DesignColors, Radius } from '../../constants/theme';
import { collection, getDocs, query, where } from 'firebase/firestore';

interface StatItem {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}

interface SeminarItem {
  id: string;
  title: string;
  image: string;
  status: 'ACTIVE' | 'UPCOMING';
  participantCount: string;
  date: string;
  avatars: string[];
  extraCount: string;
  actionLabel: string;
  onAction: () => void;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [adminName, setAdminName] = useState('Admin');
  const [loading, setLoading] = useState(false);

  const [totalSeminar, setTotalSeminar] = useState(0);
  const [totalPeserta, setTotalPeserta] = useState(0);
  const [totalSertifikat, setTotalSertifikat] = useState(0);
  const [kehadiranRataRata, setKehadiranRataRata] = useState('0%');
  const [seminarList, setSeminarList] = useState<SeminarItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setAdminName(user.displayName || user.email || 'Admin');
    }
    loadStatsData();
  }, []);

  const loadStatsData = async () => {
    setLoadingStats(true);
    try {
      // 1. Total Seminar
      const semSnap = await getDocs(collection(db, 'seminar'));
      setTotalSeminar(semSnap.size);

      // 2. Total Peserta (users with role 'peserta')
      const userSnap = await getDocs(query(collection(db, 'users'), where('role', '==', 'peserta')));
      setTotalPeserta(userSnap.size);

      // 3. Sertifikat Terbit
      const certSnap = await getDocs(collection(db, 'sertifikat'));
      setTotalSertifikat(certSnap.size);

      // 4. Kehadiran Rata-rata
      const absSnap = await getDocs(collection(db, 'absensi'));
      const regSnap = await getDocs(collection(db, 'pendaftaran'));
      const avgKehadiran = regSnap.size > 0 ? Math.round((absSnap.size / regSnap.size) * 100) : 0;
      setKehadiranRataRata(`${avgKehadiran}%`);

      // 5. Seminar Berjalan (Ambil 3 seminar terbaru)
      const sortedSeminars = semSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as any))
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
        .slice(0, 3);

      const semListWithCounts = await Promise.all(
        sortedSeminars.map(async (sem): Promise<SeminarItem> => {
          const semRegSnap = await getDocs(
            query(collection(db, 'pendaftaran'), where('seminarId', '==', sem.id))
          );
          const participantCount = semRegSnap.size;

          const avatars = [
            'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80',
            'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=100&q=80',
          ].slice(0, Math.min(participantCount, 3));

          const extraCount = participantCount > 3 ? `+${participantCount - 3}` : '';
          const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

          return {
            id: sem.id,
            title: sem.title || 'Seminar',
            image: sem.image || FALLBACK_IMAGE,
            status: sem.status === 'selesai' ? 'UPCOMING' : 'ACTIVE',
            participantCount: `${participantCount} Peserta Terdaftar`,
            date: sem.date || '—',
            avatars,
            extraCount,
            actionLabel: 'Kelola',
            onAction: () => router.push('/admin/pendaftaran'),
          };
        })
      );

      setSeminarList(semListWithCounts);
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          setLoading(true);
          try {
            await signOut(auth);
            router.replace('/login');
          } catch {
            Alert.alert('Error', 'Gagal keluar dari sesi.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const stats: StatItem[] = [
    { key: 'seminar', icon: 'document-text-outline', label: 'TOTAL SEMINAR', value: loadingStats ? '—' : String(totalSeminar) },
    { key: 'peserta', icon: 'people-outline', label: 'TOTAL PESERTA', value: loadingStats ? '—' : String(totalPeserta) },
    { key: 'sertifikat', icon: 'ribbon-outline', label: 'SERTIFIKAT TERBIT', value: loadingStats ? '—' : String(totalSertifikat) },
    { key: 'kehadiran', icon: 'stats-chart-outline', label: 'KEHADIRAN RATA-RATA', value: loadingStats ? '—' : kehadiranRataRata },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerSpacer} />
        <Text style={styles.brandText}>E-Sertifikat</Text>
        <TouchableOpacity style={styles.avatarContainer} onPress={handleLogout} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={DesignColors.gold} />
          ) : (
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
              }}
              style={styles.avatarImage}
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loadingStats} onRefresh={loadStatsData} />
        }
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.sectionMainTitle}>Ringkasan Statistik</Text>
          <Text style={styles.sectionSubtitle}>
            Pantau performa kegiatan seminar dan penerbitan sertifikat Anda hari ini.
          </Text>
        </View>

        {/* Stat Cards Grid (2x2) */}
        <View style={styles.statsGrid}>
          {stats.map((stat) => (
            <View key={stat.key} style={styles.statCard}>
              <View style={styles.statIconContainer}>
                <Ionicons name={stat.icon} size={20} color={DesignColors.navyDeep} />
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionHeaderTitle}>Menu Cepat</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/admin/pendaftaran')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#EEF4FF' }]}>
              <Ionicons name="person-add-outline" size={22} color="#3B82F6" />
            </View>
            <Text style={styles.quickActionLabel}>Pendaftaran</Text>
            <Text style={styles.quickActionDesc}>Kelola & acc peserta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/admin/generate_sertifikat')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF9EC' }]}>
              <Ionicons name="ribbon-outline" size={22} color={DesignColors.gold} />
            </View>
            <Text style={styles.quickActionLabel}>Sertifikat</Text>
            <Text style={styles.quickActionDesc}>Generate & terbitkan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/admin/absensi')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#EDFDF5' }]}>
              <Ionicons name="checkmark-circle-outline" size={22} color={DesignColors.statusGreen} />
            </View>
            <Text style={styles.quickActionLabel}>Absensi</Text>
            <Text style={styles.quickActionDesc}>Kelola kehadiran</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/admin/laporan')}
          >
            <View style={[styles.quickActionIcon, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="bar-chart-outline" size={22} color={DesignColors.statusRed} />
            </View>
            <Text style={styles.quickActionLabel}>Laporan</Text>
            <Text style={styles.quickActionDesc}>Statistik & data</Text>
          </TouchableOpacity>
        </View>

        {/* Seminar Berjalan Section */}
        <Text style={styles.sectionHeaderTitle}>Seminar Berjalan</Text>

        {seminarList.map((seminar) => (
          <View key={seminar.id} style={styles.seminarCard}>
            <View style={styles.imageWrapper}>
              <Image source={{ uri: seminar.image }} style={styles.seminarImage} />
              <View
                style={[
                  styles.statusBadge,
                  seminar.status === 'ACTIVE' ? styles.badgeActive : styles.badgeUpcoming,
                ]}
              >
                <Text style={styles.statusText}>{seminar.status}</Text>
              </View>
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.seminarTitle}>{seminar.title}</Text>

              <View style={styles.detailRow}>
                <Ionicons
                  name="people-outline"
                  size={14}
                  color={DesignColors.slateGray}
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>{seminar.participantCount}</Text>
              </View>

              <View style={styles.detailRow}>
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={DesignColors.slateGray}
                  style={styles.detailIcon}
                />
                <Text style={styles.detailText}>{seminar.date}</Text>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardFooter}>
                <View style={styles.avatarStack}>
                  {seminar.avatars.map((uri, index) => (
                    <Image
                      key={uri}
                      source={{ uri }}
                      style={[
                        styles.stackedAvatar,
                        index > 0 && { marginLeft: -12 },
                        { zIndex: seminar.avatars.length - index + 1 },
                      ]}
                    />
                  ))}
                  {!!seminar.extraCount && (
                    <View style={[styles.avatarIndicator, { marginLeft: -12, zIndex: 1 }]}>
                      <Text style={styles.indicatorText}>{seminar.extraCount}</Text>
                    </View>
                  )}
                </View>

                <TouchableOpacity onPress={seminar.onAction}>
                  <Text style={styles.footerLinkText}>{seminar.actionLabel}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <AdminBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignColors.offWhite,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DesignColors.navyDeep,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 55 : 40,
    paddingBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: { elevation: 4 },
    }),
  },
  headerSpacer: {
    width: 36,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '700',
    color: DesignColors.gold,
    letterSpacing: 0.5,
    textAlign: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: DesignColors.goldSoft,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 88,
  },
  titleSection: {
    marginBottom: 20,
  },
  sectionMainTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: DesignColors.navyDeep,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: DesignColors.slateGray,
    lineHeight: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 1 },
      web: { boxShadow: '0 2px 8px rgba(15, 27, 45, 0.05)' },
    }),
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: DesignColors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: DesignColors.slateGray,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: DesignColors.navyDeep,
  },
  sectionHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DesignColors.navyDeep,
    marginBottom: 16,
  },
  seminarCard: {
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    marginBottom: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
      web: { boxShadow: '0 4px 14px rgba(15, 27, 45, 0.06)' },
    }),
  },
  imageWrapper: {
    height: 150,
    width: '100%',
    position: 'relative',
  },
  seminarImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  badgeActive: {
    backgroundColor: DesignColors.statusGreen,
  },
  badgeUpcoming: {
    backgroundColor: DesignColors.gold,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    color: DesignColors.offWhite,
    letterSpacing: 0.8,
  },
  cardInfo: {
    padding: 16,
  },
  seminarTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: DesignColors.navyDeep,
    lineHeight: 20,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 12,
    color: DesignColors.slateGray,
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    backgroundColor: DesignColors.borderLight,
    marginVertical: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: DesignColors.ivoryCard,
  },
  avatarIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: DesignColors.navyDeep,
    borderWidth: 2,
    borderColor: DesignColors.ivoryCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorText: {
    fontSize: 8,
    color: DesignColors.offWhite,
    fontWeight: '700',
  },
  footerLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: DesignColors.gold,
    textDecorationLine: 'underline',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  quickActionCard: {
    width: '47%',
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 16,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  quickActionLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: DesignColors.navyDeep,
    marginBottom: 2,
  },
  quickActionDesc: {
    fontSize: 10,
    color: DesignColors.slateGray,
  },
});