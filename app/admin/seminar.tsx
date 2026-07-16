import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

interface Seminar {
  id: string;
  title: string;
  lecturer: string;
  date: string;
  image: string;
  status: 'aktif' | 'draft' | 'selesai';
  participants?: string[];
  participantCount?: number;
  statusNote?: string;
}

export default function AdminSeminarScreen() {
  const router = useRouter();

  // Active filter state ('semua', 'aktif', 'draft', 'selesai')
  const [activeFilter, setActiveFilter] = useState<'semua' | 'aktif' | 'draft' | 'selesai'>('semua');
  
  // Active page state for pagination
  const [activePage, setActivePage] = useState<number>(1);

  // Modal states for creating/editing seminar
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formLecturer, setFormLecturer] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStatus, setFormStatus] = useState<'aktif' | 'draft' | 'selesai'>('aktif');
  const [formStatusNote, setFormStatusNote] = useState('');

  // Initial rich mock data matching the design image
  const [seminarList, setSeminarList] = useState<Seminar[]>([
    {
      id: '1',
      title: 'Implementasi AI dalam Riset Akademik Modern',
      lecturer: 'Prof. Dr. Aninditya Putri',
      date: '15 Oktober 2023, 09:00 WIB',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80',
      status: 'aktif',
      participants: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
      ],
      participantCount: 10, // Renders the +8 badge (10 total minus 2 avatars)
    },
    {
      id: '2',
      title: 'Strategi Publikasi Jurnal Q1 untuk Dosen Muda',
      lecturer: 'Dr. Budi Santoso, M.Kom',
      date: '22 November 2023, 13:00 WIB',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
      status: 'draft',
      statusNote: 'Menunggu persetujuan admin...',
    },
    {
      id: '3',
      title: 'Webinar Nasional: Ketahanan Digital Indonesia',
      lecturer: 'Ir. H. Muhammad Zaki',
      date: '05 September 2023, 10:00 WIB',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80',
      status: 'selesai',
      statusNote: '542 Sertifikat Terbit',
    },
  ]);

  // Handle Edit Action
  const handleEdit = (seminar: Seminar) => {
    setIsEditing(true);
    setEditingId(seminar.id);
    setFormTitle(seminar.title);
    setFormLecturer(seminar.lecturer);
    setFormDate(seminar.date);
    setFormStatus(seminar.status);
    setFormStatusNote(seminar.statusNote || '');
    setModalVisible(true);
  };

  // Handle Delete Action
  const handleDelete = (id: string, title: string) => {
    Alert.alert(
      'Hapus Seminar',
      `Apakah Anda yakin ingin menghapus seminar "${title}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            setSeminarList(prev => prev.filter(item => item.id !== id));
            Alert.alert('Sukses', 'Seminar berhasil dihapus.');
          },
        },
      ]
    );
  };

  // Save/Add Seminar
  const handleSave = () => {
    if (!formTitle || !formLecturer || !formDate) {
      Alert.alert('Error', 'Harap isi seluruh field.');
      return;
    }

    if (isEditing && editingId) {
      // Update existing
      setSeminarList(prev =>
        prev.map(item =>
          item.id === editingId
            ? {
                ...item,
                title: formTitle,
                lecturer: formLecturer,
                date: formDate,
                status: formStatus,
                statusNote:
                  formStatus === 'draft'
                    ? formStatusNote || 'Menunggu persetujuan admin...'
                    : formStatus === 'selesai'
                    ? formStatusNote || '500 Sertifikat Terbit'
                    : undefined,
              }
            : item
        )
      );
      Alert.alert('Sukses', 'Seminar berhasil diperbarui.');
    } else {
      // Add new
      let defaultImg = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80';
      if (formStatus === 'draft') {
        defaultImg = 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80';
      } else if (formStatus === 'selesai') {
        defaultImg = 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';
      }

      const newSeminar: Seminar = {
        id: (seminarList.length + 1).toString(),
        title: formTitle,
        lecturer: formLecturer,
        date: formDate,
        image: defaultImg,
        status: formStatus,
        statusNote:
          formStatus === 'draft'
            ? formStatusNote || 'Menunggu persetujuan admin...'
            : formStatus === 'selesai'
            ? formStatusNote || '0 Sertifikat Terbit'
            : undefined,
        participants:
          formStatus === 'aktif'
            ? [
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
              ]
            : undefined,
        participantCount: formStatus === 'aktif' ? 10 : undefined,
      };

      setSeminarList(prev => [...prev, newSeminar]);
      Alert.alert('Sukses', 'Seminar baru berhasil ditambahkan.');
    }

    // Reset and close modal
    resetForm();
  };

  const resetForm = () => {
    setFormTitle('');
    setFormLecturer('');
    setFormDate('');
    setFormStatus('aktif');
    setFormStatusNote('');
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
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.replace('/admin/dashboard')}
        >
          <Ionicons name="home-outline" size={22} color="#5C6470" />
          <Text style={[styles.tabLabel, { color: '#5C6470' }]}>Beranda</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="calendar" size={22} color="#C9A24B" />
          <Text style={[styles.tabLabel, { color: '#C9A24B' }]}>Seminar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/admin/generate_sertifikat')}
        >
          <Ionicons name="ribbon-outline" size={22} color="#5C6470" />
          <Text style={[styles.tabLabel, { color: '#5C6470' }]}>Sertifikat</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => router.push('/admin/profil')}
        >
          <Ionicons name="person-outline" size={22} color="#5C6470" />
          <Text style={[styles.tabLabel, { color: '#5C6470' }]}>Profil</Text>
        </TouchableOpacity>
      </View>

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

              {/* Submit Buttons */}
              <TouchableOpacity style={styles.submitBtn} onPress={handleSave}>
                <Text style={styles.submitBtnText}>
                  {isEditing ? 'Simpan Perubahan' : 'Buat Seminar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
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
  bottomTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#0F1B2D',
    height: 64,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    paddingBottom: Platform.OS === 'ios' ? 12 : 0,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
    marginTop: 4,
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
});