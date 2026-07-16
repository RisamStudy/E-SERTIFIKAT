import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { AdminScaffold } from '../../components/admin/adminchrome';
import { StatusBadge } from '../../components/ui/statusbadge';
import { DesignColors, Radius } from '../../constants/theme';

interface EligiblePeserta {
  id: string;
  nama: string;
  avatar: string;
  kehadiran: number;
  sudahTerbit: boolean;
  selected: boolean;
}

const seminarOptions = ['Seminar Nasional Cyber Security 2024', 'Workshop UI/UX Professional Design'];

const initialList: EligiblePeserta[] = [
  { id: '1', nama: 'Rangga Aditya', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', kehadiran: 100, sudahTerbit: true, selected: false },
  { id: '2', nama: 'Sinta Maharani', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', kehadiran: 100, sudahTerbit: false, selected: false },
  { id: '3', nama: 'Melati Wijaya', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80', kehadiran: 92, sudahTerbit: false, selected: false },
];

export default function AdminGenerateSertifikatScreen() {
  const router = useRouter();
  const [activeSeminar, setActiveSeminar] = useState(seminarOptions[0]);
  const [list, setList] = useState<EligiblePeserta[]>(initialList);
  const [generating, setGenerating] = useState(false);

  const belumTerbit = list.filter((item) => !item.sudahTerbit);
  const selectedCount = list.filter((item) => item.selected && !item.sudahTerbit).length;

  const toggleSelect = (id: string) => {
    setList((prev) => prev.map((item) => (item.id === id && !item.sudahTerbit ? { ...item, selected: !item.selected } : item)));
  };

  const selectAll = () => {
    const allSelected = belumTerbit.every((item) => item.selected);
    setList((prev) => prev.map((item) => (item.sudahTerbit ? item : { ...item, selected: !allSelected })));
  };

  const handleGenerate = () => {
    if (selectedCount === 0) {
      Alert.alert('Pilih Peserta', 'Pilih minimal satu peserta yang akan diterbitkan sertifikatnya.');
      return;
    }
    setGenerating(true);
    setTimeout(() => {
      setList((prev) => prev.map((item) => (item.selected ? { ...item, sudahTerbit: true, selected: false } : item)));
      setGenerating(false);
      Alert.alert('Berhasil', `${selectedCount} sertifikat berhasil diterbitkan.`);
    }, 900);
  };

  return (
    <AdminScaffold title="Generate Sertifikat" rightIcon="ribbon-outline" onRightPress={() => router.push('/admin/template_sertifikat')}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seminarSelectorRow}>
          {seminarOptions.map((title) => {
            const active = title === activeSeminar;
            return (
              <TouchableOpacity key={title} style={[styles.seminarChip, active && styles.seminarChipActive]} onPress={() => setActiveSeminar(title)}>
                <Text style={[styles.seminarChipText, active && styles.seminarChipTextActive]} numberOfLines={1}>{title}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Mini certificate preview */}
        <View style={styles.previewCard}>
          <View style={styles.previewBorderOuter}>
            <View style={styles.previewBorderInner}>
              <Text style={styles.previewLabel}>SERTIFIKAT</Text>
              <Text style={styles.previewName}>Nama Peserta</Text>
              <Text style={styles.previewDesc}>telah menyelesaikan {activeSeminar}</Text>
            </View>
          </View>
          <Text style={styles.previewCaption}>Pratinjau template aktif</Text>
        </View>

        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionHeaderTitle}>Peserta Memenuhi Syarat</Text>
          <TouchableOpacity onPress={selectAll}>
            <Text style={styles.selectAllText}>Pilih Semua</Text>
          </TouchableOpacity>
        </View>

        {list.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[styles.row, item.sudahTerbit && styles.rowDisabled]}
            onPress={() => toggleSelect(item.id)}
            disabled={item.sudahTerbit}
            activeOpacity={0.75}
          >
            <View style={[styles.checkbox, item.selected && styles.checkboxActive]}>
              {item.selected && <Ionicons name="checkmark" size={12} color={DesignColors.navyDeep} />}
            </View>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.rowInfo}>
              <Text style={styles.nama}>{item.nama}</Text>
              <Text style={styles.kehadiran}>Kehadiran {item.kehadiran}%</Text>
            </View>
            <StatusBadge label={item.sudahTerbit ? 'Terbit' : 'Belum Terbit'} tone={item.sudahTerbit ? 'success' : 'pending'} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footerBar}>
        <Text style={styles.footerCount}>{selectedCount} peserta dipilih</Text>
        <TouchableOpacity style={[styles.generateBtn, generating && { opacity: 0.7 }]} onPress={handleGenerate} disabled={generating}>
          <Ionicons name="sparkles-outline" size={16} color={DesignColors.navyDeep} />
          <Text style={styles.generateBtnText}>{generating ? 'Memproses...' : 'Terbitkan Sertifikat'}</Text>
        </TouchableOpacity>
      </View>
    </AdminScaffold>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 100 },
  seminarSelectorRow: { marginBottom: 16 },
  seminarChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    backgroundColor: DesignColors.ivoryCard,
    marginRight: 8,
    maxWidth: 240,
  },
  seminarChipActive: { backgroundColor: DesignColors.navyDeep, borderColor: DesignColors.navyDeep },
  seminarChipText: { fontSize: 12, fontWeight: '600', color: DesignColors.slateGray },
  seminarChipTextActive: { color: DesignColors.gold },
  previewCard: {
    backgroundColor: '#EDEAE2',
    borderRadius: Radius.lg,
    padding: 18,
    alignItems: 'center',
    marginBottom: 24,
  },
  previewBorderOuter: {
    width: '100%',
    borderWidth: 1.5,
    borderColor: DesignColors.gold,
    borderRadius: Radius.sm,
    padding: 4,
    backgroundColor: DesignColors.ivoryCard,
  },
  previewBorderInner: {
    borderWidth: 1,
    borderColor: DesignColors.goldSoft,
    borderRadius: 4,
    paddingVertical: 22,
    alignItems: 'center',
  },
  previewLabel: { fontSize: 11, fontWeight: '700', color: DesignColors.gold, letterSpacing: 3 },
  previewName: { fontSize: 18, fontWeight: '700', color: DesignColors.navyDeep, marginTop: 10, fontStyle: 'italic' },
  previewDesc: { fontSize: 10, color: DesignColors.slateGray, marginTop: 6, textAlign: 'center', paddingHorizontal: 20 },
  previewCaption: { fontSize: 10, color: DesignColors.slateGray, marginTop: 10 },
  listHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionHeaderTitle: { fontSize: 15, fontWeight: '700', color: DesignColors.navyDeep },
  selectAllText: { fontSize: 12, fontWeight: '700', color: DesignColors.gold },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 12,
    marginBottom: 10,
    gap: 12,
  },
  rowDisabled: { opacity: 0.55 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: DesignColors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: DesignColors.gold, borderColor: DesignColors.gold },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  rowInfo: { flex: 1 },
  nama: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep },
  kehadiran: { fontSize: 11, color: DesignColors.slateGray, marginTop: 2 },
  footerBar: {
    position: 'absolute',
    bottom: 64,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: DesignColors.ivoryCard,
    borderTopWidth: 1,
    borderTopColor: DesignColors.borderLight,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  footerCount: { fontSize: 12, color: DesignColors.slateGray, fontWeight: '600' },
  generateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: DesignColors.gold,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  generateBtnText: { fontSize: 12, fontWeight: '700', color: DesignColors.navyDeep },
});