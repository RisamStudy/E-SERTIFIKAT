import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { signOut } from 'firebase/auth';
import {
    collection,
    getDocs,
    query,
    where
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { PesertaBottomNav } from '../../components/peserta/pesertachrome';
import { auth, db } from '../../config/firebase';
import { DesignColors } from '../../constants/theme';

interface SeminarItem {
  id: string;
  title: string;
  date: string;
  lecturer: string;
}

interface SertifikatItem {
  id: string;
  seminarTitle: string;
  tanggalTerbit: string;
  idSertifikat: string;
}

export default function PesertaDashboard() {
  const router = useRouter();

  const [userName, setUserName] = useState('Peserta');
  const [logoutLoading, setLogoutLoading] = useState(false);

  const [jumlahSeminar, setJumlahSeminar] = useState(0);
  const [jumlahSertifikat, setJumlahSertifikat] = useState(0);
  const [seminarMendatang, setSeminarMendatang] = useState<SeminarItem[]>([]);
  const [sertifikatTerbaru, setSertifikatTerbaru] = useState<SertifikatItem | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || user.email || 'Peserta');
    }
    loadDashboardData(user?.uid);
  }, []);

  const loadDashboardData = async (uid?: string) => {
    setLoadingData(true);
    try {
      // Ambil semua seminar, filter dan sort di client
      const semSnap = await getDocs(query(collection(db, 'seminar')));
      const semList: SeminarItem[] = semSnap.docs
        .map(d => ({
          id: d.id,
          title: (d.data() as { title: string }).title,
          date: (d.data() as { date?: string }).date ?? '—',
          lecturer: (d.data() as { lecturer?: string }).lecturer ?? '—',
          status: (d.data() as { status?: string }).status ?? '',
          createdAt: (d.data() as { createdAt?: string }).createdAt ?? '',
        }))
        .filter(d => d.status === 'aktif')
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 3)
        .map(({ id, title, date, lecturer }) => ({ id, title, date, lecturer }));
      setSeminarMendatang(semList);

      if (uid) {
        // Jumlah seminar yang didaftarkan peserta
        const regSnap = await getDocs(
          query(collection(db, 'pendaftaran'), where('pesertaId', '==', uid))
        );
        setJumlahSeminar(regSnap.size);

        // Sertifikat milik peserta ini
        // Tanpa orderBy untuk menghindari composite index requirement
        const certSnap = await getDocs(
          query(
            collection(db, 'sertifikat'),
            where('pesertaId', '==', uid)
          )
        );
        // Sort di client
        const certDocs = certSnap.docs.sort((a, b) => {
          const aTime = (a.data() as { createdAt?: string }).createdAt ?? '';
          const bTime = (b.data() as { createdAt?: string }).createdAt ?? '';
          return bTime.localeCompare(aTime);
        });
        setJumlahSertifikat(certDocs.length);
        if (certDocs.length > 0) {
          const d = certDocs[0];
          setSertifikatTerbaru({
            id: d.id,
            seminarTitle: (d.data() as { seminarTitle: string }).seminarTitle,
            tanggalTerbit: (d.data() as { tanggalTerbit: string }).tanggalTerbit,
            idSertifikat: (d.data() as { idSertifikat: string }).idSertifikat,
          });
        }
      }
    } catch (err) {
      console.error('loadDashboardData error:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Konfirmasi Keluar', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          setLogoutLoading(true);
          try {
            await signOut(auth);
            router.replace('/login');
          } catch {
            Alert.alert('Error', 'Gagal keluar dari sesi.');
          } finally {
            setLogoutLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={20} color={DesignColors.gold} />
          </View>
          <Text style={styles.headerTitle}>Seminar Portal</Text>
        </View>
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={handleLogout}
          disabled={logoutLoading}
        >
          {logoutLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Ionicons name="log-out-outline" size={22} color={DesignColors.statusRed} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Welcome */}
        <Text style={styles.welcomeTitle}>Selamat Datang,</Text>
        <Text style={styles.welcomeName}>{userName}</Text>

        {/* Stat Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="calendar-outline" size={20} color={DesignColors.navyDeep} />
            </View>
            <Text style={styles.statValue}>
              {loadingData ? '—' : jumlahSeminar}
            </Text>
            <Text style={styles.statLabel}>Seminar Terdaftar</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Ionicons name="ribbon-outline" size={20} color={DesignColors.navyDeep} />
            </View>
            <Text style={styles.statValue}>
              {loadingData ? '—' : jumlahSertifikat}
            </Text>
            <Text style={styles.statLabel}>Sertifikat Diterima</Text>
          </View>
        </View>

        {/* Seminar Mendatang */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>Seminar Tersedia</Text>
          <TouchableOpacity onPress={() => router.push('/peserta/daftar_seminar')}>
            <Text style={styles.seeAll}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {loadingData ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={DesignColors.gold} />
          </View>
        ) : seminarMendatang.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="calendar-outline" size={28} color={DesignColors.slateGray} />
            <Text style={styles.emptyText}>Belum ada seminar aktif</Text>
          </View>
        ) : (
          seminarMendatang.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.seminarCard}
              activeOpacity={0.8}
              onPress={() => router.push('/peserta/daftar_seminar')}
            >
              <View style={styles.seminarCardLeft}>
                <View style={styles.seminarIconWrap}>
                  <Ionicons name="desktop-outline" size={18} color={DesignColors.gold} />
                </View>
                <View style={styles.seminarInfo}>
                  <Text style={styles.seminarTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.seminarMeta} numberOfLines={1}>
                    {item.lecturer} • {item.date}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={16} color={DesignColors.slateGray} />
            </TouchableOpacity>
          ))
        )}

        {/* Sertifikat Terbaru */}
        <View style={[styles.sectionRow, { marginTop: 24 }]}>
          <Text style={styles.sectionTitle}>Sertifikat Terbaru</Text>
          <TouchableOpacity onPress={() => router.push('/peserta/sertifikat')}>
            <Text style={styles.seeAll}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {loadingData ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={DesignColors.gold} />
          </View>
        ) : sertifikatTerbaru === null ? (
          <View style={styles.emptyBox}>
            <Ionicons name="ribbon-outline" size={28} color={DesignColors.slateGray} />
            <Text style={styles.emptyText}>Belum ada sertifikat</Text>
            <Text style={styles.emptySubtext}>
              Ikuti seminar untuk mendapatkan sertifikat digital
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.certCard}
            activeOpacity={0.85}
            onPress={() =>
              router.push({
                pathname: '/peserta/download_sertifikat',
                params: { id: sertifikatTerbaru.id },
              })
            }
          >
            {/* Cert preview inner */}
            <View style={styles.certInner}>
              <View style={styles.certLogoRow}>
                <Ionicons name="ribbon" size={18} color={DesignColors.gold} />
                <Text style={styles.certKicker}>E-SERTIFIKAT</Text>
              </View>
              <Text style={styles.certHeading}>SERTIFIKAT</Text>
              <Text style={styles.certGiven}>Diberikan kepada</Text>
              <Text style={styles.certName} numberOfLines={1}>{userName}</Text>
              <Text style={styles.certSeminar} numberOfLines={2}>
                {sertifikatTerbaru.seminarTitle}
              </Text>
              <View style={styles.certFooter}>
                <Text style={styles.certId}>{sertifikatTerbaru.idSertifikat}</Text>
                <Text style={styles.certDate}>{sertifikatTerbaru.tanggalTerbit}</Text>
              </View>
            </View>
            <View style={styles.certAction}>
              <Ionicons name="download-outline" size={16} color={DesignColors.navyDeep} />
              <Text style={styles.certActionText}>Lihat & Unduh</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      <PesertaBottomNav />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DesignColors.offWhite },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DesignColors.navyDeep,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 55 : 40,
    paddingBottom: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: DesignColors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { color: '#FFF', fontSize: 17, fontWeight: '700' },
  headerIconBtn: { padding: 4 },
  scroll: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 32 },
  welcomeTitle: { fontSize: 13, color: DesignColors.slateGray, marginBottom: 2 },
  welcomeName: { fontSize: 22, fontWeight: '800', color: DesignColors.navyDeep, marginBottom: 20 },

  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 16,
    alignItems: 'flex-start',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignColors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  statValue: { fontSize: 28, fontWeight: '800', color: DesignColors.gold },
  statLabel: { fontSize: 11, color: DesignColors.slateGray, marginTop: 2 },

  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: DesignColors.navyDeep },
  seeAll: { fontSize: 12, fontWeight: '700', color: DesignColors.gold },

  loadingRow: { paddingVertical: 20, alignItems: 'center' },
  emptyBox: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    paddingVertical: 28,
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  emptyText: { fontSize: 13, color: DesignColors.slateGray, fontWeight: '600' },
  emptySubtext: { fontSize: 11, color: DesignColors.slateGray, textAlign: 'center', paddingHorizontal: 24 },

  seminarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 14,
    marginBottom: 10,
  },
  seminarCardLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 8 },
  seminarIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: DesignColors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seminarInfo: { flex: 1 },
  seminarTitle: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep, lineHeight: 18 },
  seminarMeta: { fontSize: 11, color: DesignColors.slateGray, marginTop: 3 },

  certCard: {
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: DesignColors.gold,
    overflow: 'hidden',
    marginBottom: 8,
  },
  certInner: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: DesignColors.borderLight,
    alignItems: 'center',
  },
  certLogoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  certKicker: { fontSize: 9, fontWeight: '700', color: DesignColors.slateGray, letterSpacing: 1.5 },
  certHeading: { fontSize: 18, fontWeight: '800', color: DesignColors.navyDeep, letterSpacing: 3, marginBottom: 10 },
  certGiven: { fontSize: 10, color: DesignColors.slateGray, marginBottom: 4 },
  certName: { fontSize: 18, fontWeight: '700', fontStyle: 'italic', color: DesignColors.navyDeep, marginBottom: 6 },
  certSeminar: { fontSize: 10, color: DesignColors.charcoal, textAlign: 'center', lineHeight: 15, paddingHorizontal: 10 },
  certFooter: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 14 },
  certId: { fontSize: 9, color: DesignColors.slateGray, fontWeight: '600' },
  certDate: { fontSize: 9, color: DesignColors.slateGray },
  certAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: DesignColors.gold,
    paddingVertical: 12,
  },
  certActionText: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep },
});
