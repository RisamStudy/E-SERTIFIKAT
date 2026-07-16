import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { PesertaScaffold } from '../../components/peserta/pesertachrome';
import { EmptyState } from '../../components/ui/emptystate';
import { StatusBadge } from '../../components/ui/statusbadge';
import { DesignColors, Radius } from '../../constants/theme';

interface SeminarSaya {
  id: string;
  title: string;
  image: string;
  tanggal: string;
  status: 'akan_datang' | 'berlangsung' | 'selesai';
}

const TABS = ['Akan Datang', 'Selesai'] as const;

const data: SeminarSaya[] = [
  {
    id: '1',
    title: 'Seminar Nasional Cyber Security 2024',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    tanggal: '24 Jul 2024 • 09:00 WIB',
    status: 'akan_datang',
  },
  {
    id: '2',
    title: 'Konferensi Rekayasa Perangkat Lunak',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    tanggal: '14 Mei 2024 • 08:30 WIB',
    status: 'selesai',
  },
  {
    id: '3',
    title: 'Pelatihan Dasar Data Science',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    tanggal: '02 Mar 2024 • 09:00 WIB',
    status: 'selesai',
  },
];

export default function PesertaSeminarSayaScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Akan Datang');

  const filtered = data.filter((item) =>
    activeTab === 'Akan Datang' ? item.status !== 'selesai' : item.status === 'selesai'
  );

  return (
    <PesertaScaffold title="Seminar Saya">
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = tab === activeTab;
          return (
            <TouchableOpacity key={tab} style={[styles.tabBtn, active && styles.tabBtnActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <EmptyState icon="calendar-outline" title="Belum ada seminar" message="Daftar seminar baru lewat menu Daftar Seminar." />
        ) : (
          filtered.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image source={{ uri: item.image }} style={styles.cardImage} />
              <View style={styles.cardInfo}>
                <StatusBadge
                  label={item.status === 'selesai' ? 'Selesai' : item.status === 'berlangsung' ? 'Berlangsung' : 'Akan Datang'}
                  tone={item.status === 'selesai' ? 'success' : item.status === 'berlangsung' ? 'info' : 'pending'}
                />
                <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                <View style={styles.detailRow}>
                  <Ionicons name="calendar-outline" size={12} color={DesignColors.slateGray} />
                  <Text style={styles.detailText}>{item.tanggal}</Text>
                </View>

                {item.status !== 'selesai' ? (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/peserta/absensi')}>
                    <Ionicons name="qr-code-outline" size={14} color={DesignColors.navyDeep} />
                    <Text style={styles.actionBtnText}>Lakukan Absensi</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]} onPress={() => router.push('/peserta/sertifikat')}>
                    <Ionicons name="ribbon-outline" size={14} color={DesignColors.gold} />
                    <Text style={[styles.actionBtnText, { color: DesignColors.gold }]}>Lihat Sertifikat</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </PesertaScaffold>
  );
}

const styles = StyleSheet.create({
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
  cardImage: { width: 96, height: '100%', minHeight: 130 },
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
    marginTop: 8,
  },
  actionBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: DesignColors.gold },
  actionBtnText: { fontSize: 11, fontWeight: '700', color: DesignColors.navyDeep },
});