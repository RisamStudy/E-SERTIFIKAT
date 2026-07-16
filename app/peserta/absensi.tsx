import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PesertaScaffold } from '../../components/peserta/pesertachrome';
import { DesignColors, Radius } from '../../constants/theme';

export default function PesertaAbsensiScreen() {
  const router = useRouter();
  const [kode, setKode] = useState('');
  const [status, setStatus] = useState<'belum' | 'hadir'>('belum');
  const [waktu, setWaktu] = useState<string | null>(null);

  const handleSubmit = () => {
    if (kode.trim().length < 4) {
      Alert.alert('Kode Tidak Valid', 'Masukkan kode absensi yang diberikan panitia di lokasi seminar.');
      return;
    }
    setStatus('hadir');
    setWaktu(new Date().toTimeString().slice(0, 5));
  };

  return (
    <PesertaScaffold title="Absensi Seminar" onBack={() => router.back()}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.seminarCard}>
          <Text style={styles.seminarLabel}>SEMINAR AKTIF</Text>
          <Text style={styles.seminarTitle}>Seminar Nasional Cyber Security 2024</Text>
          <Text style={styles.seminarDate}>24 Jul 2024 • 09:00 WIB</Text>
        </View>

        {status === 'hadir' ? (
          <View style={styles.successCard}>
            <View style={styles.successIconWrap}>
              <Ionicons name="checkmark-circle" size={40} color={DesignColors.statusGreen} />
            </View>
            <Text style={styles.successTitle}>Absensi Berhasil</Text>
            <Text style={styles.successDesc}>Anda tercatat hadir pada pukul {waktu} WIB. Sertifikat akan tersedia setelah seminar berakhir.</Text>
          </View>
        ) : (
          <>
            <View style={styles.qrPlaceholder}>
              <Ionicons name="qr-code-outline" size={64} color={DesignColors.navyDeep} />
              <Text style={styles.qrHint}>Arahkan kamera ke QR yang ditampilkan panitia</Text>
            </View>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ATAU MASUKKAN KODE MANUAL</Text>
              <View style={styles.dividerLine} />
            </View>

            <TextInput
              style={styles.codeInput}
              placeholder="Contoh: CYB-2024"
              placeholderTextColor={DesignColors.slateGray}
              value={kode}
              onChangeText={setKode}
              autoCapitalize="characters"
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Konfirmasi Kehadiran</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </PesertaScaffold>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 32 },
  seminarCard: {
    backgroundColor: DesignColors.navyDeep,
    borderRadius: Radius.lg,
    padding: 18,
    marginBottom: 24,
  },
  seminarLabel: { fontSize: 10, fontWeight: '700', color: DesignColors.gold, letterSpacing: 1, marginBottom: 6 },
  seminarTitle: { fontSize: 15, fontWeight: '700', color: DesignColors.offWhite, marginBottom: 4 },
  seminarDate: { fontSize: 12, color: DesignColors.goldSoft },
  qrPlaceholder: {
    backgroundColor: DesignColors.ivoryCard,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    marginBottom: 20,
  },
  qrHint: { fontSize: 11, color: DesignColors.slateGray, marginTop: 14, textAlign: 'center', paddingHorizontal: 40 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
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
    marginBottom: 20,
  },
  submitBtn: { backgroundColor: DesignColors.gold, borderRadius: Radius.md, paddingVertical: 15, alignItems: 'center' },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: DesignColors.navyDeep },
  successCard: {
    backgroundColor: DesignColors.ivoryCard,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    borderRadius: Radius.xl,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  successIconWrap: { marginBottom: 16 },
  successTitle: { fontSize: 16, fontWeight: '700', color: DesignColors.navyDeep, marginBottom: 8 },
  successDesc: { fontSize: 12, color: DesignColors.slateGray, textAlign: 'center', lineHeight: 18 },
});