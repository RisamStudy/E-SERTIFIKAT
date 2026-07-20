import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    updateDoc,
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
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
import { AdminBottomNav } from '../../components/admin/adminchrome';
import { uploadToCloudinary } from '../../config/cloudinary';
import { db } from '../../config/firebase';

interface Seminar {
  id: string;
  title: string;
  lecturer: string;
  date: string;
  image: string;          // URL banner (Cloudinary atau fallback Unsplash)
  bannerPublicId?: string; // Cloudinary public_id untuk keperluan transformasi
  status: 'aktif' | 'draft' | 'selesai';
  participants?: string[];
  participantCount?: number;
  statusNote?: string;
}

export default function AdminSeminarScreen() {
  const router = useRouter();

  const [activeFilter, setActiveFilter] = useState<'semua' | 'aktif' | 'draft' | 'selesai'>('semua');
  const [activePage, setActivePage] = useState<number>(1);
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formLecturer, setFormLecturer] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStatus, setFormStatus] = useState<'aktif' | 'draft' | 'selesai'>('aktif');
  const [formStatusNote, setFormStatusNote] = useState('');
  const [formBannerUri, setFormBannerUri] = useState<string | null>(null); // URI lokal sebelum upload
  const [formBannerUrl, setFormBannerUrl] = useState<string>('');          // URL Cloudinary setelah upload
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [savingForm, setSavingForm] = useState(false);
  const [loadingSeminar, setLoadingSeminar] = useState(true);

  const FALLBACK_IMAGES = {
    aktif: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
    draft: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    selesai: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
  };

  const [seminarList, setSeminarList] = useState<Seminar[]>([]);

  // Load seminar dari Firestore
  useEffect(() => {
    loadSeminars();
  }, []);

  const loadSeminars = async () => {
    setLoadingSeminar(true);
    try {
      const q = query(collection(db, 'seminar'), orderBy('createdAt', 'desc'));
      const snap = await getDocs(q);
      const data: Seminar[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Seminar, 'id'>),
      }));
      setSeminarList(data);
    } catch {
      // Jika koleksi belum ada atau error, mulai dengan list kosong
      setSeminarList([]);
    } finally {
      setLoadingSeminar(false);
    }
  };

  // Pilih banner dari galeri
  const handlePickBanner = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin Diperlukan', 'Izinkan akses ke galeri untuk memilih banner seminar.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setFormBannerUri(result.assets[0].uri);
    }
  };

  // Handle Edit
  const handleEdit = (seminar: Seminar) => {
    setIsEditing(true);
    setEditingId(seminar.id);
    setFormTitle(seminar.title);
    setFormLecturer(seminar.lecturer);
    setFormDate(seminar.date);
    setFormStatus(seminar.status);
    setFormStatusNote(seminar.statusNote || '');
    setFormBannerUri(null);
    setFormBannerUrl(seminar.image);
    setModalVisible(true);
  };

  // Handle Delete
  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Hapus Seminar',
      `Apakah Anda yakin ingin menghapus seminar "${title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'seminar', id));
              setSeminarList(prev => prev.filter(item => item.id !== id));
              Alert.alert('Sukses', 'Seminar berhasil dihapus.');
            } catch {
              Alert.alert('Error', 'Gagal menghapus seminar. Coba lagi.');
            }
          },
        },
      ]
    );
  };

  // Save / Update seminar — upload banner ke Cloudinary jika ada
  const handleSave = async () => {
    if (!formTitle || !formLecturer || !formDate) {
      Alert.alert('Error', 'Harap isi seluruh field.');
      return;
    }
    setSavingForm(true);

    try {
      let finalBannerUrl = formBannerUrl || FALLBACK_IMAGES[formStatus];
      let displayBannerUrl = finalBannerUrl; // URL yang ditampilkan di UI (bisa lokal)
      let bannerPublicId: string | undefined;

      // Upload banner baru ke Cloudinary jika user memilih file
      if (formBannerUri) {
        setUploadingBanner(true);
        try {
          const uploaded = await uploadToCloudinary(formBannerUri, 'seminars/banner');
          finalBannerUrl = uploaded.secure_url;
          displayBannerUrl = uploaded.secure_url;
          bannerPublicId = uploaded.public_id;
        } catch (err) {
          // Cloudinary belum dikonfigurasi atau upload gagal:
          // tampilkan URI lokal di UI, simpan fallback ke Firestore
          displayBannerUrl = formBannerUri;
          finalBannerUrl = FALLBACK_IMAGES[formStatus];
          Alert.alert(
            'Info Banner',
            'Upload ke cloud belum aktif (konfigurasi Cloudinary belum diisi). Seminar disimpan dengan gambar default. Isi config/cloudinary.ts untuk mengaktifkan upload.'
          );
        } finally {
          setUploadingBanner(false);
        }
      }

      const statusNote =
        formStatus === 'draft'
          ? formStatusNote || 'Menunggu persetujuan admin...'
          : formStatus === 'selesai'
          ? formStatusNote || '0 Sertifikat Terbit'
          : undefined;

      if (isEditing && editingId) {
        const updateData: Record<string, unknown> = {
          title: formTitle,
          lecturer: formLecturer,
          date: formDate,
          status: formStatus,
          image: finalBannerUrl,
          updatedAt: new Date().toISOString(),
        };
        if (statusNote !== undefined) updateData.statusNote = statusNote;
        if (bannerPublicId) updateData.bannerPublicId = bannerPublicId;

        await updateDoc(doc(db, 'seminar', editingId), updateData);
        setSeminarList(prev =>
          prev.map(item =>
            item.id === editingId
              ? { ...item, title: formTitle, lecturer: formLecturer, date: formDate, status: formStatus, image: finalBannerUrl, statusNote }
              : item
          )
        );
        Alert.alert('Sukses', 'Seminar berhasil diperbarui.');
      } else {
        const newData = {
          title: formTitle,
          lecturer: formLecturer,
          date: formDate,
          image: finalBannerUrl,
          bannerPublicId: bannerPublicId ?? null,
          status: formStatus,
          statusNote: statusNote ?? null,
          participants: formStatus === 'aktif' ? [] : null,
          participantCount: formStatus === 'aktif' ? 0 : null,
          createdAt: new Date().toISOString(),
        };
        const ref = await addDoc(collection(db, 'seminar'), newData);
        setSeminarList(prev => [{ id: ref.id, ...newData } as Seminar, ...prev]);
        Alert.alert('Sukses', 'Seminar baru berhasil ditambahkan.');
      }
      resetForm();
    } catch (err) {
      Alert.alert('Error', 'Gagal menyimpan seminar. Periksa koneksi internet dan coba lagi.');
    } finally {
      setSavingForm(false);
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormLecturer('');
    setFormDate('');
    setFormStatus('aktif');
    setFormStatusNote('');
    setFormBannerUri(null);
    setFormBannerUrl('');
    setIsEditing(false);
    setEditingId(null);
    setModalVisible(false);
  };
  // Filter seminar list based on pills
  const filteredList = seminarList.filter(item => {
    if (activeFilter === 'semua') return true;
    return item.status === activeFilter;
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 1. Header Bar */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Text style={styles.brandText}>CertifyElite</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80' }}
              style={styles.avatarImage}
            />
          </View>
        </View>
      </View>

      {/* Loading state */}
      {loadingSeminar && (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color="#C9A24B" />
          <Text style={styles.loadingText}>Memuat seminar...</Text>
        </View>
      )}

      {/* Main Content Scroll View */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 2. Filter Pills */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterPill,
              activeFilter === 'semua' && styles.filterPillActive,
            ]}
            onPress={() => {
              setActiveFilter('semua');
              setActivePage(1);
            }}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'semua' && styles.filterTextActive,
              ]}
            >
              Semua
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              activeFilter === 'aktif' && styles.filterPillActive,
            ]}
            onPress={() => {
              setActiveFilter('aktif');
              setActivePage(1);
            }}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'aktif' && styles.filterTextActive,
              ]}
            >
              Aktif
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterPill,
              activeFilter === 'selesai' && styles.filterPillActive,
            ]}
            onPress={() => {
              setActiveFilter('selesai');
              setActivePage(1);
            }}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'selesai' && styles.filterTextActive,
              ]}
            >
              Selesai
            </Text>
          </TouchableOpacity>
        </View>

        {/* 3. Seminar Cards List */}
        {filteredList.map((seminar) => (
          <View key={seminar.id} style={styles.seminarCard}>
            {/* Image Section */}
            <View style={styles.imageWrapper}>
              <Image source={{ uri: seminar.image }} style={styles.seminarImage} />
              
              {/* Badge Status Overlay */}
              <View
                style={[
                  styles.statusBadge,
                  seminar.status === 'aktif' && styles.badgeAktif,
                  seminar.status === 'draft' && styles.badgeDraft,
                  seminar.status === 'selesai' && styles.badgeSelesai,
                ]}
              >
                <Text style={styles.statusText}>{seminar.status.toUpperCase()}</Text>
              </View>
            </View>

            {/* Info Section */}
            <View style={styles.cardInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.seminarTitle} numberOfLines={2}>
                  {seminar.title}
                </Text>
                <TouchableOpacity style={styles.moreButton}>
                  <Ionicons name="ellipsis-vertical" size={18} color="#5C6470" />
                </TouchableOpacity>
              </View>

              {/* Speaker */}
              <View style={styles.detailRow}>
                <Ionicons name="person-outline" size={14} color="#5C6470" style={styles.detailIcon} />
                <Text style={styles.detailText} numberOfLines={1}>{seminar.lecturer}</Text>
              </View>

              {/* Date & Time */}
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={14} color="#5C6470" style={styles.detailIcon} />
                <Text style={styles.detailText} numberOfLines={1}>{seminar.date}</Text>
              </View>

              {/* Divider */}
              <View style={styles.cardDivider} />

              {/* Card Footer Actions */}
              <View style={styles.cardFooter}>
                <View style={styles.footerLeft}>
                  {/* Status Note or Avatar Overlap Stack */}
                  {seminar.status === 'aktif' && seminar.participants ? (
                    <View style={styles.avatarStack}>
                      {seminar.participants.map((uri, idx) => (
                        <Image
                          key={idx}
                          source={{ uri }}
                          style={[
                            styles.stackedAvatar,
                            { marginLeft: idx > 0 ? -12 : 0, zIndex: 10 - idx },
                          ]}
                        />
                      ))}
                      <View style={[styles.avatarIndicator, { marginLeft: -12, zIndex: 0 }]}>
                        <Text style={styles.indicatorText}>
                          +{seminar.participantCount ? seminar.participantCount - seminar.participants.length : 8}
                        </Text>
                      </View>
                    </View>
                  ) : seminar.status === 'selesai' ? (
                    <View style={styles.completedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color="#3E7A5D" />
                      <Text style={styles.completedText}>{seminar.statusNote}</Text>
                    </View>
                  ) : (
                    <Text style={styles.pendingText} numberOfLines={1}>
                      {seminar.statusNote}
                    </Text>
                  )}
                </View>

                {/* Edit & Delete Action Icons */}
                <View style={styles.actionButtons}>
                  {seminar.status === 'selesai' ? (
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => Alert.alert('Detail', `Melihat sertifikat terbit untuk "${seminar.title}"`)}
                    >
                      <Ionicons name="eye-outline" size={20} color="#0F1B2D" />
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.actionIconBtn}
                      onPress={() => handleEdit(seminar)}
                    >
                      <Ionicons name="pencil-outline" size={18} color="#0F1B2D" />
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.actionIconBtn, { marginLeft: 12 }]}
                    onPress={() => handleDelete(seminar.id, seminar.title)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#B3413A" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        ))}

        {/* 4. "Buat Seminar Baru" Card (Shown only when viewing 'Semua' or 'Draft') */}
        {(activeFilter === 'semua' || activeFilter === 'draft') && (
          <TouchableOpacity
            style={styles.createCard}
            onPress={() => {
              setIsEditing(false);
              setModalVisible(true);
            }}
          >
            <View style={styles.plusCircle}>
              <Ionicons name="add" size={24} color="#C9A24B" />
            </View>
            <Text style={styles.createCardTitle}>Buat Seminar Baru</Text>
            <Text style={styles.createCardSubtitle}>
              Gunakan template sertifikat premium kami untuk acara Anda.
            </Text>
          </TouchableOpacity>
        )}

        {/* 5. Pagination Buttons */}
        <View style={styles.paginationContainer}>
          <TouchableOpacity
            style={styles.pageArrow}
            disabled={activePage === 1}
            onPress={() => setActivePage(prev => Math.max(1, prev - 1))}
          >
            <Ionicons name="chevron-back" size={16} color={activePage === 1 ? '#DCD7CB' : '#0F1B2D'} />
          </TouchableOpacity>

          {[1, 2, 3].map((page) => (
            <TouchableOpacity
              key={page}
              style={[
                styles.pageButton,
                activePage === page && styles.pageButtonActive,
              ]}
              onPress={() => setActivePage(page)}
            >
              <Text
                style={[
                  styles.pageNumberText,
                  activePage === page && styles.pageNumberTextActive,
                ]}
              >
                {page}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.pageArrow}
            disabled={activePage === 3}
            onPress={() => setActivePage(prev => Math.min(3, prev + 1))}
          >
            <Ionicons name="chevron-forward" size={16} color={activePage === 3 ? '#DCD7CB' : '#0F1B2D'} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 6. Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => {
          setIsEditing(false);
          setModalVisible(true);
        }}
      >
        <Ionicons name="add" size={24} color="#FFFFFF" />
      </TouchableOpacity>

      {/* 7. Bottom Navigation Bar */}
      <AdminBottomNav />

      {/* 8. Create/Edit Seminar Modal Dialog */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isEditing ? 'Edit Seminar' : 'Seminar Baru'}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <Ionicons name="close" size={24} color="#0F1B2D" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Field: Judul */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Judul Seminar</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Masukkan judul seminar"
                  placeholderTextColor="#8A8F98"
                  value={formTitle}
                  onChangeText={setFormTitle}
                />
              </View>

              {/* Field: Narasumber */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nama Narasumber</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Nama Lengkap & Gelar"
                  placeholderTextColor="#8A8F98"
                  value={formLecturer}
                  onChangeText={setFormLecturer}
                />
              </View>

              {/* Field: Tanggal & Waktu */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Tanggal & Waktu</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Contoh: 15 Oktober 2023, 09:00 WIB"
                  placeholderTextColor="#8A8F98"
                  value={formDate}
                  onChangeText={setFormDate}
                />
              </View>

              {/* Field: Status */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Status</Text>
                <View style={styles.statusRadioGroup}>
                  {(['aktif', 'draft', 'selesai'] as const).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.statusRadioOption,
                        formStatus === status && styles.statusRadioOptionActive,
                      ]}
                      onPress={() => setFormStatus(status)}
                    >
                      <Text
                        style={[
                          styles.statusRadioText,
                          formStatus === status && styles.statusRadioTextActive,
                        ]}
                      >
                        {status.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Field: Status Note (Optional, for Draft/Selesai) */}
              {(formStatus === 'draft' || formStatus === 'selesai') && (
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Keterangan Status / Catatan</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder={
                      formStatus === 'draft'
                        ? 'Contoh: Menunggu persetujuan admin...'
                        : 'Contoh: 542 Sertifikat Terbit'
                    }
                    placeholderTextColor="#8A8F98"
                    value={formStatusNote}
                    onChangeText={setFormStatusNote}
                  />
                </View>
              )}

              {/* Field: Banner Seminar */}
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Banner Seminar</Text>
                <TouchableOpacity style={styles.bannerPickerBtn} onPress={handlePickBanner}>
                  {formBannerUri ? (
                    <Image source={{ uri: formBannerUri }} style={styles.bannerPreview} resizeMode="cover" />
                  ) : formBannerUrl ? (
                    <Image source={{ uri: formBannerUrl }} style={styles.bannerPreview} resizeMode="cover" />
                  ) : (
                    <View style={styles.bannerPickerPlaceholder}>
                      <Ionicons name="image-outline" size={28} color="#8A8F98" />
                      <Text style={styles.bannerPickerText}>Ketuk untuk pilih banner (16:9)</Text>
                      <Text style={styles.bannerPickerHint}>Jika kosong, gambar default akan digunakan</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {(formBannerUri || formBannerUrl) && (
                  <TouchableOpacity
                    style={styles.bannerRemoveBtn}
                    onPress={() => { setFormBannerUri(null); setFormBannerUrl(''); }}
                  >
                    <Ionicons name="trash-outline" size={14} color="#B3413A" />
                    <Text style={styles.bannerRemoveText}>Hapus Banner</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Submit Buttons */}
              <TouchableOpacity
                style={[styles.submitBtn, (savingForm || uploadingBanner) && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={savingForm || uploadingBanner}
              >
                {(savingForm || uploadingBanner) ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.submitBtnText}>
                      {uploadingBanner ? 'Mengupload Banner...' : 'Menyimpan...'}
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.submitBtnText}>
                    {isEditing ? 'Simpan Perubahan' : 'Buat Seminar'}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={resetForm} disabled={savingForm}>
                <Text style={styles.cancelBtnText}>Batal</Text>
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F3EE', // Sand / Cream off-white backdrop
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0F1B2D', // Deep Navy Blue
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 55 : 40,
    paddingBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerLeft: {
    flex: 1,
  },
  brandText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#C9A24B', // Gold logo accent
    letterSpacing: 0.5,
  },
  headerRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Safe padding for FAB and Navigation Bar
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCD7CB',
    marginRight: 10,
    ...Platform.select({
      web: {
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      },
    }),
  },
  filterPillActive: {
    backgroundColor: '#0F1B2D',
    borderColor: '#0F1B2D',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#5C6470',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  seminarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCD7CB',
    marginBottom: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)',
      },
    }),
  },
  imageWrapper: {
    height: 160,
    width: '100%',
    position: 'relative',
  },
  seminarImage: {
    width: '100%',
    height: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeAktif: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)', // Solid-translucent Green
  },
  badgeDraft: {
    backgroundColor: 'rgba(59, 130, 246, 0.9)', // Solid-translucent Blue
  },
  badgeSelesai: {
    backgroundColor: 'rgba(239, 68, 68, 0.9)', // Solid-translucent Red/Orange
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  cardInfo: {
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  seminarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F1B2D',
    flex: 1,
    marginRight: 10,
    lineHeight: 22,
  },
  moreButton: {
    padding: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailText: {
    fontSize: 12,
    color: '#5C6470',
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F5F3EE',
    marginVertical: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flex: 1,
    marginRight: 10,
  },
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stackedAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  avatarIndicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0F1B2D',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  indicatorText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#3E7A5D',
    marginLeft: 6,
  },
  pendingText: {
    fontSize: 11,
    fontStyle: 'italic',
    color: '#8A8F98',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIconBtn: {
    padding: 4,
  },
  createCard: {
    backgroundColor: '#0F1B2D',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(217, 170, 63, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#0F1B2D',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 6px 16px rgba(22, 32, 49, 0.1)',
      },
    }),
  },
  plusCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#C9A24B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  createCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#C9A24B',
    marginBottom: 6,
  },
  createCardSubtitle: {
    fontSize: 11,
    color: '#5C6470',
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  pageArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCD7CB',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCD7CB',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  pageButtonActive: {
    backgroundColor: '#0F1B2D',
    borderColor: '#0F1B2D',
  },
  pageNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5C6470',
  },
  pageNumberTextActive: {
    color: '#FFFFFF',
  },
  fabButton: {
    position: 'absolute',
    bottom: 84, // Anchored safely above bottom nav
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0F1B2D',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F1B2D',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F1B2D',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#DCD7CB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F1B2D',
    backgroundColor: '#FBFAF6',
  },
  statusRadioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusRadioOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DCD7CB',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: '#FBFAF6',
  },
  statusRadioOptionActive: {
    borderColor: '#0F1B2D',
    backgroundColor: 'rgba(22, 32, 49, 0.05)',
  },
  statusRadioText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#5C6470',
  },
  statusRadioTextActive: {
    color: '#0F1B2D',
  },
  submitBtn: {
    backgroundColor: '#0F1B2D',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cancelBtn: {
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8A8F98',
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#5C6470',
  },
  bannerPickerBtn: {
    borderWidth: 1.5,
    borderColor: '#DCD7CB',
    borderStyle: 'dashed',
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 110,
  },
  bannerPreview: {
    width: '100%',
    height: 160,
  },
  bannerPickerPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 6,
  },
  bannerPickerText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#5C6470',
    textAlign: 'center',
  },
  bannerPickerHint: {
    fontSize: 10,
    color: '#8A8F98',
    textAlign: 'center',
  },
  bannerRemoveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    alignSelf: 'flex-end',
  },
  bannerRemoveText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B3413A',
  },
});