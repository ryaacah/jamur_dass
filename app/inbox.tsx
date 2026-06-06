import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AppNotification,
    getInboxNotifications,
    markAllInboxAsRead,
    markInboxNotificationAsRead,
} from '../lib/notifications';
import { colors, styles } from './styles';

export default function InboxScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const fetchNotifications = async () => {
    const data = await getInboxNotifications();
    setNotifications(data);
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const handleMarkAllRead = async () => {
    const updated = await markAllInboxAsRead();
    setNotifications(updated);
  };

  const handlePressItem = async (item: AppNotification) => {
    // Tandai sudah dibaca
    if (!item.isRead) {
      const updated = await markInboxNotificationAsRead(item.id);
      setNotifications(updated);
    }

    // Navigasikan ke halaman yang sesuai
    if (item.type === 'mood') {
      router.push('/');
    } else if (item.type === 'journal') {
      router.push('/journal');
    } else if (item.type === 'assessment') {
      router.push('/assessment');
    }
  };

  const getIconName = (type: string) => {
    switch (type) {
      case 'mood': return 'mood';
      case 'journal': return 'book';
      case 'assessment': return 'assignment';
      default: return 'notifications';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'mood': return colors.accentYellow;
      case 'journal': return colors.accentBlue;
      case 'assessment': return colors.accentPurple;
      default: return colors.surfaceVariant;
    }
  };

  const renderItem = ({ item }: { item: AppNotification }) => {
    return (
      <TouchableOpacity
        style={[styles.inboxCard, !item.isRead && styles.inboxUnreadCard]}
        onPress={() => handlePressItem(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.inboxIconContainer, { backgroundColor: getIconColor(item.type) }]}>
          <Icon name={getIconName(item.type) as any} size={24} color={colors.ink} />
        </View>
        <View style={styles.inboxContentContainer}>
          <View style={styles.inboxHeaderRow}>
            <Text style={[styles.inboxTitle, !item.isRead && styles.inboxUnreadText]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.inboxTime}>{item.time}</Text>
          </View>
          <Text style={styles.inboxBody} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
        {!item.isRead && <View style={styles.inboxUnreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={colors.canvas} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Kotak Masuk</Text>

        <TouchableOpacity onPress={handleMarkAllRead} style={{ padding: 8 }} activeOpacity={0.6}>
          <Icon name="done-all" size={24} color={notifications.some(n => !n.isRead) ? colors.ink : colors.inkSoft} />
        </TouchableOpacity>
      </View>

      {/* List Notifikasi */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.inboxListContent}
        ListEmptyComponent={
          <View style={styles.inboxEmptyContainer}>
            <Icon name="notifications-none" size={64} color={colors.surfaceVariant} />
            <Text style={styles.inboxEmptyText}>Belum ada notifikasi</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}