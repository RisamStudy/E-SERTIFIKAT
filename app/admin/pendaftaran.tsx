import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    updateDoc,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { AdminScaffold } from '../../components/admin/adminchrome';
import { EmptyState } from '../../components/ui/emptystate';
import { StatusBadge } from '../../components/ui/statusbadge';
import { db } from '../../config/firebase';
import { DesignColors, Radius } from '../../constants/theme';

interface Pendaftaran {
  id: string;
  pesertaId: string;
  namaPeserta: string;
  emailPeserta: string;
  seminarId: string;
  namaSeminar: string;
  tanggalDaftar: string;
  status: 'menunggu' | 'disetujui' | 'ditolak';
}

const TABS = ['Menunggu', 'Disetujui', 'Ditolak'] as const;

const STATUS_MAP: Record<typeof TABS[number], Pendaftaran['status']> = {
  Menunggu: 'menunggu',
  Disetujui: 'disetujui',
  Ditolak: 'ditolak',
};

export default function AdminPendaftaranScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Menunggu');
  const [list, setList] = useState<Pendaftaran[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadPendaftaran();
  }, []);

  const loadPendaftaran = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(
        query(collection(db, 'pendaftaran'), orderBy('createdAt', 'desc'))
      );

      const result: Pendaftaran[] = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data() as {
            pesertaId: string;
            seminarId: string;
            status: string;
            createdAt: string;
          };

          // Ambil nama peserta dari collection users
          let namaPeserta = 'Peserta';
          let emailPeserta = '';
          try {
            const userSnap = await getDoc(doc(db, 'users', data.pesertaId));
            if (userSnap.exists()) {
              const userData = userSnap.data() as { displayName?: string; name?: string; email?: string; nama?: string };
              namaPeserta = userData.displayName || userData.name || userData.nama || userData.email || 'Peserta';
              emailPeserta = userData.email ?? '';
            }
          } catch {
            // user doc tidak ada, gunakan default
          }

          // Ambil nama seminar
          let namaSeminar = '—';
          try {
            const semSnap = await getDoc(doc(db, 'seminar', data.seminarId));
            if (semSnap.exists()) {
              namaSeminar = (semSnap.data() as { title: string }).title;
            }
          } catch {
            // seminar doc tidak ada
          }

          // Format tanggal
          const tanggalDaftar = data.createdAt
            ? new Date(data.createdAt).toLocaleDateString('id-ID', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
              })
            : '—';

          return {
            id: d.id,
            pesertaId: data.pesertaId,
            namaPeserta,
            emailPeserta,
            seminarId: data.seminarId,
            namaSeminar,
            tanggalDaftar,
            status: (data.status as Pendaftaran['status']) ?? 'menunggu',
          };
        })
      );

      setList(result);
    } catch (err) {
      console.error('loadPendaftaran error:', err);
      Alert.alert('Error', 'Gagal memuat data pendaftaran.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: Pendaftaran['status']) => {
    setUpdatingId(id);
    try {
      await updateDoc(doc(db, 'pendaftaran', id), { status });
      setList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status } : item))
      );
    } catch {
      Alert.alert('Error', 'Gagal memperbarui status. Coba lagi.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleApprove = (id: string, nama: string) => {
    Alert.alert(
      'Setujui Pendaftaran',
      `Setujui pendaftaran ${nama}?`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Setujui', onPress: () => updateStatus(id, 'disetujui') },
      ]
    );
  };

  const handleReject = (id: string, nama: string) => {
    Alert.alert(
      'Tolak Pendaftaran',
      `Tolak pendaftaran ${nama}? Peserta akan diberitahu.`,
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Tolak', style: 'destructive', onPress: () => updateStatus(id, 'ditolak') },
      ]
    );
  };

  const filtered = list.filter((item) => item.status === STATUS_MAP[activeTab]);

  return (
    <AdminScaffold title="Pendaftaran" onBack={() => router.back()}>
      {/* Tab bar */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = tab === activeTab;
          const count = list.filter((item) => item.status === STATUS_MAP[tab]).length;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
              <View style={[styles.tabCount, active && styles.tabCountActive]}>
                <Text style={[styles.tabCountText, active && styles.tabCountTextActive]}>
                  {count}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={DesignColors.gold} />
          <Text style={styles.loadingText}>Memuat pendaftaran...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={loadPendaftaran} />
          }
        >
          {filtered.length === 0 ? (
            <EmptyState
              icon="document-text-outline"
              title="Tidak ada data"
              message={`Belum ada pendaftaran berstatus ${activeTab.toLowerCase()}.`}
            />
          ) : (
            filtered.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardTop}>
                  {/* Avatar inisial */}
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarInitial}>
                      {item.namaPeserta.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.cardInfo}>
                    <Text style={styles.nama}>{item.namaPeserta}</Text>
                    {item.emailPeserta ? (
                      <Text style={styles.email}>{item.emailPeserta}</Text>
                    ) : null}
                    <Text style={styles.seminar} numberOfLines={2}>
                      {item.namaSeminar}
                    </Text>
                    <View style={styles.metaRow}>
                      <Ionicons name="calendar-outline" size={11} color={DesignColors.slateGray} />
                      <Text style={styles.tanggal}> Mendaftar {item.tanggalDaftar}</Text>
                    </View>
                  </View>

                  <StatusBadge
                    label={
                      item.status === 'menunggu'
                        ? 'Menunggu'
                        : item.status === 'disetujui'
                        ? 'Disetujui'
                        : 'Ditolak'
                    }
                    tone={
                      item.status === 'menunggu'
                        ? 'pending'
                        : item.status === 'disetujui'
                        ? 'success'
                        : 'danger'
                    }
                  />
                </View>

                {item.status === 'menunggu' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => handleReject(item.id, item.namaPeserta)}
                      disabled={updatingId === item.id}
                    >
                      {updatingId === item.id ? (
                        <ActivityIndicator size="small" color={DesignColors.statusRed} />
                      ) : (
                        <Text style={styles.rejectBtnText}>Tolak</Text>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleApprove(item.id, item.namaPeserta)}
                      disabled={updatingId === item.id}
                    >
                      {updatingId === item.id ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.approveBtnText}>Setujui</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      )}
    </AdminScaffold>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 13, color: DesignColors.slateGray },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 16, gap: 8 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    backgroundColor: DesignColors.ivoryCard,
  },
  tabBtnActive: { backgroundColor: DesignColors.navyDeep, borderColor: DesignColors.navyDeep },
  tabText: { fontSize: 11, fontWeight: '600', color: DesignColors.slateGray },
  tabTextActive: { color: DesignColors.gold },
  tabCount: {
    backgroundColor: DesignColors.offWhite,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabCountActive: { backgroundColor: DesignColors.gold },
  tabCountText: { fontSize: 9, fontWeight: '700', color: DesignColors.slateGray },
  tabCountTextActive: { color: DesignColors.navyDeep },
  scrollContent: { padding: 20, paddingBottom: 32 },
  card: {
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 14,
    marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: DesignColors.navyDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 18, fontWeight: '700', color: DesignColors.gold },
  cardInfo: { flex: 1 },
  nama: { fontSize: 14, fontWeight: '700', color: DesignColors.navyDeep },
  email: { fontSize: 10, color: DesignColors.slateGray, marginTop: 1 },
  seminar: { fontSize: 11, color: DesignColors.charcoal, marginTop: 4, lineHeight: 15 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  tanggal: { fontSize: 10, color: DesignColors.slateGray },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  rejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: DesignColors.statusRed,
    borderRadius: Radius.md,
    paddingVertical: 9,
    alignItems: 'center',
  },
  rejectBtnText: { fontSize: 12, fontWeight: '700', color: DesignColors.statusRed },
  approveBtn: {
    flex: 1,
    backgroundColor: DesignColors.statusGreen,
    borderRadius: Radius.md,
    paddingVertical: 9,
    alignItems: 'center',
  },
  approveBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
});
