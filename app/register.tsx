import { MaterialIcons as Icon } from '@expo/vector-icons';
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
import { colors, styles } from './styles';

// ─── Register Screen ─────────────────────────────────────────────────────────────
export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleRegister = () => {
    router.replace('/');
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

          {/* Primary Login Button */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={handleRegister}
            accessibilityRole="button"
            accessibilityLabel="Daftar"
          >
            <Text style={styles.primaryButtonText}>Daftar</Text>
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