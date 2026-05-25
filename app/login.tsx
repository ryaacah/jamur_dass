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

    // Kita gunakan setTimeout 100ms agar UI sempat memperbarui tulisan tombol jadi "Memuat..."
    setTimeout(async () => {
      try {
        console.log('--- Mulai Test AsyncStorage ---');
        // Test apakah AsyncStorage hang
        await AsyncStorage.setItem('test_key', 'test_value');
        console.log('AsyncStorage aman.');

        console.log('--- Mulai request Supabase ---');
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          setLoading(false);
          Alert.alert('Gagal Masuk', error.message);
          return;
        }

        if (data.user) {
          const { data: profile } = await supabase
            .from('profile')
            .select('nickname')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profile?.nickname) {
            await AsyncStorage.setItem('user_nickname', profile.nickname);
          }
        }

        setLoading(false);
        Alert.alert(
          'Berhasil',
          'Login berhasil! Klik Lanjut untuk ke halaman utama.',
          [
            {
              text: 'Lanjut',
              onPress: () => {
                router.replace('/');
              }
            }
          ]
        );

      } catch (err: any) {
        setLoading(false);
        console.error('Error Fatal:', err);
        Alert.alert('Error Sistem', err.message || 'Gagal mengeksekusi login.');
      }
    }, 100);
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

      <TouchableOpacity
        style={[
          styles.headerBackBtn,
          { position: 'absolute', top: Math.max(insets.top + 16, 24), left: 16, zIndex: 10 },
        ]}
        onPress={() => router.push('/')}
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