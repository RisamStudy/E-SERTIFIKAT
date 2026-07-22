import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState, useRef } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Share,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { Asset } from 'expo-asset';
import { PesertaScaffold } from '../../components/peserta/pesertachrome';
import { db } from '../../config/firebase';
import { DesignColors, Radius } from '../../constants/theme';

interface Signatory {
  nama: string;
  jabatan: string;
  keyTtd: string;
}

interface SertifikatDetail {
  idSertifikat: string;
  namaPeserta: string;
  pesertaId?: string;
  seminarTitle: string;
  tanggalTerbit: string;
  penandatangan: string;
  jabatan: string;
  imageUrl?: string;
  verifyUrl?: string;
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

const VERIFY_BASE_URL = 'https://esertifikat.app/verify';

const resolveAccountName = async (detail: SertifikatDetail) => {
  if (!detail.pesertaId) return detail.namaPeserta;

  try {
    const userSnap = await getDoc(doc(db, 'users', detail.pesertaId));
    if (!userSnap.exists()) return detail.namaPeserta;

    const userData = userSnap.data() as {
      displayName?: string;
      name?: string;
      nama?: string;
    };
    return (
      userData.displayName?.trim() ||
      userData.name?.trim() ||
      userData.nama?.trim() ||
      detail.namaPeserta
    );
  } catch (error) {
    console.error('Gagal mengambil nama akun peserta:', error);
    return detail.namaPeserta;
  }
};

export default function PesertaDownloadSertifikatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();

  const [cert, setCert] = useState<SertifikatDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const qrCodeRef = useRef<any>(null);

  const getQrBase64 = (): Promise<string> => {
    return new Promise((resolve) => {
      if (qrCodeRef.current) {
        qrCodeRef.current.toDataURL((data: string) => {
          resolve(data ? data.replace(/\s/g, '') : '');
        });
      } else {
        resolve('');
      }
    });
  };

