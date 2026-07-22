import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { AdminScaffold } from '../../components/admin/adminchrome';
import { StatusBadge } from '../../components/ui/statusbadge';
import { db } from '../../config/firebase';
import { DesignColors, Radius } from '../../constants/theme';

interface SeminarOption {
  id: string;
  title: string;
  date: string;
  kodeAbsensi: string; // format: ABSEN-{seminarId}
}

interface Kehadiran {
  id: string;
  pesertaId: string;
  namaPeserta: string;
  waktuAbsen: string;
  hadir: boolean;
}

export default function AdminAbsensiScreen() {
  const router = useRouter();
  const [seminars, setSeminars] = useState<SeminarOption[]>([]);
  const [activeSeminar, setActiveSeminar] = useState<SeminarOption | null>(null);
  const [kehadiranList, setKehadiranList] = useState<Kehadiran[]>([]);
  const [loadingSeminar, setLoadingSeminar] = useState(true);
  const [loadingKehadiran, setLoadingKehadiran] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  // Load seminar aktif
  useEffect(() => {
    (async () => {
      setLoadingSeminar(true);
      try {
        const snap = await getDocs(collection(db, 'seminar'));
        const data: SeminarOption[] = snap.docs
          .filter(d => (d.data() as { status?: string }).status === 'aktif')
          .map(d => ({
            id: d.id,
            title: (d.data() as { title: string }).title,
            date: (d.data() as { date?: string }).date ?? '—',
            kodeAbsensi: `ABSEN-${d.id}`,
          }));
        setSeminars(data);
        if (data.length > 0) setActiveSeminar(data[0]);
      } catch (err) {
        console.error('load seminars error:', err);
      } finally {
        setLoadingSeminar(false);
      }
    })();
  }, []);

  // Realtime listener kehadiran ketika seminar berubah
  useEffect(() => {
    if (!activeSeminar) return;
    setLoadingKehadiran(true);

    const q = query(
      collection(db, 'absensi'),
      where('seminarId', '==', activeSeminar.id)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const list: Kehadiran[] = await Promise.all(
        snap.docs.map(async (d) => {
          const data = d.data() as {
            pesertaId: string;
            waktuAbsen: string;
            hadir: boolean;
          };

          // Coba ambil nama peserta
          let namaPeserta = 'Peserta';
          try {
            const userSnap = await getDoc(doc(db, 'users', data.pesertaId));
            if (userSnap.exists()) {
              const ud = userSnap.data() as { displayName?: string; name?: string; email?: string; nama?: string };
              namaPeserta = ud.displayName || ud.name || ud.nama || ud.email || 'Peserta';
            }
          } catch { /* tidak ada doc user */ }

          return {
            id: d.id,
            pesertaId: data.pesertaId,
            namaPeserta,
            waktuAbsen: data.waktuAbsen ?? '—',
            hadir: data.hadir ?? false,
          };
        })
      );
      setKehadiranList(list);
      setLoadingKehadiran(false);
    });

    return () => unsub();
  }, [activeSeminar]);

  const hadirCount = kehadiranList.filter(k => k.hadir).length;
  const persentase = kehadiranList.length > 0
    ? Math.round((hadirCount / kehadiranList.length) * 100)
    : 0;

  const handleShareKode = async () => {
    if (!activeSeminar) return;
    try {
      await Share.share({
        message: `Kode absensi seminar "${activeSeminar.title}":\n\n${activeSeminar.kodeAbsensi}\n\nAtau scan QR code yang ditampilkan panitia.`,
      });
    } catch { /* cancelled */ }
  };

  return (
    <AdminScaffold
      title="Absensi Seminar"
      onBack={() => router.back()}
      rightIcon="qr-code-outline"
      onRightPress={() => activeSeminar && setShowQRModal(true)}
    >
      {loadingSeminar ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={DesignColors.gold} />
          <Text style={styles.loadingText}>Memuat data seminar...</Text>
        </View>
      ) : seminars.length === 0 ? (
        <View style={styles.loadingWrap}>
          <Ionicons name="calendar-outline" size={40} color={DesignColors.slateGray} />
          <Text style={styles.emptyText}>Tidak ada seminar aktif saat ini.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Seminar selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seminarSelectorRow}>
            {seminars.map((s) => {
              const active = s.id === activeSeminar?.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.seminarChip, active && styles.seminarChipActive]}
                  onPress={() => setActiveSeminar(s)}
                >
                  <Text style={[styles.seminarChipText, active && styles.seminarChipTextActive]} numberOfLines={1}>
                    {s.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* QR Code Card */}
          {activeSeminar && (
            <TouchableOpacity style={styles.qrCard} onPress={() => setShowQRModal(true)} activeOpacity={0.85}>
              <View style={styles.qrCardLeft}>
                <View style={styles.qrPreview}>
                  <QRCode
                    value={activeSeminar.kodeAbsensi}
                    size={64}
                    color={DesignColors.navyDeep}
                    backgroundColor="transparent"
                  />
                </View>
                <View style={styles.qrCardInfo}>
                  <Text style={styles.qrCardTitle}>QR Absensi</Text>
                  <Text style={styles.qrCardCode}>{activeSeminar.kodeAbsensi}</Text>
                  <Text style={styles.qrCardHint}>Tap untuk perbesar & tampilkan ke peserta</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShareKode}>
                <Ionicons name="share-outline" size={18} color={DesignColors.navyDeep} />
              </TouchableOpacity>
            </TouchableOpacity>
          )}

          {/* Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryPercent}>{persentase}%</Text>
              <Text style={styles.summaryLabel}>Tingkat Kehadiran</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryStats}>
              <View style={styles.summaryStatRow}>
                <View style={[styles.dot, { backgroundColor: DesignColors.statusGreen }]} />
                <Text style={styles.summaryStatText}>{hadirCount} Hadir</Text>
              </View>
              <View style={styles.summaryStatRow}>
                <View style={[styles.dot, { backgroundColor: DesignColors.slateGray }]} />
                <Text style={styles.summaryStatText}>{kehadiranList.length - hadirCount} Belum Hadir</Text>
              </View>
            </View>
          </View>

          {/* Daftar kehadiran */}
          <Text style={styles.sectionHeaderTitle}>Daftar Kehadiran</Text>

          {loadingKehadiran ? (
            <ActivityIndicator color={DesignColors.gold} style={{ marginTop: 20 }} />
          ) : kehadiranList.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={28} color={DesignColors.slateGray} />
              <Text style={styles.emptyBoxText}>Belum ada peserta yang absen.</Text>
              <Text style={styles.emptyBoxSub}>Peserta yang scan QR akan muncul di sini secara realtime.</Text>
            </View>
          ) : (
            kehadiranList.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarInitial}>
                    {item.namaPeserta.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.rowInfo}>
                  <Text style={styles.nama}>{item.namaPeserta}</Text>
                  <Text style={styles.waktu}>
                    {item.hadir ? `Absen pukul ${item.waktuAbsen} WIB` : 'Belum absen'}
                  </Text>
                </View>
                <StatusBadge
                  label={item.hadir ? 'Hadir' : 'Belum'}
                  tone={item.hadir ? 'success' : 'pending'}
                />
              </View>
            ))
          )}
        </ScrollView>
      )}

      {/* Modal QR Code besar */}
      <Modal visible={showQRModal} transparent animationType="fade" onRequestClose={() => setShowQRModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>QR Code Absensi</Text>
            {activeSeminar && (
              <>
                <Text style={styles.modalSeminarName} numberOfLines={2}>{activeSeminar.title}</Text>
                <Text style={styles.modalDate}>{activeSeminar.date}</Text>

                <View style={styles.qrBigWrap}>
                  <QRCode
                    value={activeSeminar.kodeAbsensi}
                    size={220}
                    color={DesignColors.navyDeep}
                    backgroundColor="#FFFFFF"
                  />
                </View>

                <Text style={styles.modalCodeLabel}>Kode Absensi</Text>
                <View style={styles.modalCodeBox}>
                  <Text style={styles.modalCodeText}>{activeSeminar.kodeAbsensi}</Text>
                </View>
                <Text style={styles.modalHint}>
                  Tampilkan QR ini kepada peserta.{'\n'}1 QR berlaku untuk semua peserta seminar ini.
                </Text>

                <TouchableOpacity style={styles.modalShareBtn} onPress={handleShareKode}>
                  <Ionicons name="share-outline" size={16} color={DesignColors.navyDeep} />
                  <Text style={styles.modalShareText}>Bagikan Kode</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowQRModal(false)}>
              <Text style={styles.modalCloseBtnText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AdminScaffold>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 13, color: DesignColors.slateGray },
  emptyText: { fontSize: 13, color: DesignColors.slateGray, textAlign: 'center' },
  scrollContent: { padding: 20, paddingBottom: 32 },
  seminarSelectorRow: { marginBottom: 16 },
  seminarChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    backgroundColor: DesignColors.ivoryCard,
    marginRight: 8,
    maxWidth: 240,
  },
  seminarChipActive: { backgroundColor: DesignColors.navyDeep, borderColor: DesignColors.navyDeep },
  seminarChipText: { fontSize: 12, fontWeight: '600', color: DesignColors.slateGray },
  seminarChipTextActive: { color: DesignColors.gold },
  qrCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: DesignColors.gold,
    padding: 16,
    marginBottom: 16,
  },
  qrCardLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  qrPreview: {
    backgroundColor: '#FFF',
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
  },
  qrCardInfo: { flex: 1 },
  qrCardTitle: { fontSize: 12, fontWeight: '700', color: DesignColors.navyDeep },
  qrCardCode: { fontSize: 11, fontWeight: '600', color: DesignColors.gold, marginTop: 2 },
  qrCardHint: { fontSize: 10, color: DesignColors.slateGray, marginTop: 4 },
  shareBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: DesignColors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: DesignColors.navyDeep,
    borderRadius: Radius.lg,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  summaryLeft: { alignItems: 'center', paddingRight: 20 },
  summaryPercent: { fontSize: 28, fontWeight: '800', color: DesignColors.gold },
  summaryLabel: { fontSize: 10, color: DesignColors.goldSoft, marginTop: 2, textAlign: 'center' },
  summaryDivider: { width: 1, height: 44, backgroundColor: DesignColors.navySoft, marginRight: 20 },
  summaryStats: { gap: 8 },
  summaryStatRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  summaryStatText: { fontSize: 12, color: DesignColors.offWhite, fontWeight: '600' },
  sectionHeaderTitle: { fontSize: 15, fontWeight: '700', color: DesignColors.navyDeep, marginBottom: 12 },
  emptyBox: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyBoxText: { fontSize: 13, color: DesignColors.slateGray, fontWeight: '600' },
  emptyBoxSub: { fontSize: 11, color: DesignColors.slateGray, textAlign: 'center', paddingHorizontal: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  avatarCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: DesignColors.navyDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 16, fontWeight: '700', color: DesignColors.gold },
  rowInfo: { flex: 1 },
  nama: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep },
  waktu: { fontSize: 11, color: DesignColors.slateGray, marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: DesignColors.navyDeep, marginBottom: 6 },
  modalSeminarName: {
    fontSize: 13,
    fontWeight: '600',
    color: DesignColors.charcoal,
    textAlign: 'center',
    marginBottom: 2,
  },
  modalDate: { fontSize: 11, color: DesignColors.slateGray, marginBottom: 24 },
  qrBigWrap: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: DesignColors.gold,
    marginBottom: 20,
  },
  modalCodeLabel: { fontSize: 10, fontWeight: '700', color: DesignColors.slateGray, letterSpacing: 1, marginBottom: 6 },
  modalCodeBox: {
    backgroundColor: DesignColors.navyDeep,
    borderRadius: Radius.md,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 12,
  },
  modalCodeText: { fontSize: 16, fontWeight: '800', color: DesignColors.gold, letterSpacing: 2 },
  modalHint: { fontSize: 11, color: DesignColors.slateGray, textAlign: 'center', lineHeight: 16, marginBottom: 20 },
  modalShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: DesignColors.gold,
    borderRadius: Radius.md,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 12,
    width: '100%',
    justifyContent: 'center',
  },
  modalShareText: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep },
  modalCloseBtn: {
    backgroundColor: DesignColors.navyDeep,
    borderRadius: Radius.md,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseBtnText: { fontSize: 14, fontWeight: '700', color: DesignColors.gold },
});
