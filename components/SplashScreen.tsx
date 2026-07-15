import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated, Image, useColorScheme, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function SplashScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  // Animation value for translateY
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Smooth floating animation loop (1 second up, 1 second down)
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -18, // float up by 18 units
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0, // return to original position
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  // Determine styles based on theme
  const bgTheme = isDark ? '#111314' : '#FFFFFF';
  const textTheme = isDark ? '#ECEDEE' : '#1F2937';
  const subtitleTheme = isDark ? '#9BA1A6' : '#6B7280';
  const ringColor = isDark ? 'rgba(212, 175, 55, 0.1)' : 'rgba(212, 175, 55, 0.2)';

  return (
    <View style={[styles.container, { backgroundColor: bgTheme }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.centerContainer}>
        {/* Ring background decorations (mimicking the prompt image) */}
        <View style={[styles.outerRing, { borderColor: ringColor }]} />
        <View style={[styles.innerRing, { borderColor: ringColor }]} />
        
        {/* Animated logo wrapper */}
        <Animated.View style={[styles.logoWrapper, { transform: [{ translateY: floatAnim }] }]}>
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Brand texts */}
        <Text style={[styles.brandName, { color: textTheme }]}>CertifyElite</Text>
        <Text style={[styles.subtitle, { color: subtitleTheme }]}>
          ACADEMIC EXCELLENCE &{'\n'}RECOGNITION
        </Text>
      </View>

      {/* Footer text */}
      <View style={styles.footerContainer}>
        <View style={[styles.footerLine, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />
        <Text style={[styles.footerText, { color: subtitleTheme }]}>
          PROFESSIONAL CREDENTIALING PORTAL
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: '100%',
    paddingHorizontal: 24,
  },
  outerRing: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 1,
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  innerRing: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 1,
    opacity: 0.8,
  },
  logoWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#D4AF37',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 8px 32px rgba(212, 175, 55, 0.12)',
      },
    }),
  },
  logo: {
    width: 100,
    height: 100,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 40,
    letterSpacing: 0.5,
    fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', web: 'system-ui' }),
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  footerContainer: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
    width: '100%',
  },
  footerLine: {
    width: 120,
    height: 1,
    marginBottom: 16,
  },
  footerText: {
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 2.5,
    textAlign: 'center',
    opacity: 0.7,
  },
});
