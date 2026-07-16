import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PesertaScaffold } from '../../components/peserta/pesertachrome';
import { EmptyState } from '../../components/ui/emptystate';
import { DesignColors, Radius } from '../../constants/theme';

interface Sertifikat {
  id: string;
  seminarTitle: string;
  tanggalTerbit: string;
  idSertifikat: string;
}

const data: Sertifikat[] = [
  { id: '1', seminarTitle: 'Konferensi Rekayasa Perangkat Lunak', tanggalTerbit: '15 Mei 2024', idSertifikat: 'CE-2024-000188' },
  { id: '2', seminarTitle: 'Pelatihan Dasar Data Science', tanggalTerbit: '03 Mar 2024', idSertifikat: 'CE-2024-000042' },
];

export default function PesertaSertifikatScreen() {
  const router = useRouter();

  return (
    <PesertaScaffold title="Sertifikat Saya">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <Ionicons name="ribbon" size={26} color={DesignColors.gold} />
          <Text style={styles.summaryValue}>{data.length}</Text>
          <Text style={styles.summaryLabel}>Sertifikat Diterima</Text>
        </View>

        {data.length === 0 ? (
          <EmptyState icon="ribbon-outline" title="Belum ada sertifikat" message="Ikuti dan selesaikan seminar untuk mendapatkan sertifikat digital." />
        ) : (
          data.map((cert) => (
            <TouchableOpacity
              key={cert.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => router.push({ pathname: '/peserta/download_sertifikat', params: { id: cert.id } })}
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
  thumb: { width: 52, height: 52, borderRadius: Radius.sm, backgroundColor: '#EDEAE2', alignItems: 'center', justifyContent: 'center' },
  thumbBorder: { width: 40, height: 40, borderWidth: 1, borderColor: DesignColors.goldSoft, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  cardInfo: { flex: 1 },
  title: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep, lineHeight: 18 },
  meta: { fontSize: 11, color: DesignColors.slateGray, marginTop: 4 },
  certId: { fontSize: 10, color: DesignColors.slateGray, marginTop: 2 },
});