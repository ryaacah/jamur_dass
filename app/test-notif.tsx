// app/test-notif.tsx
// File ini HANYA untuk testing — hapus sebelum release!

import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  addNotificationToInbox,
  getInboxNotifications,
  loadNotificationSettings,
  markAllInboxAsRead,
} from '../lib/notifications';

function isExpoGo(): boolean {
  return Constants.executionEnvironment === 'storeClient';
}

export default function TestNotifScreen() {
  const router = useRouter();
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString('id-ID');
    setLog((prev) => [`[${time}] ${msg}`, ...prev]);
  };

  // ── Test 1: Cek environment ──────────────────────────────────────────────
  const checkEnvironment = () => {
    const env = Constants.executionEnvironment;
    const expoGo = isExpoGo();
    addLog(`Environment: ${env}`);
    addLog(`Expo Go: ${expoGo ? 'YA ⚠️ (notif dinonaktifkan)' : 'TIDAK ✅ (notif aktif)'}`);
  };

  // ── Test 2: Load settings ────────────────────────────────────────────────
  const checkSettings = async () => {
    try {
      const settings = await loadNotificationSettings();
      addLog(`notifEnabled: ${settings.notifEnabled}`);
      addLog(`moodTimes: ${settings.moodTimes.join(', ')}`);
      addLog(`jurnalTimes: ${settings.jurnalTimes.join(', ')}`);
      addLog(`assesmenDays: ${settings.assesmenDays.join(', ')}`);
      addLog(`assesmenTimes: ${settings.assesmenTimes.join(', ')}`);
    } catch (e: any) {
      addLog(`ERROR load settings: ${e.message}`);
    }
  };

  // ── Test 3: Tambah notif ke inbox (test in-app inbox) ────────────────────
  const testAddInbox = async (type: 'mood' | 'journal' | 'assessment') => {
    try {
      const now = new Date();
      const timeString = `${now.getHours().toString().padStart(2, '0')}:${now
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;

      const contentMap = {
        mood: {
          title: 'Waktunya Trak Mood! 🎭',
          body: 'Bagaimana perasaanmu hari ini?',
        },
        journal: {
          title: 'Jurnal Harianmu Menunggu 📖',
          body: 'Ada cerita apa hari ini?',
        },
        assessment: {
          title: 'Waktunya Self Assessment 📝',
          body: 'Mari cek kondisi mentalmu dengan kuesioner DASS-21.',
        },
      };

      await addNotificationToInbox({
        type,
        title: contentMap[type].title,
        body: contentMap[type].body,
        time: `Hari ini, ${timeString}`,
      });

      addLog(`✅ Notif "${type}" berhasil ditambah ke inbox`);
    } catch (e: any) {
      addLog(`ERROR tambah inbox: ${e.message}`);
    }
  };

  // ── Test 4: Baca inbox ───────────────────────────────────────────────────
  const checkInbox = async () => {
    try {
      const inbox = await getInboxNotifications();
      addLog(`Inbox: ${inbox.length} notifikasi`);
      inbox.slice(0, 3).forEach((n, i) => {
        addLog(`  [${i + 1}] ${n.type} | ${n.title} | read: ${n.isRead}`);
      });
      if (inbox.length > 3) addLog(`  ... dan ${inbox.length - 3} lainnya`);
    } catch (e: any) {
      addLog(`ERROR baca inbox: ${e.message}`);
    }
  };

  // ── Test 5: Mark all read ────────────────────────────────────────────────
  const testMarkAllRead = async () => {
    try {
      const updated = await markAllInboxAsRead();
      addLog(`✅ Semua notif ditandai sudah dibaca (${updated.length} item)`);
    } catch (e: any) {
      addLog(`ERROR mark all read: ${e.message}`);
    }
  };

  // ── Test 6: Clear inbox ──────────────────────────────────────────────────
  const clearInbox = async () => {
    try {
      await AsyncStorage.removeItem('app_notifications_inbox');
      addLog('✅ Inbox dikosongkan');
    } catch (e: any) {
      addLog(`ERROR clear inbox: ${e.message}`);
    }
  };

  // ── Test 7: Cek scheduled notifications (dev build only) ─────────────────
  const checkScheduled = async () => {
    if (isExpoGo()) {
      addLog('⚠️ Expo Go: scheduled notifications tidak tersedia');
      return;
    }
    try {
      const Notifications = await import('expo-notifications');
      if (typeof Notifications.getAllScheduledNotificationsAsync !== 'function') {
        addLog('getAllScheduledNotificationsAsync tidak tersedia');
        return;
      }
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      addLog(`Scheduled notifications: ${scheduled.length} item`);
      scheduled.slice(0, 5).forEach((n, i) => {
        addLog(`  [${i + 1}] ${n.content.title}`);
      });
    } catch (e: any) {
      addLog(`ERROR cek scheduled: ${e.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Kembali</Text>
        </TouchableOpacity>
        <Text style={styles.title}>🔔 Test Notifikasi</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Environment */}
        <Text style={styles.sectionTitle}>1. Environment</Text>
        <TouchableOpacity style={styles.btn} onPress={checkEnvironment}>
          <Text style={styles.btnText}>Cek Environment</Text>
        </TouchableOpacity>

        {/* Settings */}
        <Text style={styles.sectionTitle}>2. Settings (AsyncStorage)</Text>
        <TouchableOpacity style={styles.btn} onPress={checkSettings}>
          <Text style={styles.btnText}>Cek Saved Settings</Text>
        </TouchableOpacity>

        {/* Inbox */}
        <Text style={styles.sectionTitle}>3. In-App Inbox (berfungsi di Expo Go)</Text>
        <View style={styles.row}>
          <TouchableOpacity
            style={[styles.btn, styles.btnSmall, { backgroundColor: '#a8e6cf' }]}
            onPress={() => testAddInbox('mood')}
          >
            <Text style={styles.btnText}>+ Mood</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnSmall, { backgroundColor: '#ffd3b6' }]}
            onPress={() => testAddInbox('journal')}
          >
            <Text style={styles.btnText}>+ Jurnal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnSmall, { backgroundColor: '#d4a5f5' }]}
            onPress={() => testAddInbox('assessment')}
          >
            <Text style={styles.btnText}>+ Assesmen</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.btn} onPress={checkInbox}>
          <Text style={styles.btnText}>Lihat Isi Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={testMarkAllRead}>
          <Text style={styles.btnText}>Mark All Read</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#ffb3b3' }]}
          onPress={clearInbox}
        >
          <Text style={styles.btnText}>🗑 Kosongkan Inbox</Text>
        </TouchableOpacity>

        {/* Scheduled (dev build only) */}
        <Text style={styles.sectionTitle}>4. Scheduled Notif (dev build only)</Text>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#b3d4ff' }]}
          onPress={checkScheduled}
        >
          <Text style={styles.btnText}>Cek Scheduled Notifications</Text>
        </TouchableOpacity>

        {/* Log */}
        <Text style={styles.sectionTitle}>Log:</Text>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#eee' }]}
          onPress={() => setLog([])}
        >
          <Text style={[styles.btnText, { color: '#666' }]}>Bersihkan Log</Text>
        </TouchableOpacity>

        <View style={styles.logBox}>
          {log.length === 0 ? (
            <Text style={styles.logEmpty}>Belum ada log. Tekan tombol di atas.</Text>
          ) : (
            log.map((line, i) => (
              <Text key={i} style={styles.logLine}>{line}</Text>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backBtn: { marginBottom: 8 },
  backText: { fontSize: 14, color: '#666' },
  title: { fontSize: 20, fontWeight: 'bold' },
  scroll: { flex: 1, paddingHorizontal: 20 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#888',
    marginTop: 20,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  btn: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  btnSmall: { flex: 1, marginHorizontal: 4 },
  btnText: { fontWeight: '600', fontSize: 14 },
  row: { flexDirection: 'row', marginBottom: 8 },
  logBox: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    minHeight: 120,
  },
  logEmpty: { color: '#666', fontSize: 13 },
  logLine: {
    color: '#00ff88',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
});