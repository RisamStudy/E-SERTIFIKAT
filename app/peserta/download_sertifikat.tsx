import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PesertaScaffold } from '../../components/peserta/pesertachrome';
import { DesignColors, Radius } from '../../constants/theme';

export default function PesertaDownloadSertifikatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const [downloading, setDownloading] = useState(false);

  // Mock lookup — in production this comes from Firestore keyed by params.id
  const cert = {
    namaPeserta: 'Rangga Aditya',
    seminarTitle: 'Konferensi Rekayasa Perangkat Lunak',
    tanggalTerbit: '15 Mei 2024',
    idSertifikat: params.id ? `CE-2024-0001${params.id}` : 'CE-2024-000188',
    penandatangan: 'Dr. Ir. Taufik Hidayat, M.Kom.',
    jabatan: 'Ketua Panitia Seminar',
  };

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      Alert.alert('Berhasil Diunduh', 'Sertifikat telah disimpan ke perangkat Anda.');
    }, 900);
  };

  const handleShare = () => {
    Alert.alert('Bagikan Sertifikat', 'Tautan verifikasi sertifikat siap dibagikan ke LinkedIn atau media sosial lainnya.');
  };

  return (
    <PesertaScaffold title="Detail Sertifikat" onBack={() => router.back()}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.previewWrap}>
          <View style={styles.certOuterBorder}>
            <View style={styles.certInnerBorder}>
              <View style={styles.certLogoCircle}>
                <Ionicons name="ribbon" size={22} color={DesignColors.gold} />
              </View>
              <Text style={styles.certKicker}>CERTIFYELITE ACADEMIC PORTAL</Text>
              <Text style={styles.certTitle}>SERTIFIKAT</Text>
              <Text style={styles.certGiven}>Dengan bangga diberikan kepada</Text>
              <Text style={styles.certName}>{cert.namaPeserta}</Text>
              <Text style={styles.certBody}>
                atas partisipasi dan kelulusannya dalam kegiatan{'\n'}
                <Text style={styles.certBodyBold}>{cert.seminarTitle}</Text>
              </Text>

              <View style={styles.certFooterRow}>
                <View style={styles.certSignBlock}>
                  <View style={styles.certSignLine} />
                  <Text style={styles.certSignName}>{cert.penandatangan}</Text>
                  <Text style={styles.certSignRole}>{cert.jabatan}</Text>
                </View>
                <View style={styles.certStampCircle}>
                  <Text style={styles.certStampText}>STEMPEL</Text>
                </View>
              </View>

              <View style={styles.certQrRow}>
                <View style={styles.certQrBox}>
                  <Ionicons name="qr-code-outline" size={16} color={DesignColors.slateGray} />
                </View>
                <Text style={styles.certIdText}>{cert.idSertifikat} • Terbit {cert.tanggalTerbit}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>ID Sertifikat</Text>
            <Text style={styles.infoValue}>{cert.idSertifikat}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tanggal Terbit</Text>
            <Text style={styles.infoValue}>{cert.tanggalTerbit}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.infoLabel}>Status Verifikasi</Text>
            <View style={styles.verifiedTag}>
              <Ionicons name="shield-checkmark" size={12} color={DesignColors.statusGreen} />
              <Text style={styles.verifiedText}>Terverifikasi</Text>
            </View>
          </View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={16} color={DesignColors.navyDeep} />
            <Text style={styles.shareBtnText}>Bagikan</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.downloadBtn, downloading && { opacity: 0.7 }]} onPress={handleDownload} disabled={downloading}>
            <Ionicons name="download-outline" size={16} color={DesignColors.navyDeep} />
            <Text style={styles.downloadBtnText}>{downloading ? 'Mengunduh...' : 'Unduh PDF'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </PesertaScaffold>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 32 },
  previewWrap: { backgroundColor: '#EDEAE2', borderRadius: Radius.lg, padding: 14, marginBottom: 20 },
  certOuterBorder: { borderWidth: 1.5, borderColor: DesignColors.gold, borderRadius: Radius.sm, padding: 5, backgroundColor: DesignColors.ivoryCard },
  certInnerBorder: { borderWidth: 1, borderColor: DesignColors.goldSoft, borderRadius: 4, paddingVertical: 24, paddingHorizontal: 18, alignItems: 'center' },
  certLogoCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: DesignColors.goldSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  certKicker: { fontSize: 8, fontWeight: '700', color: DesignColors.slateGray, letterSpacing: 1.5 },
  certTitle: { fontSize: 20, fontWeight: '800', color: DesignColors.navyDeep, letterSpacing: 4, marginTop: 8 },
  certGiven: { fontSize: 10, color: DesignColors.slateGray, marginTop: 12 },
  certName: { fontSize: 22, fontWeight: '700', fontStyle: 'italic', color: DesignColors.navyDeep, marginTop: 6 },
  certBody: { fontSize: 10, color: DesignColors.charcoal, textAlign: 'center', marginTop: 12, lineHeight: 16 },
  certBodyBold: { fontWeight: '700', color: DesignColors.navyDeep },
  certFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginTop: 26 },
  certSignBlock: { alignItems: 'center', flex: 1 },
  certSignLine: { width: 90, height: 1, backgroundColor: DesignColors.slateGray, marginBottom: 6 },
  certSignName: { fontSize: 9, fontWeight: '700', color: DesignColors.navyDeep, textAlign: 'center' },
  certSignRole: { fontSize: 8, color: DesignColors.slateGray, marginTop: 2, textAlign: 'center' },
  certStampCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: DesignColors.statusRed, alignItems: 'center', justifyContent: 'center', opacity: 0.55 },
  certStampText: { fontSize: 6, fontWeight: '700', color: DesignColors.statusRed, textAlign: 'center' },
  certQrRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 },
  certQrBox: { width: 24, height: 24, borderWidth: 1, borderColor: DesignColors.borderLight, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  certIdText: { fontSize: 8, color: DesignColors.slateGray },
  infoCard: {
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: DesignColors.borderLight },
  infoLabel: { fontSize: 12, color: DesignColors.slateGray },
  infoValue: { fontSize: 12, fontWeight: '700', color: DesignColors.navyDeep },
  verifiedTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 11, fontWeight: '700', color: DesignColors.statusGreen },
  actionRow: { flexDirection: 'row', gap: 12 },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: DesignColors.gold,
    borderRadius: Radius.md,
    paddingVertical: 13,
  },
  shareBtnText: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: DesignColors.gold,
    borderRadius: Radius.md,
    paddingVertical: 13,
  },
  downloadBtnText: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep },
});