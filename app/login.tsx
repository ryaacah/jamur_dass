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

// ─── Login Screen ─────────────────────────────────────────────────────────────
export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Peringatan', 'Silakan isi email dan password terlebih dahulu.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Gagal Masuk', error.message);
    } else {
      // Ambil profile untuk mengupdate nickname lokal
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profile')
          .select('nickname')
          .eq('id', user.id)
          .single();
        
        if (profile?.nickname) {
          await AsyncStorage.setItem('user_nickname', profile.nickname);
        }
      }
      router.replace('/');
    }
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

      {/* ── Tombol Back ── */}
      <TouchableOpacity
        style={[
          styles.headerBackBtn,
          { position: 'absolute', top: Math.max(insets.top + 16, 24), left: 16, zIndex: 10 },
        ]}
        onPress={() => router.replace('/')}
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
              (pressed || loading) && styles.primaryButtonPressed,
            ]}
            onPress={handleLogin}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Masuk"
          >
            <Text style={styles.primaryButtonText}>{loading ? 'Memuat...' : 'Masuk'}</Text>
          </Pressable>
        </View>

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