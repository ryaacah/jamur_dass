// File: app/b-login.tsx
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import React from 'react';
import {
  Alert,
  Platform,
  Pressable,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { supabase } from '../lib/supabase';
import { colors, styles } from './styles';

WebBrowser.maybeCompleteAuthSession();

const BG_IMAGE = require('../assets/images/bg_splash.png');
const MASCOT_IMAGE = require('../assets/images/splash_icon.png');

const GoogleIcon: React.FC = () => (
  <Svg viewBox="0 0 24 24" width={20} height={20}>
    <Path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <Path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.26 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <Path d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.83z" fill="#FBBC05" />
    <Path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </Svg>
);

const WelcomeScreen: React.FC = () => {
  const router = useRouter();

  const handleGoogleLogin = async () => {
    const redirectUrl = Linking.createURL('/');

    // Simpan ID anonim sebelum login jika ada
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user?.is_anonymous) {
      const { rememberPendingAnonymousUser } = await import('../lib/authDataTransfer');
      await rememberPendingAnonymousUser(currentSession.user.id);
    }

    if (Platform.OS === 'web') {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: Linking.createURL('/'),
          queryParams: { prompt: 'select_account' }
        }
      });
      if (error) Alert.alert('Gagal', error.message);
      return;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      Alert.alert('Gagal', error.message);
      return;
    }

    if (data?.url) {
      const res = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (res.type === 'success' && res.url) {
        let allParams: Record<string, string> = {};
        try {
          const parsed = Linking.parse(res.url);
          if (parsed.queryParams) {
            allParams = { ...allParams, ...parsed.queryParams } as any;
          }

          const hashSplit = res.url.split('#');
          if (hashSplit.length > 1) {
            const hashStr = hashSplit[1].replace('?', '&');
            const hashParams = hashStr.split('&');
            for (const param of hashParams) {
              const [key, val] = param.split('=');
              if (key && val) allParams[key] = decodeURIComponent(val);
            }
          }
        } catch (e) {
          console.error('Error parsing URL:', e);
        }

        if (allParams.access_token && allParams.refresh_token) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: allParams.access_token,
            refresh_token: allParams.refresh_token,
          });

          if (sessionError) {
            Alert.alert('Gagal', sessionError.message);
            return;
          }

          // Claim data anonim
          try {
            const { claimPendingAnonymousData } = await import('../lib/authDataTransfer');
            await claimPendingAnonymousData();
          } catch (e) {
            console.error('Gagal claim anonymous data:', e);
          }

          // Sync profil ke database
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
              const localNickname = await AsyncStorage.getItem('user_nickname');

              const { data: existingProfile } = await supabase
                .from('profile')
                .select('nickname')
                .eq('id', session.user.id)
                .maybeSingle();

              const nickname = existingProfile?.nickname || localNickname || null;

              await supabase.from('profile').upsert({
                id: session.user.id,
                user_id: session.user.id,
                email: session.user.email,
                nickname: nickname,
                is_auth: true,
              }, { onConflict: 'id' });

              if (nickname) {
                await AsyncStorage.setItem('user_nickname', nickname);
              }
              await AsyncStorage.setItem('user_uuid', session.user.id);
            }
          } catch (e) {
            console.error('Gagal sync profil:', e);
          }

          // FIX: Tunggu sebentar agar session Supabase sempat propagate ke
          // seluruh client sebelum navigasi. Tanpa delay ini, index.tsx
          // kadang keburu getSession() sebelum token baru tersedia,
          // sehingga halaman terlihat belum login sampai app di-restart.
          await new Promise(resolve => setTimeout(resolve, 300));

          router.replace('/');
        } else {
          Alert.alert('Gagal', 'Tidak bisa mendapatkan token dari Google.');
        }
      } else if (res.type === 'cancel' || res.type === 'dismiss') {
        console.log('Google login dibatalkan user.');
      }
    }
  };

  const handleEmailLogin = () => {
    router.push('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="transparent" translucent />

      <Image
        source={BG_IMAGE}
        style={styles.bgImage}
        contentFit="cover"
        accessibilityElementsHidden
      />

      <View style={styles.blobBottomLeft} />

      <View style={[styles.content, { flex: 1, justifyContent: 'center' }]}>
        <View style={styles.mascotContainer}>
          <Image
            source={MASCOT_IMAGE}
            style={styles.mascotImage}
            contentFit="contain"
            accessibilityLabel="Mushroom Mascot"
          />
        </View>

        <View style={styles.textBlock}>
          <Text style={styles.appName}>Naung</Text>
          <Text style={styles.tagline}>
            Satu langkah kecil untuk mengenal dirimu lebih dalam.
          </Text>
        </View>
      </View>

      <View style={styles.bottomBox}>
        <Text style={styles.loginTitle}>Mulai Perjalananmu</Text>

        <View style={styles.buttonGroup}>
          <Pressable
            style={({ pressed }) => [
              styles.googleButton,
              pressed && styles.googleButtonPressed,
            ]}
            onPress={handleGoogleLogin}
          >
            <GoogleIcon />
            <Text style={styles.googleButtonText}>Masuk dengan Google</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.emailButton,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={handleEmailLogin}
          >
            <Icon name="email" size={20} color={colors.ink} style={{ marginRight: 8 }} />
            <Text style={styles.primaryButtonText}>Masuk dengan Email</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;