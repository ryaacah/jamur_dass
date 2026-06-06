// notifications.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

export type NotificationType = 'mood' | 'journal' | 'assessment';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
}

const DAY_MAPPING: Record<string, number> = {
  Ming: 1, Sen: 2, Sel: 3, Rab: 4, Kam: 5, Jum: 6, Sab: 7,
};

// ─── Helper: cek apakah running di Expo Go ────────────────────────────────────
function isExpoGo(): boolean {
  return Constants.executionEnvironment === 'storeClient';
}

// ─── Save Settings to AsyncStorage ───────────────────────────────────────────
export async function saveNotificationSettings(updates: {
  notifEnabled?: boolean;
  moodTimes?: string[];
  jurnalTimes?: string[];
  assesmenDays?: string[];
  assesmenTimes?: string[];
}) {
  if (updates.notifEnabled !== undefined)
    await AsyncStorage.setItem('notif_enabled', String(updates.notifEnabled));
  if (updates.moodTimes !== undefined)
    await AsyncStorage.setItem('notif_mood_times', JSON.stringify(updates.moodTimes));
  if (updates.jurnalTimes !== undefined)
    await AsyncStorage.setItem('notif_jurnal_times', JSON.stringify(updates.jurnalTimes));
  if (updates.assesmenDays !== undefined)
    await AsyncStorage.setItem('notif_assesmen_days', JSON.stringify(updates.assesmenDays));
  if (updates.assesmenTimes !== undefined)
    await AsyncStorage.setItem('notif_assesmen_times', JSON.stringify(updates.assesmenTimes));
}

// ─── Load Settings from AsyncStorage ─────────────────────────────────────────
export async function loadNotificationSettings() {
  const notifEnabledStr = await AsyncStorage.getItem('notif_enabled');
  const moodTimesStr = await AsyncStorage.getItem('notif_mood_times');
  const jurnalTimesStr = await AsyncStorage.getItem('notif_jurnal_times');
  const assesmenDaysStr = await AsyncStorage.getItem('notif_assesmen_days');
  const assesmenTimesStr = await AsyncStorage.getItem('notif_assesmen_times');

  return {
    notifEnabled: notifEnabledStr !== 'false',
    moodTimes: moodTimesStr ? JSON.parse(moodTimesStr) : ['21:00'],
    jurnalTimes: jurnalTimesStr ? JSON.parse(jurnalTimesStr) : ['21:00'],
    assesmenDays: assesmenDaysStr
      ? JSON.parse(assesmenDaysStr)
      : ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Ming'],
    assesmenTimes: assesmenTimesStr ? JSON.parse(assesmenTimesStr) : ['12:00'],
  };
}

// ─── Sync Scheduled Notifications ────────────────────────────────────────────
export async function syncScheduledNotifications() {
  if (Platform.OS === 'web') return;

  // Expo Go SDK 53+ tidak support scheduled notifications
  if (isExpoGo()) {
    console.log('Expo Go terdeteksi — scheduled notifications dinonaktifkan.');
    return;
  }

  try {
    const Notifications = await import('expo-notifications');

    if (typeof Notifications.cancelAllScheduledNotificationsAsync !== 'function') {
      console.log('cancelAllScheduledNotificationsAsync tidak tersedia, skip.');
      return;
    }

    await Notifications.cancelAllScheduledNotificationsAsync();

    const {
      notifEnabled, moodTimes, jurnalTimes, assesmenDays, assesmenTimes,
    } = await loadNotificationSettings();

    if (!notifEnabled) return;

    const parseTime = (t: string) => {
      const [hour, minute] = t.split(':').map(Number);
      return { hour, minute };
    };

    for (const t of moodTimes) {
      const { hour, minute } = parseTime(t);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Waktunya Trak Mood! 🎭',
          body: 'Bagaimana perasaanmu hari ini? Yuk, luangkan waktu sebentar untuk mencatatnya.',
          data: { type: 'mood' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    }

    for (const t of jurnalTimes) {
      const { hour, minute } = parseTime(t);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Jurnal Harianmu Menunggu 📖',
          body: 'Ada cerita apa hari ini? Tuliskan beban pikiranmu di jurnal agar lebih lega.',
          data: { type: 'journal' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    }

    for (const day of assesmenDays) {
      const weekday = DAY_MAPPING[day];
      if (!weekday) continue;
      for (const t of assesmenTimes) {
        const { hour, minute } = parseTime(t);
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Waktunya Self Assessment 📝',
            body: 'Mari cek kondisi mentalmu dengan kuesioner DASS-21.',
            data: { type: 'assessment' },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday,
            hour,
            minute,
          },
        });
      }
    }

    console.log('Notifications synced successfully.');
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
}

