import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// ─── Setup Handler ───────────────────────────────────────────────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type NotificationType = 'mood' | 'journal' | 'assessment';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
}

// ─── Constants for Day Mapping ───────────────────────────────────────────────
const DAY_MAPPING: Record<string, number> = {
  'Ming': 1,
  'Sen': 2,
  'Sel': 3,
  'Rab': 4,
  'Kam': 5,
  'Jum': 6,
  'Sab': 7,
};

// ─── Request Permissions ─────────────────────────────────────────────────────
export async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return false;
    }
    return true;
  } else {
    console.log('Must use physical device for Push Notifications');
    return false;
  }
}

// ─── Sync Scheduled Notifications ────────────────────────────────────────────
export async function syncScheduledNotifications() {
  // Cancel all existing scheduled notifications first
  await Notifications.cancelAllScheduledNotificationsAsync();

  try {
    const notifEnabledStr = await AsyncStorage.getItem('notif_enabled');
    const notifEnabled = notifEnabledStr !== 'false'; // Default true

    if (!notifEnabled) return;

    const moodTimes = JSON.parse(await AsyncStorage.getItem('notif_mood_times') || '["21:00"]');
    const jurnalTimes = JSON.parse(await AsyncStorage.getItem('notif_jurnal_times') || '["21:00"]');
    const assesmenDays = JSON.parse(await AsyncStorage.getItem('notif_assesmen_days') || '["Sen","Sel","Rab","Kam","Jum","Sab","Ming"]');
    const assesmenTimes = JSON.parse(await AsyncStorage.getItem('notif_assesmen_times') || '["12:00"]');

    // Helper to parse "HH:MM"
    const parseTime = (timeStr: string) => {
      const [hour, minute] = timeStr.split(':').map(Number);
      return { hour, minute };
    };

    // 1. Mood Tracking (Daily)
    for (const t of moodTimes) {
      const { hour, minute } = parseTime(t);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Waktunya Trak Mood! 🎭',
          body: 'Bagaimana perasaanmu hari ini? Yuk, luangkan waktu sebentar untuk mencatatnya.',
          data: { type: 'mood' },
        },
        trigger: {
          hour,
          minute,
          repeats: true,
          type: Notifications.SchedulableTriggerInputTypes.DAILY
        },
      });
    }

    // 2. Journal (Daily)
    for (const t of jurnalTimes) {
      const { hour, minute } = parseTime(t);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Jurnal Harianmu Menunggu 📖',
          body: 'Ada cerita apa hari ini? Tuliskan beban pikiranmu di jurnal agar lebih lega.',
          data: { type: 'journal' },
        },
        trigger: {
          hour,
          minute,
          repeats: true,
          type: Notifications.SchedulableTriggerInputTypes.DAILY
        },
      });
    }

    // 3. Assessment (Weekly based on days)
    for (const day of assesmenDays) {
      const weekday = DAY_MAPPING[day as string];
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
            weekday,
            hour,
            minute,
            repeats: true,
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY
          },
        });
      }
    }
    
    console.log("Notifications synced successfully.");
  } catch (error) {
    console.error("Error syncing notifications:", error);
  }
}

// ─── Manage In-App Inbox (AsyncStorage) ──────────────────────────────────────
const INBOX_STORAGE_KEY = 'app_notifications_inbox';

export async function getInboxNotifications(): Promise<AppNotification[]> {
  try {
    const data = await AsyncStorage.getItem(INBOX_STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export async function addNotificationToInbox(notification: Omit<AppNotification, 'id' | 'isRead'>) {
  try {
    const currentInbox = await getInboxNotifications();
    const newNotif: AppNotification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      isRead: false,
    };
    
    // Simpan maksimal 50 notifikasi terbaru
    const updatedInbox = [newNotif, ...currentInbox].slice(0, 50);
    await AsyncStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(updatedInbox));
  } catch (e) {
    console.error(e);
  }
}

export async function markInboxNotificationAsRead(id: string) {
  try {
    const currentInbox = await getInboxNotifications();
    const updatedInbox = currentInbox.map(n => n.id === id ? { ...n, isRead: true } : n);
    await AsyncStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(updatedInbox));
    return updatedInbox;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function markAllInboxAsRead() {
  try {
    const currentInbox = await getInboxNotifications();
    const updatedInbox = currentInbox.map(n => ({ ...n, isRead: true }));
    await AsyncStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(updatedInbox));
    return updatedInbox;
  } catch (e) {
    console.error(e);
    return [];
  }
}
