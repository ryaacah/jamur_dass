import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { colors, styles } from './styles';

// ─── Register Screen ─────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Peringatan', 'Silakan isi semua form terlebih dahulu.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Gagal', 'Password dan konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    
    // 1. Mendaftarkan akun ke Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
    });

    if (error) {
      setLoading(false);
      // Cek apakah errornya karena email sudah dipakai
      if (error.message.toLowerCase().includes('already registered')) {
        Alert.alert('Gagal', 'Email ini sudah terdaftar. Silakan gunakan email lain atau langsung masuk.');
      } else {
        Alert.alert('Gagal Daftar', error.message);
      }
      return;
    }

    // 2. Jika berhasil, simpan email dan id ke tabel `profile`
    if (data.user) {
      const localNickname = await AsyncStorage.getItem('user_nickname');
      const { error: profileError } = await supabase
        .from('profile')
        .upsert([{ 
          id: data.user.id, 
          email: data.user.email, 
          user_id: data.user.id,
          nickname: localNickname,
          is_auth: true
        }]);

      if (profileError) console.error('Gagal insert profile:', profileError);
    }

    setLoading(false);
    Alert.alert('Berhasil', 'Pendaftaran berhasil! Silakan masuk menggunakan akun tersebut.', [
      { text: 'OK', onPress: () => router.replace('/login') }
    ]);
  };

  const handleLoginRedirect = () => {
    router.replace('/login');
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

      {/* ── Tombol Back ── */}
      <TouchableOpacity
        style={[
          styles.headerBackBtn,
          { position: 'absolute', top: Math.max(insets.top + 16, 24), left: 16, zIndex: 10 },
        ]}
        onPress={() => router.replace('/login')}
        accessibilityRole="button"
        accessibilityLabel="Kembali"
      >
        <Icon name="arrow-back" size={24} color={colors.ink} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.loginScrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.loginHeader}>
          <Text style={styles.loginHeaderTitle}>Daftar</Text>
          <Text style={styles.loginHeaderSubtitle}>
            Buat akun baru untuk memulai perjalananmu.
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

          {/* Confirm Password Field */}
          <View style={[styles.fieldWrapper, styles.passwordWrapper]}>
            <Text style={styles.fieldLabel}>Konfirmasi Password</Text>
            <TextInput
              style={[
                styles.textInput,
                confirmPasswordFocused && styles.textInputFocused,
              ]}
              placeholder="••••••••"
              placeholderTextColor="rgba(122, 106, 114, 0.6)"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => setConfirmPasswordFocused(true)}
              onBlur={() => setConfirmPasswordFocused(false)}
            />
          </View>

          {/* Primary Login Button */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || loading) && styles.primaryButtonPressed,
            ]}
            onPress={handleRegister}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Daftar"
          >
            <Text style={styles.primaryButtonText}>{loading ? 'Memproses...' : 'Daftar'}</Text>
          </Pressable>
        </View>

        {/* ── Footer ── */}
        <View style={styles.loginFooter}>
          <Text style={styles.footerText}>
            Sudah punya akun?{' '}
            <TouchableOpacity onPress={handleLoginRedirect} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Masuk</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}