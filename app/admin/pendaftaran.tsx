import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminScaffold } from '../../components/admin/adminchrome';
import { EmptyState } from '../../components/ui/emptystate';
import { StatusBadge } from '../../components/ui/statusbadge';
import { DesignColors, Radius } from '../../constants/theme';

interface Pendaftaran {
  id: string;
  nama: string;
  avatar: string;
  seminar: string;
  tanggalDaftar: string;
  status: 'menunggu' | 'disetujui' | 'ditolak';
}

const TABS = ['Menunggu', 'Disetujui', 'Ditolak'] as const;

const initialData: Pendaftaran[] = [
  { id: '1', nama: 'Fajar Nugroho', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80', seminar: 'Seminar Nasional Cyber Security 2024', tanggalDaftar: '12 Jul 2024', status: 'menunggu' },
  { id: '2', nama: 'Citra Ayu Lestari', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80', seminar: 'Workshop UI/UX Professional Design', tanggalDaftar: '13 Jul 2024', status: 'menunggu' },
  { id: '3', nama: 'Bayu Setiawan', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', seminar: 'Seminar Nasional Cyber Security 2024', tanggalDaftar: '10 Jul 2024', status: 'disetujui' },
  { id: '4', nama: 'Winda Kusuma', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', seminar: 'Konferensi Rekayasa Perangkat Lunak', tanggalDaftar: '08 Jul 2024', status: 'ditolak' },
];

export default function AdminPendaftaranScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Menunggu');
  const [list, setList] = useState<Pendaftaran[]>(initialData);

  const statusMap: Record<(typeof TABS)[number], Pendaftaran['status']> = {
    Menunggu: 'menunggu',
    Disetujui: 'disetujui',
    Ditolak: 'ditolak',
  };

  const filtered = list.filter((item) => item.status === statusMap[activeTab]);

  const updateStatus = (id: string, status: Pendaftaran['status']) => {
    setList((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  const handleReject = (id: string) => {
    Alert.alert('Tolak Pendaftaran', 'Peserta akan diberi tahu bahwa pendaftaran ditolak.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Tolak', style: 'destructive', onPress: () => updateStatus(id, 'ditolak') },
    ]);
  };

  return (
    <AdminScaffold title="Pendaftaran" onBack={() => router.back()}>
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const active = tab === activeTab;
          const count = list.filter((item) => item.status === statusMap[tab]).length;
          return (
            <TouchableOpacity key={tab} style={[styles.tabBtn, active && styles.tabBtnActive]} onPress={() => setActiveTab(tab)}>
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
              <View style={[styles.tabCount, active && styles.tabCountActive]}>
                <Text style={[styles.tabCountText, active && styles.tabCountTextActive]}>{count}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <EmptyState icon="document-text-outline" title="Tidak ada data" message={`Belum ada pendaftaran berstatus ${activeTab.toLowerCase()}.`} />
        ) : (
          filtered.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardTop}>
                <Image source={{ uri: item.avatar }} style={styles.avatar} />
                <View style={styles.cardInfo}>
                  <Text style={styles.nama}>{item.nama}</Text>
                  <Text style={styles.seminar} numberOfLines={2}>{item.seminar}</Text>
                  <Text style={styles.tanggal}>Mendaftar {item.tanggalDaftar}</Text>
                </View>
                <StatusBadge
                  label={item.status === 'menunggu' ? 'Menunggu' : item.status === 'disetujui' ? 'Disetujui' : 'Ditolak'}
                  tone={item.status === 'menunggu' ? 'pending' : item.status === 'disetujui' ? 'success' : 'danger'}
                />
              </View>
              {item.status === 'menunggu' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
                    <Text style={styles.rejectBtnText}>Tolak</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.approveBtn} onPress={() => updateStatus(item.id, 'disetujui')}>
                    <Text style={styles.approveBtnText}>Setujui</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </AdminScaffold>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 16, gap: 8 },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    backgroundColor: DesignColors.ivoryCard,
  },
  tabBtnActive: { backgroundColor: DesignColors.navyDeep, borderColor: DesignColors.navyDeep },
  tabText: { fontSize: 11, fontWeight: '600', color: DesignColors.slateGray },
  tabTextActive: { color: DesignColors.gold },
  tabCount: { backgroundColor: DesignColors.offWhite, borderRadius: 9, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
  tabCountActive: { backgroundColor: DesignColors.gold },
  tabCountText: { fontSize: 9, fontWeight: '700', color: DesignColors.slateGray },
  tabCountTextActive: { color: DesignColors.navyDeep },
  scrollContent: { padding: 20, paddingBottom: 32 },
  card: {
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 14,
    marginBottom: 12,
  },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  cardInfo: { flex: 1 },
  nama: { fontSize: 14, fontWeight: '700', color: DesignColors.navyDeep },
  seminar: { fontSize: 11, color: DesignColors.charcoal, marginTop: 2, lineHeight: 15 },
  tanggal: { fontSize: 10, color: DesignColors.slateGray, marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  rejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: DesignColors.statusRed,
    borderRadius: Radius.md,
    paddingVertical: 9,
    alignItems: 'center',
  },
  rejectBtnText: { fontSize: 12, fontWeight: '700', color: DesignColors.statusRed },
  approveBtn: {
    flex: 1,
    backgroundColor: DesignColors.statusGreen,
    borderRadius: Radius.md,
    paddingVertical: 9,
    alignItems: 'center',
  },
  approveBtnText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
});