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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';

export default function PesertaDashboard() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const [userName, setUserName] = useState('Participant');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || user.email || 'Participant');
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
  const textTheme = isDark ? '#ECEDEE' : '#162031';
  const subtitleTheme = isDark ? '#9BA1A6' : '#6A7382';
  const borderTheme = isDark ? '#2E3336' : '#F3F4F6';
  const primaryTheme = '#D9AA3F'; // Premium Gold

  return (
    <View style={[styles.container, { backgroundColor: bgTheme }]}>
      <StatusBar style="light" />

      {/* 1. Header Bar Portal Seminar (Dark Blue) */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }}
            style={styles.avatar}
          />
          <Text style={styles.headerTitle}>Seminar Portal</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerIconBtn}>
            <Ionicons name="notifications-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.headerIconBtn, { marginLeft: 12 }]} onPress={handleLogout} disabled={loading}>
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* 2. Welcome Title */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: textTheme }]}>Selamat Datang, {userName}</Text>
          <Text style={[styles.welcomeSubtitle, { color: subtitleTheme }]}>
            Berikut adalah rangkuman aktivitas akademik Anda minggu ini.
          </Text>
        </View>

        {/* 3. Stat Cards Section (Vertical Stack) */}
        <View style={styles.statsContainer}>
          {/* Card 1: Seminar Terdaftar */}
          <View style={[styles.statCard, { backgroundColor: cardBgTheme, borderColor: borderTheme }]}>
            <View style={styles.statCardHeader}>
              <View style={styles.statIconContainer}>
                <Ionicons name="calendar-outline" size={24} color="#162031" />
              </View>
              <Text style={[styles.statCardLabel, { color: subtitleTheme }]}>Seminar Terdaftar</Text>
            </View>
            <View style={styles.statCardBody}>
              <Text style={[styles.statCardValue, { color: primaryTheme }]}>12</Text>
              <Text style={[styles.statCardSubtext, { color: subtitleTheme }]}>+2 dari bulan lalu</Text>
            </View>
          </View>

          {/* Card 2: Sertifikat Tersedia */}
          <View style={[styles.statCard, { backgroundColor: cardBgTheme, borderColor: borderTheme }]}>
            <View style={styles.statCardHeader}>
              <View style={styles.statIconContainer}>
                <Ionicons name="ribbon-outline" size={24} color="#162031" />
              </View>
              <Text style={[styles.statCardLabel, { color: subtitleTheme }]}>Sertifikat Tersedia</Text>
            </View>
            <View style={styles.statCardBody}>
              <Text style={[styles.statCardValue, { color: primaryTheme }]}>08</Text>
              <Text style={[styles.statCardSubtext, { color: subtitleTheme }]}>Siap untuk diunduh</Text>
            </View>
          </View>

          {/* Card 3: Skor Kehadiran (Dark Blue Background) */}
          <View style={[styles.statCardDark, { backgroundColor: '#111E2E' }]}>
            {/* Subtle Toga Watermark */}
            <View style={styles.watermarkContainer}>
              <Ionicons name="school" size={130} color="rgba(255, 255, 255, 0.04)" />
            </View>

            <View style={styles.statCardHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <Ionicons name="shield-checkmark-outline" size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.statCardLabelDark}>Skor Kehadiran</Text>
            </View>
            <View style={styles.statCardBody}>
              <Text style={[styles.statCardValue, { color: primaryTheme }]}>95%</Text>
              <Text style={styles.statCardSubtextDark}>Sangat Baik</Text>
            </View>
          </View>
        </View>

        {/* 4. Seminar Mendatang Section */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="time-outline" size={20} color="#162031" style={styles.sectionHeaderIcon} />
            <Text style={[styles.sectionTitle, { color: textTheme }]}>Seminar Mendatang</Text>
          </View>
          <TouchableOpacity>
            <Text style={[styles.seeAllLink, { color: primaryTheme }]}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {/* Seminar List Stack */}
        <View style={styles.seminarList}>
          {/* Seminar 1 */}
          <View style={[styles.seminarCard, { backgroundColor: cardBgTheme, borderColor: borderTheme }]}>
            <View style={styles.seminarCardLeft}>
              <View style={[styles.dateBadge, { backgroundColor: '#162031' }]}>
                <Text style={styles.dateBadgeMonth}>MEI</Text>
                <Text style={styles.dateBadgeDay}>24</Text>
              </View>
              <View style={styles.seminarInfo}>
                <Text style={[styles.seminarTitle, { color: textTheme }]} numberOfLines={1}>
                  Transformasi Digital di Era AI
                </Text>
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={12} color={subtitleTheme} style={styles.metaIcon} />
                  <Text style={[styles.metaText, { color: subtitleTheme }]} numberOfLines={1}>
                    Auditorium Utama & Online (Hybrid)
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={[styles.arrowButton, { borderColor: borderTheme }]}>
              <Ionicons name="chevron-forward" size={16} color={subtitleTheme} />
            </TouchableOpacity>
          </View>

          {/* Seminar 2 */}
          <View style={[styles.seminarCard, { backgroundColor: cardBgTheme, borderColor: borderTheme }]}>
            <View style={styles.seminarCardLeft}>
              <View style={[styles.dateBadge, { backgroundColor: '#E5E7EB' }]}>
                <Text style={[styles.dateBadgeMonth, { color: '#9CA3AF' }]}>JUN</Text>
                <Text style={[styles.dateBadgeDay, { color: '#1F2937' }]}>02</Text>
              </View>
              <View style={styles.seminarInfo}>
                <Text style={[styles.seminarTitle, { color: textTheme }]} numberOfLines={1}>
                  Metodologi Riset Kuantitatif Tingkat Lanjut
                </Text>
                <View style={styles.metaRow}>
                  <Ionicons name="videocam-outline" size={12} color={subtitleTheme} style={styles.metaIcon} />
                  <Text style={[styles.metaText, { color: subtitleTheme }]} numberOfLines={1}>
                    Zoom Meeting ID: 452 983 234
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={[styles.arrowButton, { borderColor: borderTheme }]}>
              <Ionicons name="chevron-forward" size={16} color={subtitleTheme} />
            </TouchableOpacity>
          </View>

          {/* Seminar 3 */}
          <View style={[styles.seminarCard, { backgroundColor: cardBgTheme, borderColor: borderTheme }]}>
            <View style={styles.seminarCardLeft}>
              <View style={[styles.dateBadge, { backgroundColor: '#E5E7EB' }]}>
                <Text style={[styles.dateBadgeMonth, { color: '#9CA3AF' }]}>JUN</Text>
                <Text style={[styles.dateBadgeDay, { color: '#1F2937' }]}>15</Text>
              </View>
              <View style={styles.seminarInfo}>
                <Text style={[styles.seminarTitle, { color: textTheme }]} numberOfLines={1}>
                  Etika Profesional dalam Dunia Akademik
                </Text>
                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={12} color={subtitleTheme} style={styles.metaIcon} />
                  <Text style={[styles.metaText, { color: subtitleTheme }]} numberOfLines={1}>
                    Ruang Seminar Lantai 4
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity style={[styles.arrowButton, { borderColor: borderTheme }]}>
              <Ionicons name="chevron-forward" size={16} color={subtitleTheme} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Sertifikat Terbaru Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <Text style={[styles.sectionTitle, { color: textTheme }]}>Sertifikat Terbaru</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllLink, { color: primaryTheme }]}>Unduh PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Certificate Preview Card */}
        <View style={[styles.certPreviewCard, { backgroundColor: cardBgTheme, borderColor: borderTheme }]}>
          <View style={styles.certInnerBorder}>
            <Text style={styles.certMainTitle}>CERTIFICATE OF EXCELLENCE</Text>
            <Text style={styles.certSubtitle}>This is to certify that</Text>
            
            <Text style={styles.certName} numberOfLines={1}>{userName}</Text>
            
            <Text style={styles.certDesc}>
              has successfully completed the seminar on{'\n'}
              <Text style={styles.certBoldText}>Advanced Data Science Principles</Text>{'\n'}
              conducted on May 10, 2024
            </Text>

            <View style={styles.certFooter}>
              <View style={styles.certSignContainer}>
                <Image
                  source={require('../../assets/ttd_risam.png')}
                  style={styles.signatureImage}
                  resizeMode="contain"
                />
                <View style={styles.signLine} />
                <Text style={styles.certSignLabel}>DEAN OF ACADEMIC</Text>
              </View>

              {/* Styled CSS Golden Seal Stamp */}
              <View style={[styles.sealStamp, { borderColor: primaryTheme }]}>
                <View style={[styles.sealStampInner, { borderColor: primaryTheme }]}>
                  <Text style={[styles.sealStampText, { color: primaryTheme }]}>OFFICIAL</Text>
                  <Text style={[styles.sealStampText, { color: primaryTheme }]}>SEAL</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* 6. Gold Button */}
        <TouchableOpacity style={[styles.listAllBtn, { backgroundColor: '#E3C185' }]}>
          <Ionicons name="download-outline" size={20} color="#FFFFFF" style={styles.btnIcon} />
          <Text style={styles.listAllBtnText}>LIHAT SEMUA SERTIFIKAT</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 7. Bottom Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="grid" size={22} color={primaryTheme} />
          <Text style={[styles.tabLabel, { color: primaryTheme }]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="compass-outline" size={22} color="#94A3B8" />
          <Text style={[styles.tabLabel, { color: '#94A3B8' }]}>Catalog</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="calendar-outline" size={22} color="#94A3B8" />
          <Text style={[styles.tabLabel, { color: '#94A3B8' }]}>My Seminars</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="qr-code-outline" size={22} color="#94A3B8" />
          <Text style={[styles.tabLabel, { color: '#94A3B8' }]}>Attendance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="ribbon-outline" size={22} color="#94A3B8" />
          <Text style={[styles.tabLabel, { color: '#94A3B8' }]}>Certificates</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#162031',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconBtn: {
    padding: 4,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  welcomeSubtitle: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.02,
        shadowRadius: 6,
      },
      android: {
        elevation: 1,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)',
      },
    }),
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  statCardLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  statCardBody: {
    alignItems: 'flex-end',
  },
  statCardValue: {
    fontSize: 26,
    fontWeight: '800',
  },
  statCardSubtext: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
  },
  statCardDark: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  watermarkContainer: {
    position: 'absolute',
    right: -10,
    bottom: -20,
    zIndex: 0,
  },
  statCardLabelDark: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statCardSubtextDark: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  seeAllLink: {
    fontSize: 13,
    fontWeight: '700',
  },
  seminarList: {
    marginBottom: 8,
  },
  seminarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.01)',
      },
    }),
  },
  seminarCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  dateBadge: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  dateBadgeMonth: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateBadgeDay: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 1,
  },
  seminarInfo: {
    flex: 1,
  },
  seminarTitle: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  metaIcon: {
    marginRight: 4,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  certPreviewCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 6px 16px rgba(0, 0, 0, 0.04)',
      },
    }),
  },
  certInnerBorder: {
    borderWidth: 1.5,
    borderColor: '#F3F4F6',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  certMainTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.5,
    color: '#162031',
    textAlign: 'center',
  },
  certSubtitle: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#6A7382',
    marginTop: 12,
    textAlign: 'center',
  },
  certName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#162031',
    marginTop: 8,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', web: 'Georgia, serif' }),
  },
  certDesc: {
    fontSize: 8.5,
    lineHeight: 14,
    color: '#6A7382',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  certBoldText: {
    fontWeight: '700',
    color: '#162031',
  },
  certFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 8,
  },
  certSignContainer: {
    alignItems: 'center',
    width: 100,
  },
  signatureImage: {
    width: 70,
    height: 30,
    marginBottom: -4,
  },
  signLine: {
    width: '100%',
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  certSignLabel: {
    fontSize: 7,
    fontWeight: '700',
    color: '#6A7382',
  },
  sealStamp: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  sealStampInner: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-12deg' }],
  },
  sealStampText: {
    fontSize: 6.5,
    fontWeight: '800',
    lineHeight: 8,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  listAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#D9AA3F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  btnIcon: {
    marginRight: 8,
  },
  listAllBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#162031',
    height: 64,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
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
  },
});
