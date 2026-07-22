import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { AdminScaffold } from '../../components/admin/adminchrome';
import { db } from '../../config/firebase';
import { DesignColors, Radius } from '../../constants/theme';

const TEMPLATE_DOC_ID = 'default'; // Firestore: collection 'template_sertifikat' / doc 'default'

interface Signatory {
  nama: string;
  jabatan: string;
  keyTtd: string;
}

interface TemplateData {
  judulAcara: string;
  namaPenandatangan: string;
  jabatan: string;
  showQr: boolean;
  signatories?: Signatory[];
}

const getTtdSource = (key: string) => {
  switch (key) {
    case 'tanda_tangan.png':
      return require('../../assets/tanda_tangan.png');
    case 'tanda_tangan2.png':
      return require('../../assets/tanda_tangan2.png');
    case 'tanda_tangan3.png':
      return require('../../assets/tanda_tangan3.png');
    default:
      return require('../../assets/tanda_tangan.png');
  }
};

export default function AdminTemplateSertifikatScreen() {
  const router = useRouter();

  const [judulAcara, setJudulAcara] = useState('');
  const [namaPenandatangan, setNamaPenandatangan] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [showQr, setShowQr] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [signatories, setSignatories] = useState<Signatory[]>([
    { nama: "Muhamad Risa Ma'arif", jabatan: 'Ketua pelaksana', keyTtd: 'tanda_tangan.png' },
    { nama: 'Ahmad Abdullah Firdaus', jabatan: 'Wakil Ketua Pelaksana', keyTtd: 'tanda_tangan2.png' },
    { nama: 'Reinal Fahrizi', jabatan: 'Sekretaris Acara', keyTtd: 'tanda_tangan3.png' },
  ]);

  // Load template dari Firestore
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'template_sertifikat', TEMPLATE_DOC_ID));
        if (snap.exists()) {
          const data = snap.data() as TemplateData;
          setJudulAcara(data.judulAcara ?? '');
          setNamaPenandatangan(data.namaPenandatangan ?? '');
          setJabatan(data.jabatan ?? '');
          setShowQr(data.showQr ?? true);
          if (data.signatories && Array.isArray(data.signatories) && data.signatories.length > 0) {
            setSignatories(data.signatories);
          }
        }
      } catch (err) {
        console.error('load template error:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const updateSignatory = (index: number, field: keyof Signatory, value: string) => {
    setSignatories(prev => {
      const next = [...prev];
      if (!next[index]) {
        next[index] = { nama: '', jabatan: '', keyTtd: `tanda_tangan${index > 0 ? index + 1 : ''}.png` };
      }
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSave = async () => {
    const activeSignatories = signatories.filter(s => s.nama.trim() !== '');
    if (!judulAcara.trim() || activeSignatories.length === 0 || !activeSignatories[0].nama.trim() || !activeSignatories[0].jabatan.trim()) {
      Alert.alert('Lengkapi Data', 'Judul acara dan Penandatangan 1 wajib diisi.');
      return;
    }
    setSaving(true);
    try {
      await setDoc(doc(db, 'template_sertifikat', TEMPLATE_DOC_ID), {
        judulAcara: judulAcara.trim(),
        namaPenandatangan: activeSignatories[0].nama.trim(),
        jabatan: activeSignatories[0].jabatan.trim(),
        showQr,
        signatories: activeSignatories,
        updatedAt: new Date().toISOString(),
      });
      Alert.alert('Tersimpan', 'Template sertifikat berhasil diperbarui.');
    } catch (err) {
      console.error('save template error:', err);
      Alert.alert('Gagal', 'Gagal menyimpan template. Coba lagi.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminScaffold title="Template Sertifikat" onBack={() => router.back()}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={DesignColors.gold} />
          <Text style={styles.loadingText}>Memuat template...</Text>
        </View>
      </AdminScaffold>
    );
  }

  return (
    <AdminScaffold title="Template Sertifikat" onBack={() => router.back()}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Preview sertifikat dengan bg */}
        <View style={styles.previewWrap}>
          <Image
            source={require('../../assets/bg_sertifikat.png')}
            style={styles.bgImage}
            resizeMode="cover"
          />
          <View style={styles.certOverlay}>
            <View style={styles.certLogoCircle}>
              <Ionicons name="ribbon" size={22} color={DesignColors.gold} />
            </View>
            <Text style={styles.certKicker}>E-SERTIFIKAT ACADEMIC PORTAL</Text>
            <Text style={styles.certTitle}>SERTIFIKAT</Text>
            <Text style={styles.certGiven}>Dengan bangga diberikan kepada</Text>
            <Text style={styles.certName}>Nama Peserta</Text>
            <Text style={styles.certBody}>
              atas partisipasi dan kelulusannya dalam kegiatan{'\n'}
              <Text style={styles.certBodyBold}>{judulAcara || 'Judul Acara'}</Text>
            </Text>

             <View style={styles.certFooterRow}>
              {signatories.filter(s => s.nama.trim() !== '').map((sig, idx) => (
                <View key={idx} style={styles.certSignBlock}>
                  <Image
                    source={getTtdSource(sig.keyTtd)}
                    style={styles.signatureImg}
                    resizeMode="contain"
                  />
                  <View style={styles.certSignLine} />
                  <Text style={styles.certSignName}>{sig.nama}</Text>
                  <Text style={styles.certSignRole}>{sig.jabatan}</Text>
                </View>
              ))}
              <Image
                source={require('../../assets/stempel.png')}
                style={styles.stempelImg}
                resizeMode="contain"
              />
            </View>

            {showQr && (
              <View style={styles.certQrRow}>
                <QRCode
                  value="https://esertifikat.app/verify/preview"
                  size={36}
                  color={DesignColors.navyDeep}
                  backgroundColor="transparent"
                />
                <Text style={styles.certIdText}>ID: CE-2024-000001 • Verifikasi via QR</Text>
              </View>
            )}
          </View>
        </View>

        {/* Form edit */}
        <Text style={styles.groupTitle}>Konten Template</Text>
        <View style={styles.card}>
          <Text style={styles.formLabel}>Judul Acara *</Text>
          <TextInput
            style={styles.formInput}
            value={judulAcara}
            onChangeText={setJudulAcara}
            placeholder="Nama seminar/workshop"
            placeholderTextColor={DesignColors.slateGray}
          />
        </View>

        <Text style={styles.groupTitle}>Penandatangan (Maksimal 3)</Text>
        {[0, 1, 2].map(idx => {
          const sig = signatories[idx] || { nama: '', jabatan: '', keyTtd: `tanda_tangan${idx > 0 ? idx + 1 : ''}.png` };
          return (
            <View key={idx} style={[styles.card, { marginBottom: 16 }]}>
              <Text style={{ fontWeight: '700', color: DesignColors.navyDeep, marginBottom: 8 }}>
                Penandatangan {idx + 1} {idx === 0 ? '*' : '(Opsional)'}
              </Text>
              
              <Text style={styles.formLabel}>Nama Lengkap</Text>
              <TextInput
                style={styles.formInput}
                value={sig.nama}
                onChangeText={(val) => updateSignatory(idx, 'nama', val)}
                placeholder="Nama lengkap & gelar"
                placeholderTextColor={DesignColors.slateGray}
              />

              <Text style={styles.formLabel}>Jabatan</Text>
              <TextInput
                style={styles.formInput}
                value={sig.jabatan}
                onChangeText={(val) => updateSignatory(idx, 'jabatan', val)}
                placeholder="Contoh: Ketua Pelaksana"
                placeholderTextColor={DesignColors.slateGray}
              />

              <Text style={styles.formLabel}>File Tanda Tangan</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                {['tanda_tangan.png', 'tanda_tangan2.png', 'tanda_tangan3.png'].map(key => (
                  <TouchableOpacity
                    key={key}
                    style={{
                      flex: 1,
                      padding: 8,
                      borderRadius: Radius.sm,
                      borderWidth: 1.5,
                      borderColor: sig.keyTtd === key ? DesignColors.gold : DesignColors.borderLight,
                      backgroundColor: sig.keyTtd === key ? DesignColors.offWhite : '#fff',
                      alignItems: 'center'
                    }}
                    onPress={() => updateSignatory(idx, 'keyTtd', key)}
                  >
                    <Text style={{
                      fontSize: 10,
                      fontWeight: sig.keyTtd === key ? '700' : '400',
                      color: sig.keyTtd === key ? DesignColors.navyDeep : DesignColors.slateGray
                    }}>
                      {key.replace('.png', '')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          );
        })}

        <Text style={styles.groupTitle}>Aset Visual</Text>
        <View style={styles.card}>
          <View style={styles.assetRow}>
            <View style={styles.assetIconWrap}>
              <Ionicons name="image-outline" size={18} color={DesignColors.navyDeep} />
            </View>
            <View style={styles.assetTextWrap}>
              <Text style={styles.assetLabel}>Background Sertifikat</Text>
              <Text style={styles.assetDescription}>bg_sertifikat.png • digunakan sebagai latar</Text>
            </View>
            <View style={styles.assetActiveBadge}>
              <Text style={styles.assetActiveBadgeText}>Aktif</Text>
            </View>
          </View>
          <View style={styles.assetRow}>
            <View style={styles.assetIconWrap}>
              <Ionicons name="create-outline" size={18} color={DesignColors.navyDeep} />
            </View>
            <View style={styles.assetTextWrap}>
              <Text style={styles.assetLabel}>Tanda Tangan Digital</Text>
              <Text style={styles.assetDescription}>tanda_tangan.png</Text>
            </View>
            <View style={styles.assetActiveBadge}>
              <Text style={styles.assetActiveBadgeText}>Aktif</Text>
            </View>
          </View>
          <View style={[styles.assetRow, { borderBottomWidth: 0 }]}>
            <View style={styles.assetIconWrap}>
              <Ionicons name="shield-outline" size={18} color={DesignColors.navyDeep} />
            </View>
            <View style={styles.assetTextWrap}>
              <Text style={styles.assetLabel}>Stempel Resmi</Text>
              <Text style={styles.assetDescription}>stempel.png</Text>
            </View>
            <View style={styles.assetActiveBadge}>
              <Text style={styles.assetActiveBadgeText}>Aktif</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.qrToggleRow} onPress={() => setShowQr(prev => !prev)}>
          <Ionicons
            name={showQr ? 'checkbox' : 'square-outline'}
            size={20}
            color={showQr ? DesignColors.gold : DesignColors.slateGray}
          />
          <Text style={styles.qrToggleText}>Tampilkan ID sertifikat & QR verifikasi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={DesignColors.navyDeep} />
          ) : (
            <Text style={styles.saveBtnText}>Simpan Template</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </AdminScaffold>
  );
}

const styles = StyleSheet.create({
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 13, color: DesignColors.slateGray },
  scrollContent: { padding: 20, paddingBottom: 32 },
  previewWrap: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1.5,
    borderColor: DesignColors.gold,
  },
  bgImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  certOverlay: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  certLogoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: DesignColors.goldSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  certKicker: { fontSize: 8, fontWeight: '700', color: DesignColors.slateGray, letterSpacing: 1.5 },
  certTitle: { fontSize: 18, fontWeight: '800', color: DesignColors.navyDeep, letterSpacing: 4, marginTop: 6 },
  certGiven: { fontSize: 9, color: DesignColors.slateGray, marginTop: 10 },
  certName: { fontSize: 18, fontWeight: '700', fontStyle: 'italic', color: DesignColors.navyDeep, marginTop: 4 },
  certBody: { fontSize: 9, color: DesignColors.charcoal, textAlign: 'center', marginTop: 8, lineHeight: 14 },
  certBodyBold: { fontWeight: '700', color: DesignColors.navyDeep },
  certFooterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 8,
    position: 'relative',
    gap: 8,
  },
  certSignBlock: { alignItems: 'center', flex: 1, minWidth: 60 },
  signatureImg: { width: 60, height: 24, marginBottom: -4 },
  certSignLine: { width: 75, height: 1, backgroundColor: DesignColors.slateGray, marginBottom: 4 },
  certSignName: { fontSize: 7, fontWeight: '700', color: DesignColors.navyDeep, textAlign: 'center' },
  certSignRole: { fontSize: 6, color: DesignColors.slateGray, marginTop: 1, textAlign: 'center' },
  stempelImg: {
    position: 'absolute',
    right: 0,
    bottom: -5,
    width: 48,
    height: 48,
    opacity: 0.8,
  },
  certQrRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14 },
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
  assetActiveBadge: {
    backgroundColor: '#EDFDF5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  assetActiveBadgeText: { fontSize: 10, fontWeight: '700', color: DesignColors.statusGreen },
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
