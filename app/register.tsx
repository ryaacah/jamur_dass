// File: app/register.tsx  ← FIX: nama file typo "resgister" -> "register"
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { claimPendingAnonymousData, rememberPendingAnonymousUser } from '../lib/authDataTransfer';
import { supabase } from '../lib/supabase';
import { colors, styles } from './styles';

const buildSignUpOptions = (nickname: string | null) => ({
  emailRedirectTo: Linking.createURL('/login'),
  ...(nickname ? { data: { nickname } } : {}),
});

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRegister = async () => {
    const emailAddress = email.trim().toLowerCase();

    setErrorMsg('');
    setSuccessMsg('');

    if (!emailAddress || !password || !confirmPassword) {
      setErrorMsg('Silakan isi semua form terlebih dahulu.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Password dan konfirmasi password tidak cocok.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const isAnon = session?.user?.is_anonymous;
      const currentUserId = session?.user?.id;
      const localNickname = await AsyncStorage.getItem('user_nickname');

      if (isAnon && currentUserId) {
        await rememberPendingAnonymousUser(currentUserId);

        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
      }

      const { data, error } = await supabase.auth.signUp({
        email: emailAddress,
        password,
        options: buildSignUpOptions(localNickname),
      });

      if (error) {
        if (
          error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('already in use') ||
          error.message.toLowerCase().includes('user already registered')
        ) {
          setErrorMsg('Email ini sudah terdaftar. Silakan masuk.');
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      // FIX: Tambah pengecekan — Supabase kadang return user tapi session null
      // kalau email confirmation diaktifkan. Ini bukan error, justru flow yang benar.
      if (data?.user) {
        if (data.session) {
          // Langsung aktif (email confirmation dimatikan di Supabase)
          await claimPendingAnonymousData();
          await supabase.from('profile').upsert({
            id: data.user.id,
            user_id: data.user.id,
            email: data.user.email ?? emailAddress,
            nickname: localNickname ?? null,
            is_auth: true,
          }, { onConflict: 'id' });
        }
        // Kalau session null = butuh verifikasi email, tetap lanjut ke pesan sukses
      }

      setSuccessMsg('Akun berhasil dibuat! Cek emailmu untuk verifikasi, lalu masuk.');
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.replace('/login');
      }, 2500);

    } catch (error: any) {
      setErrorMsg(error.message || 'Terjadi kesalahan tidak terduga.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      <ImageBackground
        source={require('../assets/images/bg_splash.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* FIX: Ganti router.replace('/login') -> router.back()
          User bisa datang dari b-login atau login, jadi back() lebih aman */}
      <TouchableOpacity
        style={[
          styles.headerBackBtn,
          { position: 'absolute', top: Math.max(insets.top + 16, 24), left: 16, zIndex: 10 },
        ]}
        onPress={() => router.back()}
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
        <View style={styles.loginHeader}>
          <Text style={styles.loginHeaderTitle}>Daftar</Text>
          <Text style={styles.loginHeaderSubtitle}>
            Buat akun baru untuk memulai perjalananmu.
          </Text>
        </View>

        <View style={styles.formCard}>
          {errorMsg ? (
            <View style={{ backgroundColor: '#FFEBEB', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#FFCDCD' }}>
              <Text style={{ color: colors.accentRed, textAlign: 'center', fontSize: 14, fontFamily: 'Fredoka_400Regular' }}>{errorMsg}</Text>
            </View>
          ) : null}
          {successMsg ? (
            <View style={{ backgroundColor: '#E8F5E9', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#C8E6C9' }}>
              <Text style={{ color: colors.ink, textAlign: 'center', fontSize: 14, fontFamily: 'Fredoka_400Regular' }}>{successMsg}</Text>
            </View>
          ) : null}

          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={[styles.textInput, emailFocused && styles.textInputFocused]}
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

          <View style={[styles.fieldWrapper, styles.passwordWrapper]}>
            <Text style={styles.fieldLabel}>Password</Text>
            <View style={{ justifyContent: 'center' }}>
              <TextInput
                style={[styles.textInput, passwordFocused && styles.textInputFocused, { paddingRight: 50 }]}
                placeholder="Masukkan password Anda"
                placeholderTextColor="rgba(122, 106, 114, 0.6)"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 16, height: '100%', justifyContent: 'center' }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
              >
                <Icon name={showPassword ? 'visibility' : 'visibility-off'} size={24} color="rgba(122, 106, 114, 0.6)" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.fieldWrapper, styles.passwordWrapper]}>
            <Text style={styles.fieldLabel}>Konfirmasi Password</Text>
            <View style={{ justifyContent: 'center' }}>
              <TextInput
                style={[styles.textInput, confirmPasswordFocused && styles.textInputFocused, { paddingRight: 50 }]}
                placeholder="Konfirmasi password Anda"
                placeholderTextColor="rgba(122, 106, 114, 0.6)"
                secureTextEntry={!showConfirmPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: 16, height: '100%', justifyContent: 'center' }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
              >
                <Icon name={showConfirmPassword ? 'visibility' : 'visibility-off'} size={24} color="rgba(122, 106, 114, 0.6)" />
              </TouchableOpacity>
            </View>
          </View>

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

        <View style={styles.loginFooter}>
          <Text style={styles.footerText}>
            Sudah punya akun?{' '}
            <TouchableOpacity onPress={() => router.replace('/login')} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Masuk</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}