import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    addDoc,
    collection,
    getDocs,
    orderBy,
    query,
    where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { PesertaScaffold } from '../../components/peserta/pesertachrome';
import { EmptyState } from '../../components/ui/emptystate';
import { auth, db } from '../../config/firebase';
import { DesignColors, Radius } from '../../constants/theme';

interface SeminarTersedia {
  id: string;
  title: string;
  image: string;
  lecturer: string;   // nama narasumber dari field 'lecturer' di Firestore
  date: string;       // tanggal dari field 'date'
  status: string;
  participantCount: number;
  registered: boolean;
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

export default function PesertaDaftarSeminarScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [list, setList] = useState<SeminarTersedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeminars();
  }, []);

  const loadSeminars = async () => {
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid;

      // Ambil semua seminar yang aktif atau selesai (bukan draft)
      const semSnap = await getDocs(
        query(collection(db, 'seminar'), orderBy('createdAt', 'desc'))
      );

      // Ambil seminar yang sudah didaftarkan user ini
      let registeredIds: Set<string> = new Set();
      if (uid) {
        const regSnap = await getDocs(
          query(collection(db, 'pendaftaran'), where('pesertaId', '==', uid))
        );
        regSnap.docs.forEach(d => {
          const data = d.data() as { seminarId: string };
          registeredIds.add(data.seminarId);
        });
      }

      const data: SeminarTersedia[] = semSnap.docs
        .map(d => {
          const raw = d.data() as {
            title: string;
            image?: string;
            lecturer?: string;
            date?: string;
            status?: string;
            participantCount?: number;
          };
          return {
            id: d.id,
            title: raw.title ?? '—',
            image: raw.image || FALLBACK_IMAGE,
            lecturer: raw.lecturer ?? '—',
            date: raw.date ?? '—',
            status: raw.status ?? 'aktif',
            participantCount: raw.participantCount ?? 0,
            registered: registeredIds.has(d.id),
          };
        })
        // Tampilkan semua kecuali draft
        .filter(s => s.status !== 'draft');

      setList(data);
    } catch (err) {
      console.error('loadSeminars error:', err);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = list.filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.lecturer.toLowerCase().includes(search.toLowerCase())
  );

  const handleRegister = async (id: string) => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert('Login Diperlukan', 'Silakan login untuk mendaftar seminar.');
      return;
    }

    try {
      await addDoc(collection(db, 'pendaftaran'), {
        pesertaId: uid,
        seminarId: id,
        status: 'menunggu',
        createdAt: new Date().toISOString(),
      });
      setList(prev =>
        prev.map(item => (item.id === id ? { ...item, registered: true } : item))
      );
      Alert.alert('Pendaftaran Terkirim', 'Anda akan menerima notifikasi setelah pendaftaran disetujui admin.');
    } catch {
      Alert.alert('Gagal', 'Pendaftaran gagal. Coba lagi.');
    }
  };

  return (
    <PesertaScaffold title="Daftar Seminar" onBack={() => router.back()}>
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={DesignColors.slateGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari seminar atau narasumber..."
          placeholderTextColor={DesignColors.slateGray}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={DesignColors.gold} />
          <Text style={styles.loadingText}>Memuat seminar...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="Seminar tidak ditemukan"
              message={
                list.length === 0
                  ? 'Belum ada seminar yang tersedia saat ini.'
                  : 'Coba kata kunci yang berbeda.'
              }
            />
          ) : (
            filtered.map(item => (
              <View key={item.id} style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />

                {/* Status badge */}
                <View style={[
                  styles.statusBadge,
                  item.status === 'aktif' ? styles.badgeAktif : styles.badgeSelesai,
                ]}>
                  <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.detailRow}>
                    <Ionicons name="person-outline" size={12} color={DesignColors.slateGray} />
                    <Text style={styles.detailText}>{item.lecturer}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={12} color={DesignColors.slateGray} />
                    <Text style={styles.detailText}>{item.date}</Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.registerBtn,
                      (item.registered || item.status === 'selesai') && styles.registerBtnDone,
                    ]}
                    onPress={() => !item.registered && item.status !== 'selesai' && handleRegister(item.id)}
                    disabled={item.registered || item.status === 'selesai'}
                  >
                    <Text style={[
                      styles.registerBtnText,
                      (item.registered || item.status === 'selesai') && styles.registerBtnTextDone,
                    ]}>
                      {item.registered
                        ? 'Terdaftar'
                        : item.status === 'selesai'
                        ? 'Seminar Selesai'
                        : 'Daftar Sekarang'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </PesertaScaffold>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 13, color: DesignColors.slateGray },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: DesignColors.ivoryCard,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    borderRadius: Radius.md,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 13, color: DesignColors.charcoal },
  scrollContent: { padding: 20, paddingBottom: 32 },
  card: {
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 130 },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  badgeAktif: { backgroundColor: 'rgba(16,185,129,0.9)' },
  badgeSelesai: { backgroundColor: 'rgba(239,68,68,0.85)' },
  statusText: { fontSize: 9, fontWeight: '800', color: '#FFF', letterSpacing: 0.6 },
  cardInfo: { padding: 14 },
  title: { fontSize: 14, fontWeight: '700', color: DesignColors.navyDeep, lineHeight: 19, marginBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  detailText: { fontSize: 11, color: DesignColors.slateGray, flex: 1 },
  registerBtn: {
    backgroundColor: DesignColors.gold,
    borderRadius: Radius.md,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 10,
  },
  registerBtnDone: {
    backgroundColor: DesignColors.offWhite,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
  },
  registerBtnText: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep },
  registerBtnTextDone: { color: DesignColors.slateGray },
});
