import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import {
    addDoc,
    collection,
    getDocs,
    query,
    where,
} from 'firebase/firestore';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { PesertaScaffold } from '../../components/peserta/pesertachrome';
import { auth, db } from '../../config/firebase';
import { DesignColors, Radius } from '../../constants/theme';

type AbsenStatus = 'idle' | 'scanning' | 'loading' | 'sukses' | 'error';

export default function PesertaAbsensiScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [status, setStatus] = useState<AbsenStatus>('idle');
  const [kodeManual, setKodeManual] = useState('');
  const [waktuAbsen, setWaktuAbsen] = useState('');
  const [pesanError, setPesanError] = useState('');
  const [seminarNama, setSeminarNama] = useState('');
  const isProcessing = useRef(false); // cegah scan ganda

  useEffect(() => {
    return () => { isProcessing.current = false; };
  }, []);

  /**
   * Validasi kode absensi dan catat kehadiran ke Firestore.
   * Format kode: ABSEN-{seminarId}
   */
  const prosesAbsensi = async (kode: string) => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    setStatus('loading');

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setPesanError('Anda harus login untuk absen.');
        setStatus('error');
        isProcessing.current = false;
        return;
      }

      // Validasi format kode
      if (!kode.startsWith('ABSEN-')) {
        setPesanError('Kode tidak valid. Pastikan Anda scan QR absensi yang benar.');
        setStatus('error');
        isProcessing.current = false;
        return;
      }

      const seminarId = kode.replace('ABSEN-', '').trim();

      // Cek seminar ada dan aktif
      const semSnap = await getDocs(
        query(collection(db, 'seminar'), where('__name__', '==', seminarId))
      );
      if (semSnap.empty) {
        setPesanError('Seminar tidak ditemukan.');
        setStatus('error');
        isProcessing.current = false;
        return;
      }
      const semData = semSnap.docs[0].data() as { title: string; status: string };
      if (semData.status !== 'aktif') {
        setPesanError('Seminar ini sudah tidak aktif.');
        setStatus('error');
        isProcessing.current = false;
        return;
      }
      setSeminarNama(semData.title);

      // Cek apakah sudah absen sebelumnya
      const existSnap = await getDocs(
        query(
          collection(db, 'absensi'),
          where('seminarId', '==', seminarId),
          where('pesertaId', '==', uid)
        )
      );
      if (!existSnap.empty) {
        const waktuSebelumnya = (existSnap.docs[0].data() as { waktuAbsen: string }).waktuAbsen;
        setWaktuAbsen(waktuSebelumnya);
        setSeminarNama(semData.title);
        setStatus('sukses');
        isProcessing.current = false;
        return;
      }

      // Catat absensi baru
      const waktu = new Date().toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      });

      await addDoc(collection(db, 'absensi'), {
        seminarId,
        pesertaId: uid,
        kodeAbsensi: kode,
        waktuAbsen: waktu,
        hadir: true,
        createdAt: new Date().toISOString(),
      });

      setWaktuAbsen(waktu);
      setStatus('sukses');
    } catch (err) {
      console.error('absensi error:', err);
      setPesanError('Terjadi kesalahan. Coba lagi.');
      setStatus('error');
    } finally {
      isProcessing.current = false;
    }
  };

  const handleScanResult = ({ data }: { data: string }) => {
    if (status === 'loading' || status === 'sukses') return;
    setStatus('scanning'); // stop kamera setelah scan
    prosesAbsensi(data);
  };

  const handleManualSubmit = () => {
    const kode = kodeManual.trim().toUpperCase();
    if (kode.length < 6) {
      Alert.alert('Kode Tidak Valid', 'Masukkan kode absensi yang benar.');
      return;
    }
    prosesAbsensi(kode);
  };

  const handleReset = () => {
    setStatus('idle');
    setKodeManual('');
    setPesanError('');
    setSeminarNama('');
    setWaktuAbsen('');
    isProcessing.current = false;
  };

  return (
    <PesertaScaffold title="Absensi Seminar" onBack={() => router.back()}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ── Sukses ── */}
        {status === 'sukses' && (
          <View style={styles.resultCard}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark-circle" size={64} color={DesignColors.statusGreen} />
            </View>
            <Text style={styles.resultTitle}>Absensi Berhasil!</Text>
            <Text style={styles.resultSeminar}>{seminarNama}</Text>
            <Text style={styles.resultDesc}>
              Anda tercatat hadir pada pukul{' '}
              <Text style={{ fontWeight: '700' }}>{waktuAbsen} WIB</Text>.{'\n'}
              Sertifikat akan tersedia setelah seminar berakhir.
            </Text>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Absen Seminar Lain</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Error ── */}
        {status === 'error' && (
          <View style={styles.resultCard}>
            <View style={styles.errorIconWrap}>
              <Ionicons name="close-circle" size={64} color={DesignColors.statusRed} />
            </View>
            <Text style={[styles.resultTitle, { color: DesignColors.statusRed }]}>Absensi Gagal</Text>
            <Text style={styles.resultDesc}>{pesanError}</Text>
            <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Loading ── */}
        {status === 'loading' && (
          <View style={styles.resultCard}>
            <ActivityIndicator size="large" color={DesignColors.gold} />
            <Text style={[styles.resultDesc, { marginTop: 16 }]}>Memverifikasi absensi...</Text>
          </View>
        )}

        {/* ── Idle / Scanning ── */}
        {(status === 'idle' || status === 'scanning') && (
          <>
            {/* Scan QR */}
            <Text style={styles.sectionTitle}>Scan QR Code</Text>
            <Text style={styles.sectionDesc}>
              Arahkan kamera ke QR code yang ditampilkan panitia di lokasi seminar.
            </Text>

            {!permission ? (
              <View style={styles.cameraPlaceholder}>
                <ActivityIndicator color={DesignColors.gold} />
              </View>
            ) : !permission.granted ? (
              <View style={styles.cameraPlaceholder}>
                <Ionicons name="camera-outline" size={40} color={DesignColors.slateGray} />
                <Text style={styles.cameraPermText}>Izin kamera diperlukan untuk scan QR</Text>
                <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                  <Text style={styles.permBtnText}>Izinkan Akses Kamera</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.cameraWrap}>
                <CameraView
                  style={styles.camera}
                  facing="back"
                  barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                  onBarcodeScanned={status === 'idle' ? handleScanResult : undefined}
                />
                {/* Viewfinder overlay */}
                <View style={styles.viewfinderOverlay} pointerEvents="none">
                  <View style={styles.viewfinderBox}>
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />
                  </View>
                  <Text style={styles.viewfinderHint}>Posisikan QR di dalam kotak</Text>
                </View>
              </View>
            )}

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ATAU MASUKKAN KODE MANUAL</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Input manual */}
            <TextInput
              style={styles.codeInput}
              placeholder="Contoh: ABSEN-abc123"
              placeholderTextColor={DesignColors.slateGray}
              value={kodeManual}
              onChangeText={setKodeManual}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.submitBtn} onPress={handleManualSubmit}>
              <Text style={styles.submitBtnText}>Konfirmasi Kehadiran</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </PesertaScaffold>
  );
}

