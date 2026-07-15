import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function AdminDashboard() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const [adminName, setAdminName] = useState('Admin CertifyElite');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setAdminName(user.displayName || user.email || 'Admin CertifyElite');
    }
  }, []);

  const handleLogout = async () => {
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

  // Theme colors
  const bgTheme = isDark ? '#111314' : '#FAFAFA';
  const cardBgTheme = isDark ? '#1A1D1E' : '#FFFFFF';
  const textTheme = isDark ? '#ECEDEE' : '#1F2937';
  const subtitleTheme = isDark ? '#9BA1A6' : '#6B7280';
  const borderTheme = isDark ? '#2E3336' : '#E5E7EB';
  const primaryTheme = '#D4AF37'; // Gold Accent

  return (
    <View style={[styles.container, { backgroundColor: bgTheme }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Premium Header */}
      <View style={[styles.header, { backgroundColor: cardBgTheme, borderBottomColor: borderTheme }]}>
        <View style={styles.headerProfile}>
          <View style={[styles.avatar, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
            <Ionicons name="shield-checkmark" size={24} color={primaryTheme} />
          </View>
          <View style={styles.profileText}>
            <Text style={[styles.welcomeText, { color: subtitleTheme }]}>System Administrator</Text>
            <Text style={[styles.adminName, { color: textTheme }]} numberOfLines={1}>{adminName}</Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color={primaryTheme} />
          ) : (
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Title */}
        <Text style={[styles.sectionTitle, { color: textTheme }]}>Pusat Kontrol</Text>
        
        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Stat Item 1 */}
          <View style={[styles.statCard, { backgroundColor: cardBgTheme, borderColor: borderTheme }]}>
            <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
              <Ionicons name="ribbon-outline" size={22} color={primaryTheme} />
            </View>
            <Text style={[styles.statValue, { color: textTheme }]}>124</Text>
            <Text style={[styles.statLabel, { color: subtitleTheme }]}>Sertifikat Rilis</Text>
          </View>

          {/* Stat Item 2 */}
          <View style={[styles.statCard, { backgroundColor: cardBgTheme, borderColor: borderTheme }]}>
            <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="people-outline" size={22} color="#3B82F6" />
            </View>
            <Text style={[styles.statValue, { color: textTheme }]}>1,402</Text>
            <Text style={[styles.statLabel, { color: subtitleTheme }]}>Total Peserta</Text>
          </View>

          {/* Stat Item 3 */}
          <View style={[styles.statCard, { backgroundColor: cardBgTheme, borderColor: borderTheme }]}>
            <View style={[styles.statIconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Ionicons name="easel-outline" size={22} color="#10B981" />
            </View>
            <Text style={[styles.statValue, { color: textTheme }]}>12</Text>
            <Text style={[styles.statLabel, { color: subtitleTheme }]}>Seminar Aktif</Text>
          </View>
        </View>

        {/* Quick Actions Title */}
        <Text style={[styles.sectionSubtitle, { color: textTheme, marginTop: 24 }]}>Aksi Cepat</Text>
        
        {/* Quick Actions List */}
        <View style={styles.actionsGrid}>
          {/* Action 1 */}
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: cardBgTheme, borderColor: borderTheme }]}
            onPress={() => router.push('/admin/generate_sertifikat')}
          >
            <Ionicons name="add-circle" size={32} color={primaryTheme} />
            <Text style={[styles.actionLabel, { color: textTheme }]}>Buat Sertifikat</Text>
          </TouchableOpacity>

          {/* Action 2 */}
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: cardBgTheme, borderColor: borderTheme }]}
            onPress={() => router.push('/admin/template_sertifikat')}
          >
            <Ionicons name="document-attach" size={32} color="#3B82F6" />
            <Text style={[styles.actionLabel, { color: textTheme }]}>Template Desain</Text>
          </TouchableOpacity>

          {/* Action 3 */}
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: cardBgTheme, borderColor: borderTheme }]}
            onPress={() => router.push('/admin/seminar')}
          >
            <Ionicons name="calendar" size={32} color="#10B981" />
            <Text style={[styles.actionLabel, { color: textTheme }]}>Kelola Seminar</Text>
          </TouchableOpacity>

          {/* Action 4 */}
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: cardBgTheme, borderColor: borderTheme }]}
            onPress={() => router.push('/admin/laporan')}
          >
            <Ionicons name="analytics" size={32} color="#8B5CF6" />
            <Text style={[styles.actionLabel, { color: textTheme }]}>Laporan Statistik</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Activities Section */}
        <Text style={[styles.sectionSubtitle, { color: textTheme, marginTop: 24 }]}>Rilis Sertifikat Terbaru</Text>

        <View style={[styles.activityList, { backgroundColor: cardBgTheme, borderColor: borderTheme }]}>
          {/* Item 1 */}
          <View style={styles.activityItem}>
            <View style={styles.activityInfo}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" style={styles.activityIcon} />
              <View>
                <Text style={[styles.activityName, { color: textTheme }]}>Webinar AI Developer 2026</Text>
                <Text style={[styles.activityMeta, { color: subtitleTheme }]}>Diterbitkan untuk 350 peserta</Text>
              </View>
            </View>
            <Text style={[styles.activityTime, { color: subtitleTheme }]}>Baru Saja</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: borderTheme }]} />

          {/* Item 2 */}
          <View style={styles.activityItem}>
            <View style={styles.activityInfo}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" style={styles.activityIcon} />
              <View>
                <Text style={[styles.activityName, { color: textTheme }]}>Seminar Nasional Cyber Security</Text>
                <Text style={[styles.activityMeta, { color: subtitleTheme }]}>Diterbitkan untuk 420 peserta</Text>
              </View>
            </View>
            <Text style={[styles.activityTime, { color: subtitleTheme }]}>2 Jam Lalu</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: borderTheme }]} />

          {/* Item 3 */}
          <View style={styles.activityItem}>
            <View style={styles.activityInfo}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" style={styles.activityIcon} />
              <View>
                <Text style={[styles.activityName, { color: textTheme }]}>Workshop Flutter Advanced</Text>
                <Text style={[styles.activityMeta, { color: subtitleTheme }]}>Diterbitkan untuk 120 peserta</Text>
              </View>
            </View>
            <Text style={[styles.activityTime, { color: subtitleTheme }]}>Kemarin</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  headerProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileText: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adminName: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      },
    }),
  },
  statIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  actionCard: {
    width: '46%',
    aspectRatio: 1.15,
    marginHorizontal: '2%',
    marginVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
      },
    }),
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
  },
  activityList: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  activityIcon: {
    marginRight: 12,
  },
  activityName: {
    fontSize: 13,
    fontWeight: '700',
  },
  activityMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 10,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    width: '100%',
  },
});
