import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdminScaffold } from '../../components/admin/adminchrome';

import { DesignColors, Radius } from '../../constants/theme';

export default function AdminTemplateSertifikatScreen() {
  const router = useRouter();
  const [judulAcara, setJudulAcara] = useState('Seminar Nasional Cyber Security 2024');
  const [namaPenandatangan, setNamaPenandatangan] = useState('Dr. Ir. Taufik Hidayat, M.Kom.');
  const [jabatan, setJabatan] = useState('Ketua Panitia Seminar');
  const [showQr, setShowQr] = useState(true);

  const handleSave = () => {
    Alert.alert('Tersimpan', 'Template sertifikat berhasil diperbarui.');
  };

  return (
    <AdminScaffold title="Template Sertifikat" onBack={() => router.back()}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Certificate Preview - matches design.md section 5 */}
        <View style={styles.previewWrap}>
          <View style={styles.certOuterBorder}>
            <View style={styles.certInnerBorder}>
              <View style={styles.certLogoCircle}>
                <Ionicons name="ribbon" size={22} color={DesignColors.gold} />
              </View>
              <Text style={styles.certKicker}>CERTIFYELITE ACADEMIC PORTAL</Text>
              <Text style={styles.certTitle}>SERTIFIKAT</Text>
              <Text style={styles.certGiven}>Dengan bangga diberikan kepada</Text>
              <Text style={styles.certName}>Nama Peserta</Text>
              <Text style={styles.certBody}>
                atas partisipasi dan kelulusannya dalam kegiatan{'\n'}
                <Text style={styles.certBodyBold}>{judulAcara || 'Judul Acara'}</Text>
              </Text>

              <View style={styles.certFooterRow}>
                <View style={styles.certSignBlock}>
                  <View style={styles.certSignLine} />
                  <Text style={styles.certSignName}>{namaPenandatangan || 'Nama Penandatangan'}</Text>
                  <Text style={styles.certSignRole}>{jabatan || 'Jabatan'}</Text>
                </View>
                <View style={styles.certStampCircle}>
                  <Text style={styles.certStampText}>STEMPEL</Text>
                </View>
              </View>

              {showQr && (
                <View style={styles.certQrRow}>
                  <View style={styles.certQrBox}>
                    <Ionicons name="qr-code-outline" size={16} color={DesignColors.slateGray} />
                  </View>
                  <Text style={styles.certIdText}>ID: CE-2024-000001 • Verifikasi via QR</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Editable fields */}
        <Text style={styles.groupTitle}>Konten Template</Text>
        <View style={styles.card}>
          <Text style={styles.formLabel}>Judul Acara</Text>
          <TextInput style={styles.formInput} value={judulAcara} onChangeText={setJudulAcara} placeholder="Nama seminar/workshop" placeholderTextColor={DesignColors.slateGray} />

          <Text style={styles.formLabel}>Nama Penandatangan</Text>
          <TextInput style={styles.formInput} value={namaPenandatangan} onChangeText={setNamaPenandatangan} placeholder="Nama & gelar" placeholderTextColor={DesignColors.slateGray} />

          <Text style={styles.formLabel}>Jabatan Penandatangan</Text>
          <TextInput style={styles.formInput} value={jabatan} onChangeText={setJabatan} placeholder="Contoh: Ketua Panitia" placeholderTextColor={DesignColors.slateGray} />
        </View>

        <Text style={styles.groupTitle}>Aset Visual</Text>
        <View style={styles.card}>
          <View style={styles.assetRow}>
            <View style={styles.assetIconWrap}>
              <Ionicons name="image-outline" size={18} color={DesignColors.navyDeep} />
            </View>
            <View style={styles.assetTextWrap}>
              <Text style={styles.assetLabel}>Logo Instansi</Text>
              <Text style={styles.assetDescription}>logo.png • ditampilkan di tengah atas</Text>
            </View>
            <TouchableOpacity><Text style={styles.assetChangeText}>Ganti</Text></TouchableOpacity>
          </View>
          <View style={styles.assetRow}>
            <View style={styles.assetIconWrap}>
              <Ionicons name="create-outline" size={18} color={DesignColors.navyDeep} />
            </View>
            <View style={styles.assetTextWrap}>
              <Text style={styles.assetLabel}>Tanda Tangan Digital</Text>
              <Text style={styles.assetDescription}>tanda_tangan.png</Text>
            </View>
            <TouchableOpacity><Text style={styles.assetChangeText}>Ganti</Text></TouchableOpacity>
          </View>
          <View style={[styles.assetRow, { borderBottomWidth: 0 }]}>
            <View style={styles.assetIconWrap}>
              <Ionicons name="shield-outline" size={18} color={DesignColors.navyDeep} />
            </View>
            <View style={styles.assetTextWrap}>
              <Text style={styles.assetLabel}>Stempel Resmi</Text>
              <Text style={styles.assetDescription}>stempel.png</Text>
            </View>
            <TouchableOpacity><Text style={styles.assetChangeText}>Ganti</Text></TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.qrToggleRow} onPress={() => setShowQr((prev) => !prev)}>
          <Ionicons name={showQr ? 'checkbox' : 'square-outline'} size={20} color={showQr ? DesignColors.gold : DesignColors.slateGray} />
          <Text style={styles.qrToggleText}>Tampilkan ID sertifikat & QR verifikasi</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Simpan Template</Text>
        </TouchableOpacity>
      </ScrollView>
    </AdminScaffold>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 32 },
  previewWrap: {
    backgroundColor: '#EDEAE2',
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 24,
  },
  certOuterBorder: {
    borderWidth: 1.5,
    borderColor: DesignColors.gold,
    borderRadius: Radius.sm,
    padding: 5,
    backgroundColor: DesignColors.ivoryCard,
  },
  certInnerBorder: {
    borderWidth: 1,
    borderColor: DesignColors.goldSoft,
    borderRadius: 4,
    paddingVertical: 24,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  certLogoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DesignColors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  certKicker: { fontSize: 8, fontWeight: '700', color: DesignColors.slateGray, letterSpacing: 1.5 },
  certTitle: { fontSize: 20, fontWeight: '800', color: DesignColors.navyDeep, letterSpacing: 4, marginTop: 8 },
  certGiven: { fontSize: 10, color: DesignColors.slateGray, marginTop: 12 },
  certName: { fontSize: 22, fontWeight: '700', fontStyle: 'italic', color: DesignColors.navyDeep, marginTop: 6 },
  certBody: { fontSize: 10, color: DesignColors.charcoal, textAlign: 'center', marginTop: 12, lineHeight: 16 },
  certBodyBold: { fontWeight: '700', color: DesignColors.navyDeep },
  certFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%', marginTop: 26 },
  certSignBlock: { alignItems: 'center', flex: 1 },
  certSignLine: { width: 90, height: 1, backgroundColor: DesignColors.slateGray, marginBottom: 6 },
  certSignName: { fontSize: 9, fontWeight: '700', color: DesignColors.navyDeep, textAlign: 'center' },
  certSignRole: { fontSize: 8, color: DesignColors.slateGray, marginTop: 2, textAlign: 'center' },
  certStampCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: DesignColors.statusRed,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.55,
  },
  certStampText: { fontSize: 6, fontWeight: '700', color: DesignColors.statusRed, textAlign: 'center' },
  certQrRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 },
  certQrBox: { width: 24, height: 24, borderWidth: 1, borderColor: DesignColors.borderLight, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  certIdText: { fontSize: 8, color: DesignColors.slateGray },
  groupTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: DesignColors.slateGray,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  card: {
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    padding: 16,
    marginBottom: 20,
  },
  formLabel: { fontSize: 12, fontWeight: '600', color: DesignColors.slateGray, marginBottom: 6, marginTop: 10 },
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
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: DesignColors.borderLight,
  },
  assetIconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: DesignColors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetTextWrap: { flex: 1 },
  assetLabel: { fontSize: 13, fontWeight: '600', color: DesignColors.navyDeep },
  assetDescription: { fontSize: 10, color: DesignColors.slateGray, marginTop: 2 },
  assetChangeText: { fontSize: 12, fontWeight: '700', color: DesignColors.gold },
  qrToggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 24 },
  qrToggleText: { fontSize: 12, color: DesignColors.charcoal, flex: 1 },
  saveBtn: {
    backgroundColor: DesignColors.gold,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveBtnText: { fontSize: 14, fontWeight: '700', color: DesignColors.navyDeep },
});