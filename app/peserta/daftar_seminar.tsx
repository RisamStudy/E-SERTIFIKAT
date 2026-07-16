import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PesertaScaffold } from '../../components/peserta/pesertachrome';
import { EmptyState } from '../../components/ui/emptystate';
import { DesignColors, Radius } from '../../constants/theme';

interface SeminarTersedia {
  id: string;
  title: string;
  image: string;
  narasumber: string;
  tanggal: string;
  kuota: number;
  terisi: number;
  kategori: string;
  registered: boolean;
}

const CATEGORIES = ['Semua', 'Teknologi', 'Desain', 'Akademik'];

const initialList: SeminarTersedia[] = [
  {
    id: '1',
    title: 'Seminar Nasional Cyber Security 2024',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    narasumber: 'Prof. Dr. Aninditya Putri',
    tanggal: '24 Jul 2024 • 09:00 WIB',
    kuota: 1500,
    terisi: 1240,
    kategori: 'Teknologi',
    registered: false,
  },
  {
    id: '2',
    title: 'Workshop UI/UX Professional Design',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    narasumber: 'Ir. Bagus Wirawan, M.Kom.',
    tanggal: '02 Agu 2024 • 13:00 WIB',
    kuota: 100,
    terisi: 85,
    kategori: 'Desain',
    registered: false,
  },
  {
    id: '3',
    title: 'Konferensi Rekayasa Perangkat Lunak',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
    narasumber: 'Dr. Ir. Taufik Hidayat',
    tanggal: '14 Agu 2024 • 08:30 WIB',
    kuota: 700,
    terisi: 610,
    kategori: 'Akademik',
    registered: true,
  },
];

export default function PesertaDaftarSeminarScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');
  const [list, setList] = useState<SeminarTersedia[]>(initialList);

  const filtered = list.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'Semua' || item.kategori === category;
    return matchSearch && matchCategory;
  });

  const handleRegister = (id: string) => {
    setList((prev) => prev.map((item) => (item.id === id ? { ...item, registered: true, terisi: item.terisi + 1 } : item)));
    Alert.alert('Pendaftaran Terkirim', 'Anda akan menerima notifikasi setelah pendaftaran disetujui admin.');
  };

  return (
    <PesertaScaffold title="Daftar Seminar" onBack={() => router.back()}>
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={DesignColors.slateGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari seminar atau workshop..."
          placeholderTextColor={DesignColors.slateGray}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {CATEGORIES.map((cat) => {
          const active = cat === category;
          return (
            <TouchableOpacity key={cat} style={[styles.categoryChip, active && styles.categoryChipActive]} onPress={() => setCategory(cat)}>
              <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{cat}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <EmptyState icon="calendar-outline" title="Seminar tidak ditemukan" message="Coba kata kunci lain atau ubah kategori." />
        ) : (
          filtered.map((item) => {
            const kuotaPct = Math.min(100, Math.round((item.terisi / item.kuota) * 100));
            return (
              <View key={item.id} style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <View style={styles.cardInfo}>
                  <Text style={styles.kategoriTag}>{item.kategori.toUpperCase()}</Text>
                  <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.detailRow}>
                    <Ionicons name="person-outline" size={12} color={DesignColors.slateGray} />
                    <Text style={styles.detailText}>{item.narasumber}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={12} color={DesignColors.slateGray} />
                    <Text style={styles.detailText}>{item.tanggal}</Text>
                  </View>

                  <View style={styles.quotaTrack}>
                    <View style={[styles.quotaFill, { width: `${kuotaPct}%` }]} />
                  </View>
                  <Text style={styles.quotaText}>{item.terisi}/{item.kuota} kuota terisi</Text>

                  <TouchableOpacity
                    style={[styles.registerBtn, item.registered && styles.registerBtnDone]}
                    onPress={() => !item.registered && handleRegister(item.id)}
                    disabled={item.registered}
                  >
                    <Text style={[styles.registerBtnText, item.registered && styles.registerBtnTextDone]}>
                      {item.registered ? 'Terdaftar' : 'Daftar Sekarang'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </PesertaScaffold>
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
  categoryRow: { marginTop: 12, paddingLeft: 20 },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    backgroundColor: DesignColors.ivoryCard,
    marginRight: 8,
  },
  categoryChipActive: { backgroundColor: DesignColors.navyDeep, borderColor: DesignColors.navyDeep },
  categoryText: { fontSize: 11, fontWeight: '600', color: DesignColors.slateGray },
  categoryTextActive: { color: DesignColors.gold },
  scrollContent: { padding: 20, paddingBottom: 32 },
  card: {
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 130 },
  cardInfo: { padding: 14 },
  kategoriTag: { fontSize: 9, fontWeight: '700', color: DesignColors.gold, letterSpacing: 0.6, marginBottom: 6 },
  title: { fontSize: 14, fontWeight: '700', color: DesignColors.navyDeep, lineHeight: 19, marginBottom: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  detailText: { fontSize: 11, color: DesignColors.slateGray },
  quotaTrack: { height: 5, backgroundColor: DesignColors.offWhite, borderRadius: 3, marginTop: 10, overflow: 'hidden' },
  quotaFill: { height: '100%', backgroundColor: DesignColors.gold, borderRadius: 3 },
  quotaText: { fontSize: 10, color: DesignColors.slateGray, marginTop: 4, marginBottom: 12 },
  registerBtn: { backgroundColor: DesignColors.gold, borderRadius: Radius.md, paddingVertical: 11, alignItems: 'center' },
  registerBtnDone: { backgroundColor: DesignColors.offWhite, borderWidth: 1, borderColor: DesignColors.borderLight },
  registerBtnText: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep },
  registerBtnTextDone: { color: DesignColors.slateGray },
});