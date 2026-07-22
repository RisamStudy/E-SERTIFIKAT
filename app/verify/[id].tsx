/**
 * Halaman verifikasi sertifikat publik.
 * Bisa diakses via browser dari QR code: /verify/{sertifikatId}
 * Fetch data dari Firestore collection "sertifikat".
 */
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { collection, doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { db } from '../../config/firebase';
import { DesignColors, Radius } from '../../constants/theme';

interface SertifikatData {
  namaPeserta: string;
  seminarTitle: string;
  tanggalTerbit: string;
  idSertifikat: string;
  penandatangan: string;
  jabatan: string;
  imageUrl?: string;
  seminarDate?: string;
}

export default function VerifySertifikatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<SertifikatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const ref = doc(collection(db, 'sertifikat'), id as string);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setData(snap.data() as SertifikatData);
        } else {
          setNotFound(true);
        }
      } catch (e) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={DesignColors.gold} />
        <Text style={styles.loadingText}>Memverifikasi sertifikat...</Text>
      </View>
    );
  }

  if (notFound || !data) {
    return (
      <View style={styles.center}>
        <Ionicons name="shield-outline" size={48} color={DesignColors.statusRed} />
        <Text style={styles.notFoundTitle}>Sertifikat Tidak Ditemukan</Text>
        <Text style={styles.notFoundDesc}>
          ID sertifikat tidak valid atau sertifikat ini belum diterbitkan.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header verifikasi */}
      <View style={styles.verifiedHeader}>
        <Ionicons name="shield-checkmark" size={32} color={DesignColors.statusGreen} />
        <Text style={styles.verifiedTitle}>Sertifikat Terverifikasi</Text>
        <Text style={styles.verifiedSubtitle}>
          Dokumen ini adalah sertifikat resmi yang diterbitkan melalui sistem E-Sertifikat.
        </Text>
      </View>

      {/* Preview sertifikat — atau gambar jika tersedia */}
      {data.imageUrl ? (
        <Image source={{ uri: data.imageUrl }} style={styles.certImage} resizeMode="contain" />
      ) : (
        <View style={styles.previewWrap}>
          <View style={styles.certOuterBorder}>
            <View style={styles.certInnerBorder}>
              <View style={styles.certLogoCircle}>
                <Ionicons name="ribbon" size={22} color={DesignColors.gold} />
              </View>
              <Text style={styles.certKicker}>E-SERTIFIKAT ACADEMIC PORTAL</Text>
              <Text style={styles.certTitle}>SERTIFIKAT</Text>
              <Text style={styles.certGiven}>Dengan bangga diberikan kepada</Text>
              <Text style={styles.certName}>{data.namaPeserta}</Text>
              <Text style={styles.certBody}>
                atas partisipasi dan kelulusannya dalam kegiatan{'\n'}
                <Text style={styles.certBodyBold}>{data.seminarTitle}</Text>
              </Text>
              <View style={styles.certFooterRow}>
                <View style={styles.certSignBlock}>
                  <View style={styles.certSignLine} />
                  <Text style={styles.certSignName}>{data.penandatangan}</Text>
                  <Text style={styles.certSignRole}>{data.jabatan}</Text>
                </View>
                <View style={styles.certStampCircle}>
                  <Text style={styles.certStampText}>OFFICIAL{'\n'}SEAL</Text>
                </View>
              </View>
              <View style={styles.certIdRow}>
                <Ionicons name="qr-code-outline" size={14} color={DesignColors.slateGray} />
                <Text style={styles.certIdText}>{data.idSertifikat}</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Detail info */}
      <View style={styles.infoCard}>
        <InfoRow label="ID Sertifikat" value={data.idSertifikat} />
        <InfoRow label="Nama Peserta" value={data.namaPeserta} />
        <InfoRow label="Seminar" value={data.seminarTitle} />
        <InfoRow label="Tanggal Terbit" value={data.tanggalTerbit} last />
      </View>

      <Text style={styles.footerNote}>
        Halaman ini dihasilkan secara otomatis oleh sistem E-Sertifikat.
        Dokumen ini sah secara digital dan tidak memerlukan tanda tangan basah.
      </Text>
    </ScrollView>
  );
}

function InfoRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.infoRow, last && { borderBottomWidth: 0 }]}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: DesignColors.offWhite },
  scrollContent: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: DesignColors.offWhite },
  loadingText: { marginTop: 12, fontSize: 13, color: DesignColors.slateGray },
  notFoundTitle: { fontSize: 18, fontWeight: '700', color: DesignColors.navyDeep, marginTop: 16, textAlign: 'center' },
  notFoundDesc: { fontSize: 12, color: DesignColors.slateGray, marginTop: 8, textAlign: 'center', lineHeight: 18 },
  verifiedHeader: {
    alignItems: 'center',
    backgroundColor: DesignColors.navyDeep,
    borderRadius: Radius.lg,
    padding: 24,
    marginBottom: 20,
  },
  verifiedTitle: { fontSize: 16, fontWeight: '800', color: DesignColors.offWhite, marginTop: 10 },
  verifiedSubtitle: { fontSize: 11, color: DesignColors.goldSoft, marginTop: 6, textAlign: 'center', lineHeight: 16 },
  certImage: { width: '100%', height: 240, borderRadius: Radius.lg, marginBottom: 20 },
  previewWrap: { backgroundColor: '#EDEAE2', borderRadius: Radius.lg, padding: 14, marginBottom: 20 },
  certOuterBorder: { borderWidth: 1.5, borderColor: DesignColors.gold, borderRadius: Radius.sm, padding: 5, backgroundColor: DesignColors.ivoryCard },
  certInnerBorder: { borderWidth: 1, borderColor: DesignColors.goldSoft, borderRadius: 4, paddingVertical: 24, paddingHorizontal: 18, alignItems: 'center' },
  certLogoCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: DesignColors.goldSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  certKicker: { fontSize: 8, fontWeight: '700', color: DesignColors.slateGray, letterSpacing: 1.5 },
  certTitle: { fontSize: 20, fontWeight: '800', color: DesignColors.navyDeep, letterSpacing: 4, marginTop: 8 },
  certGiven: { fontSize: 10, color: DesignColors.slateGray, marginTop: 12 },
  certName: { fontSize: 20, fontWeight: '700', fontStyle: 'italic', color: DesignColors.navyDeep, marginTop: 6 },
  certBody: { fontSize: 10, color: DesignColors.charcoal, textAlign: 'center', marginTop: 12, lineHeight: 16 },
  certBodyBold: { fontWeight: '700', color: DesignColors.navyDeep },
  certFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginTop: 24 },
  certSignBlock: { alignItems: 'center', flex: 1 },
  certSignLine: { width: 90, height: 1, backgroundColor: DesignColors.slateGray, marginBottom: 6 },
  certSignName: { fontSize: 9, fontWeight: '700', color: DesignColors.navyDeep, textAlign: 'center' },
  certSignRole: { fontSize: 8, color: DesignColors.slateGray, marginTop: 2, textAlign: 'center' },
  certStampCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 1, borderColor: DesignColors.statusRed, alignItems: 'center', justifyContent: 'center', opacity: 0.55 },
  certStampText: { fontSize: 6, fontWeight: '700', color: DesignColors.statusRed, textAlign: 'center' },
  certIdRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 18 },
  certIdText: { fontSize: 8, color: DesignColors.slateGray },
  infoCard: { backgroundColor: DesignColors.ivoryCard, borderRadius: Radius.lg, borderWidth: 1, borderColor: DesignColors.borderLight, paddingHorizontal: 16, marginBottom: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: DesignColors.borderLight },
  infoLabel: { fontSize: 12, color: DesignColors.slateGray },
  infoValue: { fontSize: 12, fontWeight: '700', color: DesignColors.navyDeep, flex: 1, textAlign: 'right', marginLeft: 8 },
  footerNote: { fontSize: 10, color: DesignColors.slateGray, textAlign: 'center', lineHeight: 15 },
});
