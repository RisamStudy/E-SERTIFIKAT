import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PesertaScaffold } from '../../components/peserta/pesertachrome';
import { EmptyState } from '../../components/ui/emptystate';
import { auth, db } from '../../config/firebase';
import { DesignColors, Radius } from '../../constants/theme';

interface Sertifikat {
  id: string;
  seminarTitle: string;
  tanggalTerbit: string;
  idSertifikat: string;
  imageUrl?: string;
  verifyUrl?: string;
}

export default function PesertaSertifikatScreen() {
  const router = useRouter();
  const [data, setData] = useState<Sertifikat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSertifikat();
  }, []);

  const loadSertifikat = async () => {
    setLoading(true);
    try {
      const uid = auth.currentUser?.uid;
      // Query sertifikat milik peserta ini
      // Jika belum ada auth uid match, ambil semua untuk demo
      const q = uid
        ? query(collection(db, 'sertifikat'), where('pesertaId', '==', uid))
        : query(collection(db, 'sertifikat'));

      const snap = await getDocs(q);
      const result: Sertifikat[] = snap.docs.map((d) => ({
        id: d.id,
        seminarTitle: (d.data() as { seminarTitle: string }).seminarTitle,
        tanggalTerbit: (d.data() as { tanggalTerbit: string }).tanggalTerbit,
        idSertifikat: (d.data() as { idSertifikat: string }).idSertifikat,
        imageUrl: (d.data() as { imageUrl?: string }).imageUrl,
        verifyUrl: (d.data() as { verifyUrl?: string }).verifyUrl,
      }));
      setData(result);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PesertaScaffold title="Sertifikat Saya">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Ionicons name="ribbon" size={26} color={DesignColors.gold} />
          <Text style={styles.summaryValue}>{loading ? '-' : data.length}</Text>
          <Text style={styles.summaryLabel}>Sertifikat Diterima</Text>
        </View>

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={DesignColors.gold} />
            <Text style={styles.loadingText}>Memuat sertifikat...</Text>
          </View>
        ) : data.length === 0 ? (
          <EmptyState
            icon="ribbon-outline"
            title="Belum ada sertifikat"
            message="Ikuti dan selesaikan seminar untuk mendapatkan sertifikat digital."
          />
        ) : (
          data.map((cert) => (
            <TouchableOpacity
              key={cert.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() =>
                router.push({ pathname: '/peserta/download_sertifikat', params: { id: cert.id } })
              }
            >
              <View style={styles.thumb}>
                <View style={styles.thumbBorder}>
                  <Ionicons name="ribbon-outline" size={20} color={DesignColors.gold} />
                </View>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.title} numberOfLines={2}>{cert.seminarTitle}</Text>
                <Text style={styles.meta}>Terbit {cert.tanggalTerbit}</Text>
                <Text style={styles.certId}>{cert.idSertifikat}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={DesignColors.slateGray} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </PesertaScaffold>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 32 },
  summaryCard: {
    backgroundColor: DesignColors.navyDeep,
    borderRadius: Radius.lg,
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
  },
  summaryValue: { fontSize: 26, fontWeight: '800', color: DesignColors.offWhite, marginTop: 8 },
  summaryLabel: { fontSize: 11, color: DesignColors.goldSoft, marginTop: 2 },
  loadingWrap: { alignItems: 'center', paddingVertical: 40 },
  loadingText: { marginTop: 12, fontSize: 12, color: DesignColors.slateGray },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: Radius.sm,
    backgroundColor: '#EDEAE2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbBorder: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: DesignColors.goldSoft,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep, lineHeight: 18 },
  meta: { fontSize: 11, color: DesignColors.slateGray, marginTop: 4 },
  certId: { fontSize: 10, color: DesignColors.slateGray, marginTop: 2 },
});
