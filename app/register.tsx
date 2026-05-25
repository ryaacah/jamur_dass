import { MaterialIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { supabase } from '../lib/supabase';
import { colors, styles } from './styles';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
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
    if (password.length < 6) {
      Alert.alert('Gagal', 'Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const isAnon = session?.user?.is_anonymous;
      const currentUserId = session?.user?.id;

      if (isAnon && currentUserId) {
        // ── Flow: Convert akun anonim ke permanen ──
        const { error } = await supabase.auth.updateUser({
          email: email.trim(),
          password: password,
        });

        if (error) {
          setLoading(false);
          Alert.alert('Gagal Daftar', error.message);
          return;
        }

        // Update profile yang sudah ada, jangan buat baru
        const localNickname = await AsyncStorage.getItem('user_nickname');
        await supabase
          .from('profile')
          .update({
            email: email.trim(),
            is_auth: true,
            ...(localNickname ? { nickname: localNickname } : {}),
          })
          .eq('id', currentUserId);

        setLoading(false);
        Alert.alert(
          'Verifikasi Email',
          'Cek emailmu untuk konfirmasi, lalu masuk kembali dengan akun barumu.',
          [{
            text: 'OK',
            onPress: async () => {
              await supabase.auth.signOut();
              router.replace('/login');
            },
          }]
        );

      } else {
        // ── Flow: Daftar akun baru ──
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (error) {
          setLoading(false);
          if (
            error.message.toLowerCase().includes('already registered') ||
            error.message.toLowerCase().includes('already in use')
          ) {
            Alert.alert('Gagal', 'Email ini sudah terdaftar. Silakan masuk.');
          } else {
            Alert.alert('Gagal Daftar', error.message);
          }
          return;
        }

        if (data?.user) {
          const localNickname = await AsyncStorage.getItem('user_nickname');
          await supabase.from('profile').upsert([{
            id: data.user.id,
            user_id: data.user.id,
            email: data.user.email,
            nickname: localNickname ?? null,
            is_auth: true,
          }]);
        }

        setLoading(false);
        Alert.alert(
          'Berhasil',
          'Akun berhasil dibuat! Cek emailmu untuk verifikasi, lalu masuk.',
          [{
            text: 'OK',
            onPress: async () => {
              await supabase.auth.signOut();
              router.replace('/login');
            },
          }]
        );
      }
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Kesalahan', error.message || 'Terjadi kesalahan tidak terduga.');
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
        <View style={styles.loginHeader}>
          <Text style={styles.loginHeaderTitle}>Daftar</Text>
          <Text style={styles.loginHeaderSubtitle}>
            Buat akun baru untuk memulai perjalananmu.
          </Text>
        </View>

        <View style={styles.formCard}>
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
            <TextInput
              style={[styles.textInput, passwordFocused && styles.textInputFocused]}
              placeholder="••••••••"
              placeholderTextColor="rgba(122, 106, 114, 0.6)"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
            />
          </View>

          <View style={[styles.fieldWrapper, styles.passwordWrapper]}>
            <Text style={styles.fieldLabel}>Konfirmasi Password</Text>
            <TextInput
              style={[styles.textInput, confirmPasswordFocused && styles.textInputFocused]}
              placeholder="••••••••"
              placeholderTextColor="rgba(122, 106, 114, 0.6)"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => setConfirmPasswordFocused(true)}
              onBlur={() => setConfirmPasswordFocused(false)}
            />
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