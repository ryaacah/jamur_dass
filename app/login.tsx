import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
    ImageBackground,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { styles } from './styles';

// ─── Login Screen ─────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = () => {
    router.replace('/');
  };

  const handleGoogleLogin = () => {
    router.replace('/');
  };

  const handleRegister = () => {
    router.replace('./register');
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      {/* Background Image */}
      <ImageBackground
        source={require('../assets/images/bg_splash.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <ScrollView
        contentContainerStyle={styles.loginScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.loginHeader}>
          <Text style={styles.loginHeaderTitle}>Masuk</Text>
          <Text style={styles.loginHeaderSubtitle}>
            Selamat datang kembali di ruang amanmu.
          </Text>
        </View>

        {/* ── Form Card ── */}
        <View style={styles.formCard}>
          {/* Email Field */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={[
                styles.textInput,
                emailFocused && styles.textInputFocused,
              ]}
              placeholder="contoh@email.com"
              placeholderTextColor="rgba(122, 106, 114, 0.6)"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
            />
          </View>

          {/* Password Field */}
          <View style={[styles.fieldWrapper, styles.passwordWrapper]}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              style={[
                styles.textInput,
                passwordFocused && styles.textInputFocused,
              ]}
              placeholder="••••••••"
              placeholderTextColor="rgba(122, 106, 114, 0.6)"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
          </View>

          {/* Primary Login Button */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={handleLogin}
            accessibilityRole="button"
            accessibilityLabel="Masuk"
          >
            <Text style={styles.primaryButtonText}>Masuk</Text>
          </Pressable>
        </View>

        {/* ── Divider ── */}
        <View style={styles.dividerWrapper}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Atau</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── Google Button ── */}
        <Pressable
          style={({ pressed }) => [
            styles.googleButton,
            pressed && styles.googleButtonPressed,
          ]}
          onPress={handleGoogleLogin}
          accessibilityRole="button"
          accessibilityLabel="Masuk lewat Google"
        >
          <Image 
            source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }} 
            style={{ width: 20, height: 20 }} 
            contentFit="contain" 
          />
          <Text style={styles.googleButtonText}>Masuk lewat Google</Text>
        </Pressable>

        {/* ── Footer ── */}
        <View style={styles.loginFooter}>
          <Text style={styles.footerText}>
            Belum punya akun?{' '}
            <TouchableOpacity onPress={handleRegister} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Buat akun</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}