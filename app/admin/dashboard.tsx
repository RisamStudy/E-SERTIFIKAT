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
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth } from '../../config/firebase';
import { DesignColors, Radius } from '../../constants/theme';

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

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setAdminName(user.displayName || user.email || 'Admin');
    }
  }, []);

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
    { key: 'seminar', icon: 'document-text-outline', label: 'TOTAL SEMINAR', value: '42' },
    { key: 'peserta', icon: 'people-outline', label: 'TOTAL PESERTA', value: '12,840' },
    { key: 'sertifikat', icon: 'ribbon-outline', label: 'SERTIFIKAT TERBIT', value: '11,205' },
    { key: 'kehadiran', icon: 'stats-chart-outline', label: 'KEHADIRAN RATA-RATA', value: '87.4%' },
  ];

  const seminarList: SeminarItem[] = [
    {
      id: '1',
      title: 'Seminar Nasional Cyber Security 2024',
      image:
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      status: 'ACTIVE',
      participantCount: '1,240 Peserta',
      date: '24 Jul 2024',
      avatars: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=80&q=80',
      ],
      extraCount: '+99',
      actionLabel: 'Kelola Sesi',
      onAction: () => router.push('/admin/absensi'),
    },
    {
      id: '2',
      title: 'Workshop UI/UX Professional Design',
      image:
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
      status: 'UPCOMING',
      participantCount: '85 Peserta',
      date: '02 Agu 2024',
      avatars: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=80&q=80',
      ],
      extraCount: '+8',
      actionLabel: 'Edit Draft',
      onAction: () => router.push('/admin/seminar'),
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerSpacer} />
        <Text style={styles.brandText}>CertifyElite</Text>
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
                  <View style={[styles.avatarIndicator, { marginLeft: -12, zIndex: 1 }]}>
                    <Text style={styles.indicatorText}>{seminar.extraCount}</Text>
                  </View>
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
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="home" size={22} color={DesignColors.gold} />
          <Text style={[styles.tabLabel, { color: DesignColors.gold }]}>Beranda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/admin/generate_sertifikat')}>
          <Ionicons name="ribbon-outline" size={22} color={DesignColors.goldSoft} />
          <Text style={styles.tabLabel}>Sertifikat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/admin/seminar')}>
          <Ionicons name="calendar-outline" size={22} color={DesignColors.goldSoft} />
          <Text style={styles.tabLabel}>Seminar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => router.push('/admin/profil')}>
          <Ionicons name="person-outline" size={22} color={DesignColors.goldSoft} />
          <Text style={styles.tabLabel}>Profil</Text>
        </TouchableOpacity>
      </View>
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
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: DesignColors.navyDeep,
    height: 64,
    borderTopWidth: 1,
    borderTopColor: DesignColors.navySoft,
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
    color: DesignColors.goldSoft,
  },
});