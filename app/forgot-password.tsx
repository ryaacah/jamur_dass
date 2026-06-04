import { MaterialIcons as Icon } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
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
import { supabase } from '../lib/supabase';
import { colors, styles } from './styles';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [inputFocused, setInputFocused] = useState('');

  const url = Linking.useURL();

  // Memantau deep link jika user mengklik link dari email
  useEffect(() => {
    if (!url) return;
    
    const handleDeepLink = async () => {
      let allParams: Record<string, string> = {};
      
      try {
        const parsed = Linking.parse(url);
        if (parsed.queryParams) {
          allParams = { ...parsed.queryParams } as Record<string, string>;
        }
        
        // Ekstrak parameter dari fragment (hash) jika ada (#access_token=...)
        const hashSplit = url.split('#');
        if (hashSplit.length > 1) {
          const hashStr = hashSplit[1].replace('?', '&'); // jaga-jaga ada tanda tanya
          const hashParams = hashStr.split('&');
          for (const param of hashParams) {
            const [key, val] = param.split('=');
            if (key && val) allParams[key] = decodeURIComponent(val);
          }
        }
      } catch (e) {
        console.error('Error parsing URL:', e);
      }

      if (allParams.error_description) {
        setErrorMsg(allParams.error_description);
        return;
      }

      if (allParams.code) {
        setLoading(true);
        const { error } = await supabase.auth.exchangeCodeForSession(allParams.code);
        setLoading(false);
        
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Email terverifikasi. Silakan buat password baru Anda.');
          setStep(3);
        }
      } else if (allParams.access_token && allParams.refresh_token) {
        setLoading(true);
        const { error } = await supabase.auth.setSession({
          access_token: allParams.access_token,
          refresh_token: allParams.refresh_token,
        });
        setLoading(false);
        
        if (error) {
          setErrorMsg(error.message);
        } else {
          setSuccessMsg('Email terverifikasi. Silakan buat password baru Anda.');
          setStep(3);
        }
      }
    };

    handleDeepLink();
  }, [url]);

  const handleRequestLink = async () => {
    const emailAddress = email.trim().toLowerCase();
    setErrorMsg('');
    setSuccessMsg('');

    if (!emailAddress) {
      setErrorMsg('Silakan isi email Anda.');
      return;
    }

    setLoading(true);
    try {
      const resetRedirectTo = Linking.createURL('/forgot-password');
      const { error } = await supabase.auth.resetPasswordForEmail(emailAddress, {
        redirectTo: resetRedirectTo,
      });
      
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      
      setSuccessMsg('Link reset password telah dikirim ke email Anda. Silakan cek inbox/spam Anda dan klik link tersebut.');
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword || !confirmPassword) {
      setErrorMsg('Silakan isi semua kolom password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password minimal 6 karakter.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        setErrorMsg(error.message);
        return;
      }
      
      setSuccessMsg('Password berhasil diubah! Anda akan dialihkan ke halaman login...');
      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1 && !successMsg.includes('dialihkan')) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
      setErrorMsg('');
      setSuccessMsg('');
    } else {
      router.back();
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
        onPress={handleBack}
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
          <Text style={styles.loginHeaderTitle}>Lupa Password</Text>
          <Text style={styles.loginHeaderSubtitle}>
            {step === 1 && 'Masukkan email untuk mendapatkan link reset.'}
            {step === 2 && 'Cek email Anda dan klik link yang dikirimkan.'}
            {step === 3 && 'Buat password baru Anda.'}
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

          {step === 1 && (
            <>
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>Email</Text>
                <TextInput
                  style={[styles.textInput, inputFocused === 'email' && styles.textInputFocused]}
                  placeholder="contoh@email.com"
                  placeholderTextColor="rgba(122, 106, 114, 0.6)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setInputFocused('email')}
                  onBlur={() => setInputFocused('')}
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  (pressed || loading) && styles.primaryButtonPressed,
                ]}
                onPress={handleRequestLink}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>{loading ? 'Memuat...' : 'Kirim Link Reset'}</Text>
              </Pressable>
            </>
          )}

          {step === 2 && (
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Icon name="mark-email-read" size={64} color={colors.primary} style={{ marginBottom: 16 }} />
              <Text style={{ fontFamily: 'Fredoka_500Medium', fontSize: 16, color: colors.ink, textAlign: 'center' }}>
                Menunggu Anda mengklik link di email...
              </Text>
              <Text style={{ fontFamily: 'Fredoka_400Regular', fontSize: 14, color: 'gray', textAlign: 'center', marginTop: 8 }}>
                Jika sudah diklik dan berhasil, halaman ini akan otomatis berubah.
              </Text>
            </View>
          )}

          {step === 3 && (
            <>
              <View style={styles.fieldWrapper}>
                <Text style={styles.fieldLabel}>Password Baru</Text>
                <TextInput
                  style={[styles.textInput, inputFocused === 'new' && styles.textInputFocused]}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(122, 106, 114, 0.6)"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  onFocus={() => setInputFocused('new')}
                  onBlur={() => setInputFocused('')}
                />
              </View>

              <View style={[styles.fieldWrapper, styles.passwordWrapper]}>
                <Text style={styles.fieldLabel}>Konfirmasi Password</Text>
                <TextInput
                  style={[styles.textInput, inputFocused === 'confirm' && styles.textInputFocused]}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(122, 106, 114, 0.6)"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  onFocus={() => setInputFocused('confirm')}
                  onBlur={() => setInputFocused('')}
                />
              </View>

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  (pressed || loading) && styles.primaryButtonPressed,
                ]}
                onPress={handleUpdatePassword}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>{loading ? 'Memuat...' : 'Simpan Password'}</Text>
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
