import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { AdminScaffold } from '../../components/admin/adminchrome';
import { EmptyState } from '../../components/ui/emptystate';
import { DesignColors, Radius } from '../../constants/theme';

interface Narasumber {
  id: string;
  nama: string;
  keahlian: string;
  instansi: string;
  email: string;
  totalSesi: number;
  avatar: string;
}

const initialData: Narasumber[] = [
  {
    id: '1',
    nama: 'Prof. Dr. Aninditya Putri',
    keahlian: 'Keamanan Siber & Jaringan',
    instansi: 'Universitas Indonesia',
    email: 'aninditya.putri@ui.ac.id',
    totalSesi: 12,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '2',
    nama: 'Ir. Bagus Wirawan, M.Kom.',
    keahlian: 'UI/UX & Human-Computer Interaction',
    instansi: 'Politeknik Cirebon',
    email: 'bagus.wirawan@poltek-cirebon.ac.id',
    totalSesi: 8,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
  },
  {
    id: '3',
    nama: 'Dr. Ir. Taufik Hidayat',
    keahlian: 'Forensik Digital',
    instansi: 'Politeknik Cirebon',
    email: 'taufik.hidayat@poltek-cirebon.ac.id',
    totalSesi: 15,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
  },
];

export default function AdminNarasumberScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [list, setList] = useState<Narasumber[]>(initialData);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formNama, setFormNama] = useState('');
  const [formKeahlian, setFormKeahlian] = useState('');
  const [formInstansi, setFormInstansi] = useState('');
  const [formEmail, setFormEmail] = useState('');

  const filtered = list.filter(
    (item) =>
      item.nama.toLowerCase().includes(search.toLowerCase()) ||
      item.keahlian.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormNama('');
    setFormKeahlian('');
    setFormInstansi('');
    setFormEmail('');
    setIsEditing(false);
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openEditModal = (item: Narasumber) => {
    setFormNama(item.nama);
    setFormKeahlian(item.keahlian);
    setFormInstansi(item.instansi);
    setFormEmail(item.email);
    setIsEditing(true);
    setEditingId(item.id);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!formNama.trim() || !formKeahlian.trim()) {
      Alert.alert('Data belum lengkap', 'Nama dan bidang keahlian wajib diisi.');
      return;
    }
    if (isEditing && editingId) {
      setList((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...item, nama: formNama, keahlian: formKeahlian, instansi: formInstansi, email: formEmail }
            : item
        )
      );
    } else {
      setList((prev) => [
        {
          id: Date.now().toString(),
          nama: formNama,
          keahlian: formKeahlian,
          instansi: formInstansi,
          email: formEmail,
          totalSesi: 0,
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        },
        ...prev,
      ]);
    }
    setModalVisible(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    Alert.alert('Hapus Narasumber', 'Data narasumber akan dihapus permanen.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => setList((prev) => prev.filter((item) => item.id !== id)) },
    ]);
  };

  return (
    <AdminScaffold title="Narasumber" onBack={() => router.back()} rightIcon="add" onRightPress={openAddModal}>
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={DesignColors.slateGray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama atau keahlian..."
          placeholderTextColor={DesignColors.slateGray}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <EmptyState icon="person-outline" title="Belum ada narasumber" message="Tambahkan narasumber baru menggunakan tombol + di pojok kanan atas." />
        ) : (
          filtered.map((item) => (
            <View key={item.id} style={styles.card}>
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
              <View style={styles.cardInfo}>
                <Text style={styles.nama}>{item.nama}</Text>
                <Text style={styles.keahlian}>{item.keahlian}</Text>
                <Text style={styles.instansi}>{item.instansi}</Text>
                <View style={styles.sesiRow}>
                  <Ionicons name="mic-outline" size={12} color={DesignColors.gold} />
                  <Text style={styles.sesiText}>{item.totalSesi} sesi dibawakan</Text>
                </View>
              </View>
              <View style={styles.actionCol}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => openEditModal(item)}>
                  <Ionicons name="create-outline" size={16} color={DesignColors.navyDeep} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
                  <Ionicons name="trash-outline" size={16} color={DesignColors.statusRed} />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{isEditing ? 'Edit Narasumber' : 'Tambah Narasumber'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={DesignColors.slateGray} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.formLabel}>Nama Lengkap & Gelar</Text>
              <TextInput style={styles.formInput} value={formNama} onChangeText={setFormNama} placeholder="Contoh: Dr. Budi Santoso, M.T." placeholderTextColor={DesignColors.slateGray} />

              <Text style={styles.formLabel}>Bidang Keahlian</Text>
              <TextInput style={styles.formInput} value={formKeahlian} onChangeText={setFormKeahlian} placeholder="Contoh: Kecerdasan Buatan" placeholderTextColor={DesignColors.slateGray} />

              <Text style={styles.formLabel}>Instansi</Text>
              <TextInput style={styles.formInput} value={formInstansi} onChangeText={setFormInstansi} placeholder="Contoh: Politeknik Cirebon" placeholderTextColor={DesignColors.slateGray} />

              <Text style={styles.formLabel}>Email</Text>
              <TextInput style={styles.formInput} value={formEmail} onChangeText={setFormEmail} placeholder="nama@instansi.ac.id" placeholderTextColor={DesignColors.slateGray} keyboardType="email-address" autoCapitalize="none" />

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>{isEditing ? 'Simpan Perubahan' : 'Tambah Narasumber'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  scrollContent: { padding: 20, paddingBottom: 32 },
  card: {
    flexDirection: 'row',
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 14,
    marginBottom: 12,
    gap: 12,
  },
  avatar: { width: 52, height: 52, borderRadius: 26 },
  cardInfo: { flex: 1 },
  nama: { fontSize: 14, fontWeight: '700', color: DesignColors.navyDeep },
  keahlian: { fontSize: 12, color: DesignColors.charcoal, marginTop: 2 },
  instansi: { fontSize: 11, color: DesignColors.slateGray, marginTop: 2 },
  sesiRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  sesiText: { fontSize: 10, color: DesignColors.slateGray, fontWeight: '600' },
  actionCol: { justifyContent: 'center', gap: 8 },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: DesignColors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 27, 45, 0.55)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: DesignColors.ivoryCard,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: DesignColors.navyDeep },
  formLabel: { fontSize: 12, fontWeight: '600', color: DesignColors.slateGray, marginBottom: 6, marginTop: 12 },
  formInput: {
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: DesignColors.charcoal,
    backgroundColor: DesignColors.offWhite,
  },
  saveBtn: {
    backgroundColor: DesignColors.gold,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 8,
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: DesignColors.navyDeep },
});