const CORNER_SIZE = 22;
const CORNER_THICKNESS = 3;

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 32 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: DesignColors.navyDeep, marginBottom: 6 },
  sectionDesc: { fontSize: 12, color: DesignColors.slateGray, marginBottom: 16, lineHeight: 17 },
  cameraWrap: { borderRadius: Radius.lg, overflow: 'hidden', height: 280, marginBottom: 24, position: 'relative' },
  camera: { flex: 1 },
  viewfinderOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewfinderBox: {
    width: 180,
    height: 180,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: DesignColors.gold,
  },
  cornerTL: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  cornerTR: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  viewfinderHint: {
    color: '#FFF',
    fontSize: 11,
    marginTop: 12,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cameraPlaceholder: {
    height: 220,
    backgroundColor: DesignColors.ivoryCard,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  cameraPermText: { fontSize: 12, color: DesignColors.slateGray, textAlign: 'center', paddingHorizontal: 32 },
  permBtn: {
    backgroundColor: DesignColors.gold,
    borderRadius: Radius.md,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  permBtnText: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: DesignColors.borderLight },
  dividerText: { fontSize: 9, fontWeight: '700', color: DesignColors.slateGray, letterSpacing: 0.5 },
  codeInput: {
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 2,
    textAlign: 'center',
    color: DesignColors.navyDeep,
    backgroundColor: DesignColors.ivoryCard,
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: DesignColors.gold,
    borderRadius: Radius.md,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: DesignColors.navyDeep },
  resultCard: {
    backgroundColor: DesignColors.ivoryCard,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    borderRadius: Radius.xl,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  successIconWrap: { marginBottom: 16 },
  errorIconWrap: { marginBottom: 16 },
  resultTitle: { fontSize: 20, fontWeight: '800', color: DesignColors.navyDeep, marginBottom: 6 },
  resultSeminar: { fontSize: 13, color: DesignColors.charcoal, fontWeight: '600', textAlign: 'center', marginBottom: 10 },
  resultDesc: { fontSize: 13, color: DesignColors.slateGray, textAlign: 'center', lineHeight: 20 },
  resetBtn: {
    marginTop: 24,
    backgroundColor: DesignColors.navyDeep,
    borderRadius: Radius.md,
    paddingHorizontal: 28,
    paddingVertical: 12,
  },
  resetBtnText: { fontSize: 13, fontWeight: '700', color: DesignColors.gold },
});
