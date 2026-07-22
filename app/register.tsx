import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Silakan isi semua kolom.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Kata sandi minimal harus 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update display name inside Firebase Auth
      await updateProfile(user, { displayName: name });

      // Save additional profile details to Firestore (isolated to prevent blocking on database timeout)
      try {
        console.log('Mulai menyimpan data pengguna ke Firestore...');
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name,
          displayName: name,
          email,
          role: 'peserta', // Default role is participant
          createdAt: new Date().toISOString(),
        });
        console.log('Berhasil menyimpan data pengguna ke Firestore.');
      } catch (dbError: any) {
        console.error('Gagal menulis ke Firestore (kemungkinan Firestore belum diaktifkan di Firebase Console):', dbError);
      }

      Alert.alert('Registrasi Berhasil', 'Akun Anda telah berhasil dibuat!', [
        {
          text: 'OK',
          onPress: () => router.replace('/login'),
        },
      ]);
    } catch (error: any) {
      let errorMessage = 'Terjadi kesalahan saat mendaftar.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email sudah digunakan oleh akun lain.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Kata sandi terlalu lemah.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Koneksi internet bermasalah.';
      }
      Alert.alert('Registrasi Gagal', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Theme colors
  const bgTheme = isDark ? '#111314' : '#FAFAFA';
  const cardBgTheme = isDark ? '#1A1D1E' : '#FFFFFF';
  const textTheme = isDark ? '#ECEDEE' : '#1F2937';
  const subtitleTheme = isDark ? '#9BA1A6' : '#6B7280';
  const inputBgTheme = isDark ? '#232729' : '#F3F4F6';
  const inputBorderTheme = isDark ? '#2E3336' : '#E5E7EB';
  const primaryTheme = '#D4AF37'; // Golden Accent

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: bgTheme }]}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textTheme} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: textTheme }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: subtitleTheme }]}>Sign up to start tracking achievements</Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardBgTheme }]}>
          {/* Full Name Input */}
          <Text style={[styles.inputLabel, { color: textTheme }]}>Full Name</Text>
          <View style={[styles.inputContainer, { backgroundColor: inputBgTheme, borderColor: inputBorderTheme }]}>
            <Ionicons name="person-outline" size={20} color={subtitleTheme} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textTheme }]}
              placeholder="Enter your full name"
              placeholderTextColor={isDark ? '#6B7280' : '#A0AEC0'}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          </View>

          {/* Email Input */}
          <Text style={[styles.inputLabel, { color: textTheme, marginTop: 16 }]}>Email Address</Text>
          <View style={[styles.inputContainer, { backgroundColor: inputBgTheme, borderColor: inputBorderTheme }]}>
            <Ionicons name="mail-outline" size={20} color={subtitleTheme} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textTheme }]}
              placeholder="Enter your email"
              placeholderTextColor={isDark ? '#6B7280' : '#A0AEC0'}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <Text style={[styles.inputLabel, { color: textTheme, marginTop: 16 }]}>Password</Text>
          <View style={[styles.inputContainer, { backgroundColor: inputBgTheme, borderColor: inputBorderTheme }]}>
            <Ionicons name="lock-closed-outline" size={20} color={subtitleTheme} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textTheme }]}
              placeholder="Create a password"
              placeholderTextColor={isDark ? '#6B7280' : '#A0AEC0'}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={subtitleTheme}
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password Input */}
          <Text style={[styles.inputLabel, { color: textTheme, marginTop: 16 }]}>Confirm Password</Text>
          <View style={[styles.inputContainer, { backgroundColor: inputBgTheme, borderColor: inputBorderTheme }]}>
            <Ionicons name="lock-closed-outline" size={20} color={subtitleTheme} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: textTheme }]}
              placeholder="Confirm your password"
              placeholderTextColor={isDark ? '#6B7280' : '#A0AEC0'}
              secureTextEntry={!showPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              autoCapitalize="none"
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            style={[styles.registerButton, { backgroundColor: primaryTheme, marginTop: 24 }]} 
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Navigation */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: subtitleTheme }]}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={[styles.loginText, { color: primaryTheme }]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    padding: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    borderRadius: 20,
    padding: 24,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 50,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
  },
  eyeIcon: {
    padding: 4,
  },
  registerButton: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
