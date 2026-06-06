import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    AppNotification,
    getInboxNotifications,
    markAllInboxAsRead,
    markInboxNotificationAsRead,
} from '../lib/notifications';
import { colors, styles as globalStyles } from './styles';

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
        style={[localStyles.card, !item.isRead && localStyles.unreadCard]}
        onPress={() => handlePressItem(item)}
        activeOpacity={0.7}
      >
        <View style={[localStyles.iconContainer, { backgroundColor: getIconColor(item.type) }]}>
          <Icon name={getIconName(item.type) as any} size={24} color={colors.ink} />
        </View>
        <View style={localStyles.contentContainer}>
          <View style={localStyles.headerRow}>
            <Text style={[localStyles.title, !item.isRead && localStyles.unreadText]} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={localStyles.time}>{item.time}</Text>
          </View>
          <Text style={localStyles.body} numberOfLines={2}>
            {item.body}
          </Text>
        </View>
        {!item.isRead && <View style={localStyles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={globalStyles.safeArea}>
      <StatusBar style="dark" backgroundColor={colors.canvas} />

      {/* Header */}
      <View style={globalStyles.header}>
        <TouchableOpacity
          style={globalStyles.headerBackBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={colors.ink} />
        </TouchableOpacity>

        <Text style={globalStyles.headerTitle}>Kotak Masuk</Text>

        <TouchableOpacity onPress={handleMarkAllRead} style={{ padding: 8 }} activeOpacity={0.6}>
          <Icon name="done-all" size={24} color={notifications.some(n => !n.isRead) ? colors.ink : colors.inkSoft} />
        </TouchableOpacity>
      </View>

      {/* List Notifikasi */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={localStyles.listContent}
        ListEmptyComponent={
          <View style={localStyles.emptyContainer}>
            <Icon name="notifications-none" size={64} color={colors.surfaceVariant} />
            <Text style={localStyles.emptyText}>Belum ada notifikasi</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderDefault,
  },
  unreadCard: {
    backgroundColor: '#F9F8F5',
    borderColor: '#E8E0D0',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contentContainer: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontFamily: 'Fredoka_500Medium', fontSize: 15, color: colors.ink, flex: 1, marginRight: 8 },
  unreadText: { fontFamily: 'Fredoka_700Bold' },
  time: { fontFamily: 'Fredoka_400Regular', fontSize: 11, color: colors.inkSoft },
  body: { fontFamily: 'Fredoka_400Regular', fontSize: 13, color: colors.inkSoft, lineHeight: 18 },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accentRed, marginLeft: 8 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontFamily: 'Fredoka_500Medium', fontSize: 16, color: colors.inkSoft },
});