  const getAssetBase64 = async (assetRequire: any): Promise<string> => {
    try {
      const asset = Asset.fromModule(assetRequire);
      await asset.downloadAsync();
      let localUri = asset.localUri || asset.uri;
      if (!localUri) return '';

      // Jika uri berupa URL remote (http/https), download ke cache lokal terlebih dahulu
      if (localUri.startsWith('http://') || localUri.startsWith('https://')) {
        const filename = localUri.split('/').pop()?.split('?')[0] || 'temp_asset.png';
        const tempCacheUri = FileSystem.cacheDirectory + filename;
        const downloadResult = await FileSystem.downloadAsync(localUri, tempCacheUri);
        localUri = downloadResult.uri;
      }

      const base64 = await FileSystem.readAsStringAsync(localUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return base64;
    } catch (error) {
      console.error('Failed to load asset base64:', error);
      return '';
    }
  };

  useEffect(() => {
    if (!params.id) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'sertifikat', params.id as string));
        if (snap.exists()) {
          const detail = snap.data() as SertifikatDetail;
          const accountName = await resolveAccountName(detail);
          setCert({ ...detail, namaPeserta: accountName });
        } else {
          // Fallback data untuk development
          setCert({
            idSertifikat: params.id ? `CE-2024-0001${params.id}` : 'CE-2024-000188',
            namaPeserta: 'Rangga Aditya',
            seminarTitle: 'Konferensi Rekayasa Perangkat Lunak',
            tanggalTerbit: '15 Mei 2024',
            penandatangan: 'Dr. Ir. Taufik Hidayat, M.Kom.',
            jabatan: 'Ketua Panitia Seminar',
            verifyUrl: `${VERIFY_BASE_URL}/${params.id}`,
          });
        }
      } catch {
        // Gunakan data mock jika koneksi gagal
        setCert({
          idSertifikat: params.id ? `CE-2024-0001${params.id}` : 'CE-2024-000188',
          namaPeserta: 'Rangga Aditya',
          seminarTitle: 'Konferensi Rekayasa Perangkat Lunak',
          tanggalTerbit: '15 Mei 2024',
          penandatangan: 'Dr. Ir. Taufik Hidayat, M.Kom.',
          jabatan: 'Ketua Panitia Seminar',
          verifyUrl: `${VERIFY_BASE_URL}/${params.id}`,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  const verifyUrl = cert?.verifyUrl ?? `${VERIFY_BASE_URL}/${params.id ?? 'unknown'}`;

  const handleShare = async () => {
    try {
      await Share.share({
        title: 'Sertifikat Saya',
        message: `Lihat sertifikat saya: ${verifyUrl}`,
        url: verifyUrl,
      });
    } catch {
      Alert.alert('Bagikan Sertifikat', `Tautan verifikasi:\n${verifyUrl}`);
    }
  };

  const handleDownload = async () => {
    if (!cert) return;
    setDownloading(true);
    try {
      // 1. Dapatkan base64 gambar & QR
      const qrBase64 = await getQrBase64();
      const bgBase64 = await getAssetBase64(require('../../assets/bg_sertifikat.png'));
      const stampBase64 = await getAssetBase64(require('../../assets/stempel.png'));

      const activeSignatories = cert.signatories && cert.signatories.length > 0
        ? cert.signatories
        : [
            { nama: "Muhamad Risa Ma'arif", jabatan: 'Ketua pelaksana', keyTtd: 'tanda_tangan.png' },
            { nama: 'Ahmad Abdullah Firdaus', jabatan: 'Wakil Ketua Pelaksana', keyTtd: 'tanda_tangan2.png' },
            { nama: 'Reinal Fahrizi', jabatan: 'Sekretaris Acara', keyTtd: 'tanda_tangan3.png' }
          ];

      // Load base64 untuk setiap ttd
      const sigBase64s = await Promise.all(
        activeSignatories.map(async (sig) => {
          if (sig.keyTtd === 'tanda_tangan.png') {
            return await getAssetBase64(require('../../assets/tanda_tangan.png'));
          } else if (sig.keyTtd === 'tanda_tangan2.png') {
            return await getAssetBase64(require('../../assets/tanda_tangan2.png'));
          } else if (sig.keyTtd === 'tanda_tangan3.png') {
            return await getAssetBase64(require('../../assets/tanda_tangan3.png'));
          }
          return '';
        })
      );

      // 2. Format nama sertifikat: Sertifikat {Nama Sertifikat} - {Nama User}.pdf
      const sanitizedSeminar = cert.seminarTitle.replace(/[/\\?%*:|"<>]/g, '-');
      const sanitizedUser = cert.namaPeserta.replace(/[/\\?%*:|"<>]/g, '-');
      const filename = `Sertifikat ${sanitizedSeminar} - ${sanitizedUser}.pdf`;

      // 3. Buat HTML Sertifikat
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
        <meta charset="utf-8">
        <title>Sertifikat</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Great+Vibes&family=Montserrat:wght@400;500;700&display=swap');
          
          @page {
            size: A4 landscape;
            margin: 0;
          }
          
          html, body {
            margin: 0;
            padding: 0;
            width: 297mm;
            height: 210mm;
            background-color: #f8f6f0;
            -webkit-print-color-adjust: exact;
            box-sizing: border-box;
            overflow: hidden;
          }

          .page-container {
            width: 297mm;
            height: 210mm;
            position: relative;
            box-sizing: border-box;
            overflow: hidden;
          }

          .bg-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: fill;
            z-index: 1;
          }

          .cert-overlay {
            position: absolute;
            top: 12mm;
            left: 12mm;
            right: 12mm;
            bottom: 12mm;
            z-index: 2;
            box-sizing: border-box;
            background-color: transparent;
            border: 2px solid #C9A24B;
            padding: 3mm;
          }

          .inner-border {
            width: 100%;
            height: 100%;
            border: 1px dashed #C9A24B;
            box-sizing: border-box;
            padding: 16px 36px 12px 36px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
          }

          .header {
            text-align: center;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .badge-container {
            margin-bottom: 6px;
          }

          .kicker {
            font-family: 'Montserrat', sans-serif;
            font-size: 10px;
            font-weight: 700;
            color: #5C6470;
            letter-spacing: 3px;
            text-transform: uppercase;
          }

          .title {
            font-family: 'Cinzel', serif;
            font-size: 40px;
            font-weight: 700;
            color: #0F1B2D;
            letter-spacing: 7px;
            margin-top: 6px;
            margin-bottom: 4px;
          }

          .divider-line {
            width: 150px;
            height: 1px;
            background: linear-gradient(90deg, transparent, #C9A24B, transparent);
            margin-bottom: 8px;
          }

          .given-to {
            font-family: 'Montserrat', sans-serif;
            font-size: 13px;
            color: #5C6470;
            letter-spacing: 1.5px;
          }

          .name {
            font-family: 'Great Vibes', cursive;
            font-weight: 400;
            font-size: 56px;
            color: #0F1B2D;
            margin: 4px 0 2px;
            text-shadow: 1px 1px 1px rgba(0,0,0,0.05);
          }

          .role-badge {
            font-family: 'Montserrat', sans-serif;
            font-size: 14px;
            font-weight: 700;
            color: #0F1B2D;
            letter-spacing: 2px;
            margin-top: 1px;
            margin-bottom: 8px;
            text-transform: uppercase;
          }

          .body-text {
            font-family: 'Montserrat', sans-serif;
            font-size: 13px;
            color: #232323;
            text-align: center;
            line-height: 1.55;
            max-width: 88%;
          }

          .body-bold {
            font-weight: 700;
            color: #0F1B2D;
            font-size: 14px;
          }

          .cert-date {
            font-family: 'Montserrat', sans-serif;
            font-size: 11px;
            color: #5C6470;
            margin-top: 8px;
            font-weight: 500;
          }

          .footer-row {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }

          .qr-col {
            display: flex;
            align-items: center;
            text-align: left;
          }

          .qr-code-img {
            width: 52px;
            height: 52px;
            margin-right: 12px;
            border: 1px solid #DCD7CB;
            padding: 2px;
            background-color: #fff;
          }

          .qr-text {
            display: flex;
            flex-direction: column;
          }

          .cert-id {
            font-family: 'Montserrat', sans-serif;
            font-size: 10px;
            font-weight: 700;
            color: #0F1B2D;
          }

          .qr-hint {
            font-family: 'Montserrat', sans-serif;
            font-size: 9px;
            color: #5C6470;
            margin-top: 2px;
          }

          .qr-url {
            font-family: 'Montserrat', sans-serif;
            font-size: 9px;
            color: #C9A24B;
            margin-top: 2px;
            max-width: 250px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .signatures-wrap {
            display: flex;
            align-items: flex-end;
            gap: 20px;
            position: relative;
          }

          .sign-block {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 140px;
          }

          .signature-img {
            height: 38px;
            margin-bottom: 2px;
            mix-blend-mode: multiply;
          }

          .sign-line {
            width: 100%;
            height: 1px;
            background-color: #C9A24B;
            margin-bottom: 4px;
          }

          .sign-name {
            font-family: 'Montserrat', sans-serif;
            font-size: 10px;
            font-weight: 700;
            color: #0F1B2D;
            text-align: center;
          }

          .sign-role {
            font-family: 'Montserrat', sans-serif;
            font-size: 9px;
            color: #5C6470;
            margin-top: 2px;
            text-align: center;
          }

          .stamp-img {
            position: absolute;
            right: -25px;
            bottom: -5px;
            height: 64px;
            width: 64px;
            object-fit: contain;
            mix-blend-mode: multiply;
            z-index: 5;
            opacity: 0.9;
          }
        </style>
        </head>
        <body>
          <div class="page-container">
            ${bgBase64 ? `<img src="data:image/png;base64,${bgBase64}" class="bg-image" />` : ''}
            <div class="cert-overlay">
              <div class="inner-border">
                
                <div class="header">
                  <div class="badge-container">
                    <svg width="36" height="36" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="24" cy="20" r="14" fill="#C9A24B" stroke="#0F1B2D" stroke-width="2"/>
                      <circle cx="24" cy="20" r="10" fill="#E4CE8F"/>
                      <path d="M18 28L14 42L24 37L34 42L30 28" stroke="#0F1B2D" stroke-width="2" stroke-linejoin="round"/>
                      <path d="M21 16L24 13L27 16L24 19L21 16Z" fill="#0F1B2D"/>
                    </svg>
                  </div>
                  <div class="kicker">E-SERTIFIKAT ACADEMIC PORTAL</div>
                  <div class="title">SERTIFIKAT</div>
                  <div class="divider-line"></div>
                  <div class="given-to">DIBERIKAN KEPADA :</div>
                  <div class="name">${cert.namaPeserta}</div>
                  <div class="role-badge">PESERTA</div>
                  <div class="body-text">
                    Dalam Acara Seminar/Kegiatan <span class="body-bold">${cert.seminarTitle}</span><br/>
                    atas partisipasi aktif, kehadiran, serta kelulusan sebagai peserta dalam seluruh rangkaian kegiatan tersebut.
                  </div>
                  <div class="cert-date">Terbit: ${cert.tanggalTerbit}</div>
                </div>

                <div class="footer-row">
                  <div class="qr-col">
                    ${qrBase64 ? `<img src="data:image/png;base64,${qrBase64}" class="qr-code-img" />` : ''}
                    <div class="qr-text">
                      <div class="cert-id">${cert.idSertifikat}</div>
                      <div class="qr-hint">Scan QR untuk verifikasi keaslian sertifikat</div>
                      <div class="qr-url">${verifyUrl}</div>
                    </div>
                  </div>
                  
                  <div class="signatures-wrap">
                    ${activeSignatories.map((sig, index) => {
                      const sigBase64 = sigBase64s[index] || '';
                      return `
                        <div class="sign-block">
                          ${sigBase64 ? `<img src="data:image/png;base64,${sigBase64}" class="signature-img" />` : ''}
                          <div class="sign-line"></div>
                          <div class="sign-name">${sig.nama}</div>
                          <div class="sign-role">${sig.jabatan}</div>
                        </div>
                      `;
                    }).join('')}
                    ${stampBase64 ? `<img src="data:image/png;base64,${stampBase64}" class="stamp-img" />` : ''}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // 4. Print ke file temp PDF
      const { uri: tempUri } = await Print.printToFileAsync({ html: htmlContent });

      // 5. Salin ke folder lokal dokumen aplikasi agar bisa dibuka
      const targetLocalUri = FileSystem.documentDirectory + filename;
      await FileSystem.copyAsync({
        from: tempUri,
        to: targetLocalUri,
      });

      // 6. Tangani penyimpanan dan opsi pembukaan berdasarkan OS
      if (Platform.OS === 'android') {
        // Beritahu pengguna untuk memilih direktori unduhan
        Alert.alert(
          'Simpan Sertifikat',
          'Pilih folder penyimpanan (disarankan folder "Download") pada langkah berikutnya.',
          [
            {
              text: 'Batal',
              style: 'cancel',
              onPress: () => setDownloading(false),
            },
            {
              text: 'Pilih Folder',
              onPress: async () => {
                try {
                  const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
                  if (permissions.granted) {
                    const fileContent = await FileSystem.readAsStringAsync(targetLocalUri, {
                      encoding: FileSystem.EncodingType.Base64,
                    });
                    
                    const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
                      permissions.directoryUri,
                      filename,
                      'application/pdf'
                    );

                    await FileSystem.writeAsStringAsync(newFileUri, fileContent, {
                      encoding: FileSystem.EncodingType.Base64,
                    });

                    // Sukses menyimpan, tawarkan tombol "Buka Sertifikat"
                    Alert.alert(
                      'Unduh Berhasil',
                      'Sertifikat berhasil disimpan ke folder download perangkat Anda.',
                      [
                        { text: 'Tutup', style: 'cancel' },
                        {
                          text: 'Buka Sertifikat',
                          onPress: async () => {
                            try {
                              const contentUri = await FileSystem.getContentUriAsync(targetLocalUri);
                              await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                                data: contentUri,
                                flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
                                type: 'application/pdf',
                              });
                            } catch {
                              Alert.alert('Gagal membuka', 'Tidak ada aplikasi pembaca PDF yang ditemukan di perangkat Anda.');
                            }
                          },
                        },
                      ]
                    );
                  } else {
                    Alert.alert('Dibatalkan', 'Penyimpanan file dibatalkan.');
                  }
                } catch (e) {
                  console.error(e);
                  Alert.alert('Error', 'Gagal menyimpan file.');
                } finally {
                  setDownloading(false);
                }
              },
            },
          ]
        );
      } else {
        // Untuk iOS, tampilkan share sheet agar user bisa "Save to Files" atau membukanya langsung
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(targetLocalUri, {
            UTI: 'com.adobe.pdf',
            mimeType: 'application/pdf',
          });

          Alert.alert(
            'Unduh Berhasil',
            'Sertifikat siap dibuka.',
            [
              { text: 'Tutup', style: 'cancel' },
              {
                text: 'Buka Sertifikat',
                onPress: async () => {
                  await Sharing.shareAsync(targetLocalUri, {
                    UTI: 'com.adobe.pdf',
                    mimeType: 'application/pdf',
                  });
                },
              },
            ]
          );
        } else {
          Alert.alert('Error', 'Fitur bagikan/simpan tidak tersedia.');
        }
        setDownloading(false);
      }

    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengunduh PDF.');
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <PesertaScaffold title="Detail Sertifikat" onBack={() => router.back()}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={DesignColors.gold} />
          <Text style={styles.loadingText}>Memuat sertifikat...</Text>
        </View>
      </PesertaScaffold>
    );
  }

  if (!cert) {
    return (
      <PesertaScaffold title="Detail Sertifikat" onBack={() => router.back()}>
        <View style={styles.center}>
          <Ionicons name="ribbon-outline" size={40} color={DesignColors.slateGray} />
          <Text style={styles.emptyText}>Sertifikat tidak ditemukan.</Text>
        </View>
      </PesertaScaffold>
    );
  }

  return (
    <PesertaScaffold title="Detail Sertifikat" onBack={() => router.back()}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Certificate preview dengan background */}
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
            <Text style={styles.certGiven}>DIBERIKAN KEPADA :</Text>
            <Text style={styles.certName}>{cert.namaPeserta}</Text>
            <Text style={styles.certRole}>Sebagai PESERTA</Text>
            <Text style={styles.certBody}>
              Dalam Acara Seminar/Kegiatan:{'\n'}
              <Text style={styles.certBodyBold}>{cert.seminarTitle}</Text>{'\n'}
              atas partisipasi aktif, kehadiran, serta kelulusan sebagai peserta dalam seluruh rangkaian kegiatan tersebut.
            </Text>
            <Text style={styles.certDate}>Terbit: {cert.tanggalTerbit}</Text>

            <View style={styles.certFooterRow}>
              {(cert.signatories && cert.signatories.length > 0
                ? cert.signatories
                : [{ nama: cert.penandatangan, jabatan: cert.jabatan, keyTtd: 'tanda_tangan.png' }]
              ).map((sig, idx) => (
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

            {/* QR Code verifikasi asli */}
            <View style={styles.certQrRow}>
              <QRCode
                value={verifyUrl}
                size={52}
                color={DesignColors.navyDeep}
                backgroundColor="transparent"
                getRef={(ref) => (qrCodeRef.current = ref)}
              />
              <View style={styles.certQrTextCol}>
                <Text style={styles.certIdText}>{cert.idSertifikat}</Text>
                <Text style={styles.certQrHint}>Scan QR untuk verifikasi keaslian sertifikat</Text>
                <Text style={styles.certQrUrl} numberOfLines={1}>{verifyUrl}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info detail */}
        <View style={styles.infoCard}>
          <InfoRow label="ID Sertifikat" value={cert.idSertifikat} />
          <InfoRow label="Tanggal Terbit" value={cert.tanggalTerbit} />
          <InfoRow label="Status Verifikasi" value="" isVerified />
        </View>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={16} color={DesignColors.navyDeep} />
            <Text style={styles.shareBtnText}>Bagikan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.downloadBtn, downloading && { opacity: 0.7 }]}
            onPress={handleDownload}
            disabled={downloading}
          >
            <Ionicons name="download-outline" size={16} color={DesignColors.navyDeep} />
            <Text style={styles.downloadBtnText}>{downloading ? 'Mengunduh...' : 'Unduh PDF'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </PesertaScaffold>
  );
}

function InfoRow({ label, value, isVerified }: { label: string; value: string; isVerified?: boolean }) {
  return (
    <View style={[styles.infoRow, isVerified && { borderBottomWidth: 0 }]}>
      <Text style={styles.infoLabel}>{label}</Text>
      {isVerified ? (
        <View style={styles.verifiedTag}>
          <Ionicons name="shield-checkmark" size={12} color={DesignColors.statusGreen} />
          <Text style={styles.verifiedText}>Terverifikasi</Text>
        </View>
      ) : (
        <Text style={styles.infoValue}>{value}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText: { marginTop: 12, fontSize: 13, color: DesignColors.slateGray },
  emptyText: { fontSize: 14, color: DesignColors.slateGray, marginTop: 12 },
  scrollContent: { padding: 20, paddingBottom: 32 },
  previewWrap: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: DesignColors.gold,
  },
  bgImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  certOverlay: {
    padding: 22,
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
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  certKicker: { fontSize: 9, fontWeight: '700', color: DesignColors.slateGray, letterSpacing: 1.5 },
  certTitle: { fontSize: 26, fontWeight: '800', color: DesignColors.navyDeep, letterSpacing: 4, marginTop: 8 },
  certGiven: { fontSize: 11, color: DesignColors.slateGray, marginTop: 14 },
  certName: { fontSize: 30, fontWeight: '700', fontStyle: 'italic', color: DesignColors.navyDeep, marginTop: 6, textAlign: 'center' },
  certBody: { fontSize: 12, color: DesignColors.charcoal, textAlign: 'center', marginTop: 14, lineHeight: 19 },
  certBodyBold: { fontWeight: '700', color: DesignColors.navyDeep },
  certFooterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: '100%',
    marginTop: 24,
    position: 'relative',
    gap: 8,
  },
  certSignBlock: { alignItems: 'center', flex: 1, minWidth: 60 },
  signatureImg: { width: 60, height: 24, marginBottom: -4 },
  certSignLine: { width: 75, height: 1, backgroundColor: DesignColors.slateGray, marginBottom: 4 },
  certSignName: { fontSize: 8, fontWeight: '700', color: DesignColors.navyDeep, textAlign: 'center' },
  certSignRole: { fontSize: 7, color: DesignColors.slateGray, marginTop: 1, textAlign: 'center' },
  stempelImg: {
    position: 'absolute',
    right: 0,
    bottom: -5,
    width: 48,
    height: 48,
    opacity: 0.8,
  },
  certRole: {
    fontSize: 12,
    fontWeight: '700',
    color: DesignColors.navyDeep,
    letterSpacing: 2,
    marginTop: 2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  certDate: {
    fontSize: 10,
    color: DesignColors.slateGray,
    marginTop: 8,
    fontWeight: '500',
  },
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
  certQrRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: DesignColors.borderLight,
    paddingTop: 16,
    width: '100%',
  },
  certQrTextCol: { flex: 1 },
  certIdText: { fontSize: 10, fontWeight: '700', color: DesignColors.navyDeep },
  certQrHint: { fontSize: 8, color: DesignColors.slateGray, marginTop: 3 },
  certQrUrl: { fontSize: 7, color: DesignColors.gold, marginTop: 3 },
  infoCard: {
    backgroundColor: DesignColors.ivoryCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: DesignColors.borderLight,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: DesignColors.borderLight,
  },
  infoLabel: { fontSize: 12, color: DesignColors.slateGray },
  infoValue: { fontSize: 12, fontWeight: '700', color: DesignColors.navyDeep },
  verifiedTag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedText: { fontSize: 11, fontWeight: '700', color: DesignColors.statusGreen },
  actionRow: { flexDirection: 'row', gap: 12 },
  shareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: DesignColors.gold,
    borderRadius: Radius.md,
    paddingVertical: 13,
  },
  shareBtnText: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: DesignColors.gold,
    borderRadius: Radius.md,
    paddingVertical: 13,
  },
  downloadBtnText: { fontSize: 13, fontWeight: '700', color: DesignColors.navyDeep },
});
