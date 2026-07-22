import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
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

const VERIFY_BASE_URL = 'https://esertifikat.app/verify';

interface EligiblePeserta {
  id: string;         // UID peserta
  pendaftaranId: string;
  nama: string;
  email: string;
  kehadiran: number;
  sudahTerbit: boolean;
  selected: boolean;
}

interface SeminarOption {
  id: string;
  title: string;
}

interface TemplateData {
  judulAcara: string;
  namaPenandatangan: string;
  jabatan: string;
  showQr: boolean;
  signatories?: {
    nama: string;
    jabatan: string;
    keyTtd: string;
  }[];
}

export default function AdminGenerateSertifikatScreen() {
  const router = useRouter();
  const [seminars, setSeminars] = useState<SeminarOption[]>([]);
  const [activeSeminar, setActiveSeminar] = useState<SeminarOption | null>(null);
  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [list, setList] = useState<EligiblePeserta[]>([]);
  const [loadingPeserta, setLoadingPeserta] = useState(false);
  const [generating, setGenerating] = useState(false);

  const belumTerbit = list.filter(p => !p.sudahTerbit);
  const selectedCount = list.filter(p => p.selected && !p.sudahTerbit).length;

  // Load seminar dan template saat mount
  useEffect(() => {
    (async () => {
      try {
        // Seminar
        const semSnap = await getDocs(collection(db, 'seminar'));
        const semData: SeminarOption[] = semSnap.docs.map(d => ({
          id: d.id,
          title: (d.data() as { title: string }).title,
        }));
        setSeminars(semData);
        if (semData.length > 0) setActiveSeminar(semData[0]);

        // Template
        const tmplSnap = await getDoc(doc(db, 'template_sertifikat', 'default'));
        if (tmplSnap.exists()) setTemplate(tmplSnap.data() as TemplateData);
      } catch (err) {
        console.error('init error:', err);
      }
    })();
  }, []);

  // Load peserta saat seminar berubah
  useEffect(() => {
    if (!activeSeminar) return;
    loadPesertaForSeminar(activeSeminar.id);
  }, [activeSeminar]);

  const loadPesertaForSeminar = async (seminarId: string) => {
    setLoadingPeserta(true);
    setList([]);
    try {
      // Ambil peserta yang sudah disetujui untuk seminar ini
      const regSnap = await getDocs(
        query(
          collection(db, 'pendaftaran'),
          where('seminarId', '==', seminarId),
          where('status', '==', 'disetujui')
        )
      );

      if (regSnap.empty) {
        setList([]);
        setLoadingPeserta(false);
        return;
      }

      // Cek sertifikat yang sudah terbit untuk seminar ini
      const certSnap = await getDocs(
        query(collection(db, 'sertifikat'), where('seminarId', '==', seminarId))
      );
      const terbitPesertaIds = new Set(
        certSnap.docs.map(d => (d.data() as { pesertaId: string }).pesertaId)
      );

      // Ambil absensi untuk hitung kehadiran
      const absenSnap = await getDocs(
        query(
          collection(db, 'absensi'),
          where('seminarId', '==', seminarId),
          where('hadir', '==', true)
        )
      );
      const hadirIds = new Set(
        absenSnap.docs.map(d => (d.data() as { pesertaId: string }).pesertaId)
      );

      // Resolve nama peserta
      const result: EligiblePeserta[] = await Promise.all(
        regSnap.docs.map(async d => {
          const reg = d.data() as { pesertaId: string };
          let nama = 'Peserta';
          let email = '';
          try {
            const userSnap = await getDoc(doc(db, 'users', reg.pesertaId));
            if (userSnap.exists()) {
              const ud = userSnap.data() as { displayName?: string; name?: string; email?: string; nama?: string };
              nama = ud.displayName || ud.name || ud.nama || ud.email || 'Peserta';
              email = ud.email ?? '';
            }
          } catch { /* tidak ada doc user */ }

          return {
            id: reg.pesertaId,
            pendaftaranId: d.id,
            nama,
            email,
            kehadiran: hadirIds.has(reg.pesertaId) ? 100 : 0,
            sudahTerbit: terbitPesertaIds.has(reg.pesertaId),
            selected: false,
          };
        })
      );

      setList(result);
    } catch (err) {
      console.error('loadPeserta error:', err);
      Alert.alert('Error', 'Gagal memuat daftar peserta.');
    } finally {
      setLoadingPeserta(false);
    }
  };

  const toggleSelect = (id: string) => {
    setList(prev =>
      prev.map(item =>
        item.id === id && !item.sudahTerbit ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const selectAll = () => {
    const allSelected = belumTerbit.every(p => p.selected);
    setList(prev =>
      prev.map(item => item.sudahTerbit ? item : { ...item, selected: !allSelected })
    );
  };

  const handleGenerate = async () => {
    if (selectedCount === 0) {
      Alert.alert('Pilih Peserta', 'Pilih minimal satu peserta.');
      return;
    }
    if (!activeSeminar) {
      Alert.alert('Pilih Seminar', 'Pilih seminar terlebih dahulu.');
      return;
    }
    if (!template) {
      Alert.alert(
        'Template Belum Diisi',
        'Isi template sertifikat terlebih dahulu di menu Template Sertifikat.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Ke Template', onPress: () => router.push('/admin/template_sertifikat') },
        ]
      );
      return;
    }

    setGenerating(true);
    const selectedPeserta = list.filter(p => p.selected && !p.sudahTerbit);
    const tanggalTerbit = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const results: { id: string; success: boolean }[] = [];

    for (const peserta of selectedPeserta) {
      try {
        const certNumber = `CE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
        const certRef = await addDoc(collection(db, 'sertifikat'), {
          idSertifikat: certNumber,
          namaPeserta: peserta.nama,
          seminarId: activeSeminar.id,
          seminarTitle: activeSeminar.title,
          penandatangan: template.namaPenandatangan,
          jabatan: template.jabatan,
          signatories: template.signatories || [
            { nama: template.namaPenandatangan, jabatan: template.jabatan, keyTtd: 'tanda_tangan.png' }
          ],
          judulAcara: template.judulAcara,
          tanggalTerbit,
          pesertaId: peserta.id,
          kehadiran: peserta.kehadiran,
          imageUrl: '',
          verifyUrl: '',
          createdAt: new Date().toISOString(),
        });

        const verifyUrl = `${VERIFY_BASE_URL}/${certRef.id}`;
        await updateDoc(doc(db, 'sertifikat', certRef.id), { verifyUrl });

        results.push({ id: peserta.id, success: true });
      } catch (err) {
        console.error(`Gagal generate untuk ${peserta.nama}:`, err);
        results.push({ id: peserta.id, success: false });
      }
    }

    const successIds = results.filter(r => r.success).map(r => r.id);
    setList(prev =>
      prev.map(item =>
        successIds.includes(item.id) ? { ...item, sudahTerbit: true, selected: false } : item
      )
    );
    setGenerating(false);

    const successCount = successIds.length;
    const failCount = results.length - successCount;

    if (failCount === 0) {
      Alert.alert(
        'Berhasil',
        `${successCount} sertifikat berhasil diterbitkan.\n\nPeserta dapat melihat sertifikat di menu Sertifikat.`
      );
    } else {
      Alert.alert('Sebagian Berhasil', `${successCount} berhasil, ${failCount} gagal.`);
    }
  };

  return (
    <AdminScaffold
      title="Generate Sertifikat"
      rightIcon="ribbon-outline"
      onRightPress={() => router.push('/admin/template_sertifikat')}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Template info */}
        {!template ? (
          <TouchableOpacity
            style={styles.templateWarning}
            onPress={() => router.push('/admin/template_sertifikat')}
          >
            <Ionicons name="alert-circle-outline" size={18} color={DesignColors.statusRed} />
            <Text style={styles.templateWarningText}>
              Template belum diisi. Tap untuk mengisi template sertifikat.
            </Text>
            <Ionicons name="chevron-forward" size={16} color={DesignColors.statusRed} />
          </TouchableOpacity>
        ) : (
          <View style={styles.templateInfo}>
            <Ionicons name="checkmark-circle" size={16} color={DesignColors.statusGreen} />
            <Text style={styles.templateInfoText}>
              Template: <Text style={{ fontWeight: '700' }}>{template.judulAcara}</Text> • {template.namaPenandatangan}
            </Text>
            <TouchableOpacity onPress={() => router.push('/admin/template_sertifikat')}>
              <Text style={styles.templateEditText}>Edit</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Seminar selector */}
        {seminars.length === 0 ? (
          <View style={styles.emptyHint}>
            <Ionicons name="calendar-outline" size={20} color={DesignColors.slateGray} />
            <Text style={styles.emptyHintText}>Belum ada seminar. Tambahkan seminar terlebih dahulu.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seminarSelectorRow}>
            {seminars.map(s => {
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
        )}

        {/* Preview */}
        <View style={styles.previewCard}>
          <View style={styles.previewBorderOuter}>
            <View style={styles.previewBorderInner}>
              <Text style={styles.previewLabel}>SERTIFIKAT</Text>
              <Text style={styles.previewName}>Nama Peserta</Text>
              <Text style={styles.previewDesc}>
                {template?.judulAcara ?? activeSeminar?.title ?? '—'}
              </Text>
              {template?.showQr !== false && (
                <View style={styles.previewQrRow}>
                  <QRCode
                    value={`${VERIFY_BASE_URL}/preview`}
                    size={36}
                    color={DesignColors.navyDeep}
                    backgroundColor="transparent"
                  />
                  <Text style={styles.previewQrLabel}>QR verifikasi pada setiap sertifikat</Text>
                </View>
              )}
            </View>
          </View>
          <Text style={styles.previewCaption}>Pratinjau template aktif</Text>
        </View>

        {/* Daftar peserta */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>
            Peserta Disetujui
            {activeSeminar ? ` — ${activeSeminar.title}` : ''}
          </Text>
          {belumTerbit.length > 0 && (
            <TouchableOpacity onPress={selectAll}>
              <Text style={styles.selectAllText}>Pilih Semua</Text>
            </TouchableOpacity>
          )}
        </View>

        {loadingPeserta ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={DesignColors.gold} />
            <Text style={styles.loadingText}>Memuat peserta...</Text>
          </View>
        ) : list.length === 0 ? (
          <View style={styles.emptyPeserta}>
            <Ionicons name="people-outline" size={32} color={DesignColors.slateGray} />
            <Text style={styles.emptyPesertaText}>Belum ada peserta yang disetujui untuk seminar ini.</Text>
            <Text style={styles.emptyPesertaSub}>Setujui pendaftaran peserta di menu Pendaftaran terlebih dahulu.</Text>
          </View>
        ) : (
          list.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.row, item.sudahTerbit && styles.rowDisabled]}
              onPress={() => toggleSelect(item.id)}
              disabled={item.sudahTerbit}
              activeOpacity={0.75}
            >
              <View style={[styles.checkbox, item.selected && styles.checkboxActive]}>
                {item.selected && <Ionicons name="checkmark" size={12} color={DesignColors.navyDeep} />}
              </View>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarInitial}>{item.nama.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.rowInfo}>
                <Text style={styles.nama}>{item.nama}</Text>
                <Text style={styles.emailText} numberOfLines={1}>{item.email || '—'}</Text>
                <Text style={styles.kehadiran}>
                  {item.kehadiran > 0 ? '✓ Sudah absen' : '✗ Belum absen'}
                </Text>
              </View>
              <StatusBadge
                label={item.sudahTerbit ? 'Terbit' : 'Belum'}
                tone={item.sudahTerbit ? 'success' : 'pending'}
              />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <View style={styles.footerBar}>
        <Text style={styles.footerCount}>{selectedCount} dipilih</Text>
        <TouchableOpacity
          style={[styles.generateBtn, (generating || selectedCount === 0) && { opacity: 0.6 }]}
          onPress={handleGenerate}
          disabled={generating || selectedCount === 0}
        >
          {generating ? (
            <ActivityIndicator size="small" color={DesignColors.navyDeep} />
          ) : (
            <Ionicons name="sparkles-outline" size={16} color={DesignColors.navyDeep} />
          )}
          <Text style={styles.generateBtnText}>
            {generating ? 'Memproses...' : 'Terbitkan Sertifikat'}
          </Text>
        </TouchableOpacity>
      </View>
    </AdminScaffold>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 120 },
  templateWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 12,
    marginBottom: 16,
  },
  templateWarningText: { flex: 1, fontSize: 12, color: DesignColors.statusRed },
  templateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EDFDF5',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    padding: 12,
    marginBottom: 16,
  },
  templateInfoText: { flex: 1, fontSize: 11, color: DesignColors.charcoal },
  templateEditText: { fontSize: 11, fontWeight: '700', color: DesignColors.gold },
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
  previewCard: {
    backgroundColor: '#EDEAE2',
    borderRadius: Radius.lg,
    padding: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  previewBorderOuter: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: DesignColors.gold,
    borderRadius: Radius.sm,
    padding: 4,
    backgroundColor: DesignColors.ivoryCard,
  },
  previewBorderInner: {
    borderWidth: 1,
    borderColor: DesignColors.goldSoft,
    borderRadius: 4,
    paddingVertical: 18,
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  previewLabel: { fontSize: 11, fontWeight: '700', color: DesignColors.gold, letterSpacing: 3 },
  previewName: { fontSize: 16, fontWeight: '700', color: DesignColors.navyDeep, marginTop: 8, fontStyle: 'italic' },
  previewDesc: { fontSize: 10, color: DesignColors.slateGray, marginTop: 4, textAlign: 'center' },
  previewQrRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: DesignColors.borderLight, width: '100%' },
  previewQrLabel: { fontSize: 9, color: DesignColors.slateGray, flex: 1 },
  previewCaption: { fontSize: 10, color: DesignColors.slateGray, marginTop: 8 },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionHeaderTitle: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep, flex: 1 },
  selectAllText: { fontSize: 12, fontWeight: '700', color: DesignColors.gold },
  loadingRow: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  loadingText: { fontSize: 12, color: DesignColors.slateGray },
  emptyPeserta: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  emptyPesertaText: { fontSize: 13, color: DesignColors.slateGray, textAlign: 'center', fontWeight: '600' },
  emptyPesertaSub: { fontSize: 11, color: DesignColors.slateGray, textAlign: 'center', paddingHorizontal: 20 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  rowDisabled: { opacity: 0.5 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: DesignColors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: DesignColors.gold, borderColor: DesignColors.gold },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: DesignColors.navyDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { fontSize: 16, fontWeight: '700', color: DesignColors.gold },
  rowInfo: { flex: 1 },
  nama: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep },
  emailText: { fontSize: 10, color: DesignColors.slateGray, marginTop: 1 },
  kehadiran: { fontSize: 10, color: DesignColors.slateGray, marginTop: 2 },
  emptyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 14,
    marginBottom: 16,
  },
  emptyHintText: { fontSize: 12, color: DesignColors.slateGray, flex: 1 },
  footerBar: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DesignColors.ivoryCard,
    borderTopWidth: 1,
    borderTopColor: DesignColors.borderLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  footerCount: { fontSize: 12, color: DesignColors.slateGray, fontWeight: '600' },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: DesignColors.gold,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  generateBtnText: { fontSize: 12, fontWeight: '700', color: DesignColors.navyDeep },
});
