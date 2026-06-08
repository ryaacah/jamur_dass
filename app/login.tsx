// File: app/login.tsx
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

const emailRedirectTo = Linking.createURL('/login');

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showResend, setShowResend] = useState(false);

  const handleLogin = async () => {
    const emailAddress = email.trim().toLowerCase();

    setErrorMsg('');
    setSuccessMsg('');
    setShowResend(false);

    if (!emailAddress || !password) {
      setErrorMsg('Silakan isi email dan password terlebih dahulu.');
      return;
    }

    setLoading(true);

    try {
      // FIX: Simpan anonymous user ID sebelum sign in, sama seperti di b-login.tsx
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user?.is_anonymous) {
        await rememberPendingAnonymousUser(currentSession.user.id);
        // Sign out dari sesi anonim sebelum login dengan akun baru
        await supabase.auth.signOut();
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailAddress,
        password,
      });

      if (error) {
        const errorMessage = error.message.toLowerCase();

        if (errorMessage.includes('email not confirmed')) {
          setErrorMsg('Email belum diverifikasi. Cek inbox emailmu lalu klik link verifikasi.');
          setShowResend(true);
          return;
        }

        if (errorMessage.includes('invalid login credentials') || errorMessage.includes('invalid credentials')) {
          setErrorMsg('Email atau password salah. Pastikan email sudah diverifikasi.');
          return;
        }

        setErrorMsg(error.message || 'Gagal masuk. Coba lagi.');
        return;
      }

      if (data.user) {
        await claimPendingAnonymousData();

        const { data: profile } = await supabase
          .from('profile')
          .select('nickname')
          .eq('id', data.user.id)
          .maybeSingle();

        const localNickname = await AsyncStorage.getItem('user_nickname');
        const nickname = profile?.nickname || localNickname || null;

        await supabase.from('profile').upsert({
          id: data.user.id,
          user_id: data.user.id,
          email: data.user.email ?? emailAddress,
          nickname,
          is_auth: true,
        }, { onConflict: 'id' });

        if (nickname) {
          await AsyncStorage.setItem('user_nickname', nickname);
        }

        await AsyncStorage.setItem('user_uuid', data.user.id);
      }

      router.replace('/');
    } catch (err: any) {
      console.error('Error Fatal:', err);
      setErrorMsg(err.message || 'Gagal mengeksekusi login.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setErrorMsg('');
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo },
    });

    if (resendError) {
      setErrorMsg(resendError.message);
      return;
    }

    setSuccessMsg('Email verifikasi baru sudah dikirim.');
    setShowResend(false);
  };

  const handleRegister = () => {
    router.replace('/register');
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      <ImageBackground
        source={require('../assets/images/bg_splash.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* FIX: Ganti router.push('/') -> router.back() supaya tidak numpuk history */}
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
          <Text style={styles.loginHeaderTitle}>Masuk</Text>
          <Text style={styles.loginHeaderSubtitle}>
            Selamat datang kembali di ruang amanmu.
          </Text>
        </View>

        <View style={styles.formCard}>
          {errorMsg ? (
            <View style={{ backgroundColor: '#FFEBEB', padding: 12, borderRadius: 8, marginBottom: 16, borderWidth: 1, borderColor: '#FFCDCD' }}>
              <Text style={{ color: colors.accentRed, textAlign: 'center', fontSize: 14, fontFamily: 'Fredoka_400Regular' }}>{errorMsg}</Text>
              {showResend && (
                <TouchableOpacity onPress={handleResend} style={{ marginTop: 8 }}>
                  <Text style={{ color: colors.accentBlue, textAlign: 'center', fontFamily: 'Fredoka_700Bold', fontSize: 14 }}>Kirim Ulang Email</Text>
                </TouchableOpacity>
              )}
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

          <View style={{ alignItems: 'flex-end', marginBottom: 20 }}>
            <TouchableOpacity onPress={() => router.push('/forgot-password')}>
              <Text style={{ color: colors.accentBlue, fontFamily: 'Fredoka_500Medium', fontSize: 14 }}>
                Lupa Password?
              </Text>
            </TouchableOpacity>
          </View>

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