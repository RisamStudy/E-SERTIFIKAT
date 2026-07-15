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
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../config/firebase';

export default function LupaPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Silakan masukkan email Anda.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSubmitted(true);
    } catch (error: any) {
      let errorMessage = 'Gagal mengirim email reset password.';
      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Format email tidak valid.';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'Email tidak terdaftar.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Koneksi internet bermasalah.';
      }
      Alert.alert('Gagal', errorMessage);
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
          <Text style={[styles.title, { color: textTheme }]}>Reset Password</Text>
          <Text style={[styles.subtitle, { color: subtitleTheme }]}>
            {submitted
              ? 'Check your inbox for reset instructions'
              : 'Enter your email to receive a password reset link'}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: cardBgTheme }]}>
          {!submitted ? (
            <>
              {/* Email Input */}
              <Text style={[styles.inputLabel, { color: textTheme }]}>Email Address</Text>
              <View style={[styles.inputContainer, { backgroundColor: inputBgTheme, borderColor: inputBorderTheme }]}>
                <Ionicons name="mail-outline" size={20} color={subtitleTheme} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: textTheme }]}
                  placeholder="Enter your registered email"
                  placeholderTextColor={isDark ? '#6B7280' : '#A0AEC0'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.resetButton, { backgroundColor: primaryTheme, marginTop: 24 }]}
                onPress={handleReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.resetButtonText}>Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successContainer}>
              <View style={[styles.successIconWrapper, { backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}>
                <Ionicons name="checkmark-circle-outline" size={60} color={primaryTheme} />
              </View>
              <Text style={[styles.successTitle, { color: textTheme }]}>Request Sent!</Text>
              <Text style={[styles.successDescription, { color: subtitleTheme }]}>
                We&apos;ve sent a password reset link to {email || 'your email'}. Please check your inbox.
              </Text>
              <TouchableOpacity
                style={[styles.resetButton, { backgroundColor: primaryTheme, marginTop: 24 }]}
                onPress={() => router.replace('/login')}
              >
                <Text style={styles.resetButtonText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          )}
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
    paddingHorizontal: 16,
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
  resetButton: {
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
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  successDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
});
