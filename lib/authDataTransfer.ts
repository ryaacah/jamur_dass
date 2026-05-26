import AsyncStorage from '@react-native-async-storage/async-storage'
import { supabase } from './supabase'

const PENDING_ANONYMOUS_USER_ID_KEY = 'pending_anonymous_user_id'

export const rememberPendingAnonymousUser = async (userId: string) => {
  await AsyncStorage.setItem(PENDING_ANONYMOUS_USER_ID_KEY, userId)
}

export const claimPendingAnonymousData = async () => {
  const sourceUserId = await AsyncStorage.getItem(PENDING_ANONYMOUS_USER_ID_KEY)
  if (!sourceUserId) return

  const { data: { session } } = await supabase.auth.getSession()
  const targetUserId = session?.user?.id

  if (!targetUserId) return
  if (sourceUserId === targetUserId) {
    await AsyncStorage.removeItem(PENDING_ANONYMOUS_USER_ID_KEY)
    return
  }

  const { error } = await supabase.rpc('claim_anonymous_user_data', {
    p_source_user_id: sourceUserId,
  })

  if (error) {
    console.warn('Gagal memindahkan data anonim:', error.message)
    return
  }

  await AsyncStorage.removeItem(PENDING_ANONYMOUS_USER_ID_KEY)
}
