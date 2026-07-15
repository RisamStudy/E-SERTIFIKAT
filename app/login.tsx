import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Silakan isi semua kolom.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Force refresh token to get the latest custom claims
      const idTokenResult = await user.getIdTokenResult(true);

      let isAdmin = !!idTokenResult.claims.admin;

      // Cadangan: Cek ke Firestore jika klaim token belum sinkron di client
      if (!isAdmin) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            isAdmin = true;
          }
        } catch (dbError) {
          console.log('Gagal mengecek role di Firestore:', dbError);
        }
      }

      if (isAdmin) {
        router.replace('/admin/dashboard');
      } else {
        router.replace('/peserta/dashboard');
      }
    } catch (error: any) {
      let errorMessage = 'Terjadi kesalahan saat masuk.';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid.';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Email atau password salah.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Koneksi internet bermasalah.';
      }
      Alert.alert('Login Gagal', errorMessage);
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
        <View style={styles.header}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={[styles.title, { color: textTheme }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: subtitleTheme }]}>Sign in to access your certificates</Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardBgTheme }]}>
          {/* Email Input */}
          <Text style={[styles.inputLabel, { color: textTheme }]}>Email Address</Text>
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
              placeholder="Enter your password"
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

          {/* Forgot Password */}
          <TouchableOpacity onPress={() => router.push('/lupa_password')} style={styles.forgotPasswordContainer}>
            <Text style={[styles.forgotPasswordText, { color: primaryTheme }]}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            style={[styles.loginButton, { backgroundColor: primaryTheme }]} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer Navigation */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: subtitleTheme }]}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <Text style={[styles.registerText, { color: primaryTheme }]}>Register Now</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
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
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loginButton: {
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
  loginButtonText: {
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
  registerText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
