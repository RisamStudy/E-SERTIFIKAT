import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { PesertaScaffold } from '../../components/peserta/pesertachrome';
import { EmptyState } from '../../components/ui/emptystate';
import { StatusBadge } from '../../components/ui/statusbadge';
import { auth, db } from '../../config/firebase';
import { DesignColors, Radius } from '../../constants/theme';

interface SeminarSaya {
  id: string;
  seminarId: string;
  title: string;
  image: string;
  tanggal: string;
  status: 'aktif' | 'selesai' | 'draft';
  sudahAbsen: boolean;
}

const TABS = ['Akan Datang', 'Selesai'] as const;

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';

export default function PesertaSeminarSayaScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Akan Datang');
  const [list, setList] = useState<SeminarSaya[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSeminarSaya();
  }, []);

  const loadSeminarSaya = async () => {
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) { setLoading(false); return; }

      // Ambil semua pendaftaran peserta ini
      const regSnap = await getDocs(
        query(collection(db, 'pendaftaran'), where('pesertaId', '==', uid))
      );

      if (regSnap.empty) { setList([]); setLoading(false); return; }

      // Ambil absensi peserta untuk cek sudah absen atau belum
      const absenSnap = await getDocs(
        query(collection(db, 'absensi'), where('pesertaId', '==', uid))
      );
      const absenSeminarIds = new Set(
        absenSnap.docs.map(d => (d.data() as { seminarId: string }).seminarId)
      );

      // Resolve data seminar untuk tiap pendaftaran
      const result: SeminarSaya[] = (
        await Promise.all(
          regSnap.docs.map(async (d) => {
            const reg = d.data() as { seminarId: string; status: string };
            try {
              const semSnap = await getDoc(doc(db, 'seminar', reg.seminarId));
              if (!semSnap.exists()) return null;
              const sem = semSnap.data() as {
                title: string;
                image?: string;
                date?: string;
                status?: string;
              };
              return {
                id: d.id,
                seminarId: reg.seminarId,
                title: sem.title,
                image: sem.image || FALLBACK_IMAGE,
                tanggal: sem.date ?? '—',
                status: (sem.status ?? 'aktif') as SeminarSaya['status'],
                sudahAbsen: absenSeminarIds.has(reg.seminarId),
              };
            } catch {
              return null;
            }
          })
        )
      ).filter((item): item is SeminarSaya => item !== null);

      setList(result);
    } catch (err) {
      console.error('loadSeminarSaya error:', err);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = list.filter((item) =>
    activeTab === 'Akan Datang' ? item.status === 'aktif' : item.status === 'selesai'
  );

  return (
    <PesertaScaffold title="Seminar Saya">
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={DesignColors.gold} />
          <Text style={styles.loadingText}>Memuat seminar Anda...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filtered.length === 0 ? (
            <EmptyState
              icon="calendar-outline"
              title="Belum ada seminar"
              message={
                activeTab === 'Akan Datang'
                  ? 'Daftar seminar baru lewat menu Daftar Seminar di Beranda.'
                  : 'Seminar yang sudah selesai akan tampil di sini.'
              }
            />
          ) : (
            filtered.map((item) => (
              <View key={item.id} style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <View style={styles.cardInfo}>
                  <StatusBadge
                    label={
                      item.status === 'selesai'
                        ? 'Selesai'
                        : item.sudahAbsen
                        ? 'Sudah Absen'
                        : 'Aktif'
                    }
                    tone={
                      item.status === 'selesai'
                        ? 'success'
                        : item.sudahAbsen
                        ? 'success'
                        : 'pending'
                    }
                  />
                  <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={12} color={DesignColors.slateGray} />
                    <Text style={styles.detailText}>{item.tanggal}</Text>
                  </View>

                  {item.status !== 'selesai' && !item.sudahAbsen && (
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => router.push('/peserta/absensi')}
                    >
                      <Ionicons name="qr-code-outline" size={14} color={DesignColors.navyDeep} />
                      <Text style={styles.actionBtnText}>Lakukan Absensi</Text>
                    </TouchableOpacity>
                  )}

                  {item.sudahAbsen && item.status !== 'selesai' && (
                    <View style={styles.absenDoneRow}>
                      <Ionicons name="checkmark-circle" size={14} color={DesignColors.statusGreen} />
                      <Text style={styles.absenDoneText}>Absensi tercatat</Text>
                    </View>
                  )}

                  {item.status === 'selesai' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.actionBtnOutline]}
                      onPress={() => router.push('/peserta/sertifikat')}
                    >
                      <Ionicons name="ribbon-outline" size={14} color={DesignColors.gold} />
                      <Text style={[styles.actionBtnText, { color: DesignColors.gold }]}>
                        Lihat Sertifikat
                      </Text>
                    </TouchableOpacity>
                  )}
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
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 16, gap: 8 },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    backgroundColor: DesignColors.ivoryCard,
  },
  tabBtnActive: { backgroundColor: DesignColors.navyDeep, borderColor: DesignColors.navyDeep },
  tabText: { fontSize: 12, fontWeight: '600', color: DesignColors.slateGray },
  tabTextActive: { color: DesignColors.gold },
  scrollContent: { padding: 20, paddingBottom: 32 },
  card: {
    flexDirection: 'row',
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    marginBottom: 14,
    overflow: 'hidden',
  },
  cardImage: { width: 96, minHeight: 130 },
  cardInfo: { flex: 1, padding: 14, gap: 6 },
  title: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep, lineHeight: 18, marginTop: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { fontSize: 11, color: DesignColors.slateGray },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: DesignColors.gold,
    borderRadius: Radius.sm,
    paddingVertical: 8,
    marginTop: 4,
  },
  actionBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: DesignColors.gold,
  },
  actionBtnText: { fontSize: 11, fontWeight: '700', color: DesignColors.navyDeep },
  absenDoneRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 },
  absenDoneText: { fontSize: 11, color: DesignColors.statusGreen, fontWeight: '600' },
});
