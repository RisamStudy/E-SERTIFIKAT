import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdminScaffold } from '../../components/admin/adminchrome';
import { EmptyState } from '../../components/ui/emptystate';
import { StatusBadge } from '../../components/ui/statusbadge';
import { DesignColors, Radius } from '../../constants/theme';

interface Peserta {
  id: string;
  nama: string;
  email: string;
  avatar: string;
  seminarDiikuti: number;
  sertifikatDiterima: number;
  status: 'aktif' | 'nonaktif';
}

const FILTERS = ['Semua', 'Aktif', 'Nonaktif'] as const;

const data: Peserta[] = [
  { id: '1', nama: 'Rangga Aditya', email: 'rangga.aditya@mail.com', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', seminarDiikuti: 6, sertifikatDiterima: 5, status: 'aktif' },
  { id: '2', nama: 'Sinta Maharani', email: 'sinta.maharani@mail.com', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', seminarDiikuti: 3, sertifikatDiterima: 3, status: 'aktif' },
  { id: '3', nama: 'Doni Prasetyo', email: 'doni.prasetyo@mail.com', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80', seminarDiikuti: 2, sertifikatDiterima: 0, status: 'nonaktif' },
  { id: '4', nama: 'Melati Wijaya', email: 'melati.wijaya@mail.com', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80', seminarDiikuti: 9, sertifikatDiterima: 8, status: 'aktif' },
];

export default function AdminPesertaScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('Semua');

  const filtered = data.filter((p) => {
    const matchSearch =
      p.nama.toLowerCase().includes(search.toLowerCase()) || p.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'Semua' || (filter === 'Aktif' && p.status === 'aktif') || (filter === 'Nonaktif' && p.status === 'nonaktif');
    return matchSearch && matchFilter;
  });

  return (
    <AdminScaffold title="Data Peserta" onBack={() => router.back()}>
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={DesignColors.slateGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama atau email peserta..."
          placeholderTextColor={DesignColors.slateGray}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((item) => {
          const active = item === filter;
          return (
            <TouchableOpacity key={item} style={[styles.filterChip, active && styles.filterChipActive]} onPress={() => setFilter(item)}>
              <Text style={[styles.filterText, active && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.resultCount}>{filtered.length} peserta ditemukan</Text>
        {filtered.length === 0 ? (
          <EmptyState icon="people-outline" title="Tidak ada peserta" message="Coba ubah kata kunci pencarian atau filter status." />
        ) : (
          filtered.map((p) => (
            <TouchableOpacity key={p.id} style={styles.card} activeOpacity={0.8}>
              <Image source={{ uri: p.avatar }} style={styles.avatar} />
              <View style={styles.cardInfo}>
                <Text style={styles.nama}>{p.nama}</Text>
                <Text style={styles.email}>{p.email}</Text>
                <View style={styles.metaRow}>
                  <Ionicons name="book-outline" size={12} color={DesignColors.slateGray} />
                  <Text style={styles.metaText}>{p.seminarDiikuti} seminar</Text>
                  <Ionicons name="ribbon-outline" size={12} color={DesignColors.slateGray} style={{ marginLeft: 10 }} />
                  <Text style={styles.metaText}>{p.sertifikatDiterima} sertifikat</Text>
                </View>
              </View>
              <StatusBadge label={p.status === 'aktif' ? 'Aktif' : 'Nonaktif'} tone={p.status === 'aktif' ? 'success' : 'pending'} />
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </AdminScaffold>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: DesignColors.ivoryCard,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    borderRadius: Radius.md,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 13, color: DesignColors.charcoal },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, marginTop: 12 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    backgroundColor: DesignColors.ivoryCard,
  },
  filterChipActive: { backgroundColor: DesignColors.navyDeep, borderColor: DesignColors.navyDeep },
  filterText: { fontSize: 11, fontWeight: '600', color: DesignColors.slateGray },
  filterTextActive: { color: DesignColors.gold },
  scrollContent: { padding: 20, paddingBottom: 32 },
  resultCount: { fontSize: 11, color: DesignColors.slateGray, marginBottom: 12 },
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
  avatar: { width: 46, height: 46, borderRadius: 23 },
  cardInfo: { flex: 1 },
  nama: { fontSize: 14, fontWeight: '700', color: DesignColors.navyDeep },
  email: { fontSize: 11, color: DesignColors.slateGray, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  metaText: { fontSize: 10, color: DesignColors.slateGray, marginLeft: 4, fontWeight: '600' },
});