// ─── Request Permission ───────────────────────────────────────────────────────
export async function requestLocalNotifPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  // Expo Go SDK 53+ tidak support permission request untuk local notifications
  if (isExpoGo()) {
    console.log('Expo Go terdeteksi — permission request dinonaktifkan.');
    return false;
  }

  try {
    const Notifications = await import('expo-notifications');

    if (Platform.OS === 'android') {
      const importance = Notifications.AndroidImportance?.MAX ?? 5;

      if (typeof Notifications.setNotificationChannelAsync === 'function') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    }

    if (typeof Notifications.getPermissionsAsync !== 'function') {
      console.log('getPermissionsAsync tidak tersedia, skip.');
      return false;
    }

    const existing = await Notifications.getPermissionsAsync();
    if ((existing as any).status === 'granted') return true;

    const requested = await Notifications.requestPermissionsAsync();
    return (requested as any).status === 'granted';
  } catch (e) {
    console.log('Notifikasi tidak didukung:', e);
    return false;
  }
}

// ─── Save + Sync ──────────────────────────────────────────────────────────────
export async function saveAndSyncNotifications(updates: {
  notifEnabled?: boolean;
  moodTimes?: string[];
  jurnalTimes?: string[];
  assesmenDays?: string[];
  assesmenTimes?: string[];
}) {
  await saveNotificationSettings(updates);
  await syncScheduledNotifications();
}

// ─── Setup Foreground Handler ─────────────────────────────────────────────────
export async function setupNotificationHandler() {
  if (Platform.OS === 'web') return;

  if (isExpoGo()) {
    console.log('Expo Go terdeteksi — notification handler dinonaktifkan.');
    return;
  }

  try {
    const Notifications = await import('expo-notifications');

    if (typeof Notifications.setNotificationHandler !== 'function') {
      console.log('setNotificationHandler tidak tersedia, skip.');
      return;
    }

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    console.log('Setup handler gagal:', e);
  }
}

// ─── In-App Inbox ─────────────────────────────────────────────────────────────
const INBOX_KEY = 'app_notifications_inbox';

export async function getInboxNotifications(): Promise<AppNotification[]> {
  try {
    const data = await AsyncStorage.getItem(INBOX_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {
    console.error(e);
  }
  return [];
}

export async function addNotificationToInbox(
  notification: Omit<AppNotification, 'id' | 'isRead'>,
) {
  try {
    const inbox = await getInboxNotifications();
    const newNotif: AppNotification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 7),
      isRead: false,
    };
    const updated = [newNotif, ...inbox].slice(0, 50);
    await AsyncStorage.setItem(INBOX_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error(e);
  }
}

export async function markInboxNotificationAsRead(id: string) {
  try {
    const inbox = await getInboxNotifications();
    const updated = inbox.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    await AsyncStorage.setItem(INBOX_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function markAllInboxAsRead() {
  try {
    const inbox = await getInboxNotifications();
    const updated = inbox.map((n) => ({ ...n, isRead: true }));
    await AsyncStorage.setItem(INBOX_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error(e);
    return [];
  }
}