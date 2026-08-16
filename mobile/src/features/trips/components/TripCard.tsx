import { Pressable, StyleSheet, Text, View } from 'react-native'
import { formatTripDateRange, calculateTripDays } from '@shared/utils/date'
import type { Trip } from '@shared/types/trip'
import { theme } from '../../../theme/theme'

interface TripCardProps {
  trip: Trip
  // 将来的に旅行詳細画面へ遷移するための拡張ポイント。現時点では未接続でも良い。
  onPress?: () => void
}

// 旅行計画一覧の1件分のCard
export function TripCard({ trip, onPress }: TripCardProps) {
  const days = calculateTripDays(trip.startDate, trip.endDate)
  const memo = trip.memo?.trim()

  const content = (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.icon}>✈️</Text>
        <Text style={styles.title} numberOfLines={1}>
          {trip.name}
        </Text>
      </View>

      <Text style={styles.dateRange}>{formatTripDateRange(trip.startDate, trip.endDate)}</Text>
      <Text style={styles.days}>{days}日間</Text>

      {memo ? (
        <Text style={styles.memo} numberOfLines={2}>
          {memo}
        </Text>
      ) : null}
    </View>
  )

  if (!onPress) {
    return content
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${trip.name}の詳細`}
      style={({ pressed }) => [pressed ? styles.pressed : null]}
    >
      {content}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.xs,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 1,
  },
  pressed: {
    opacity: 0.85,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  icon: {
    fontSize: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    flexShrink: 1,
  },
  dateRange: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  days: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  memo: {
    marginTop: theme.spacing.xs,
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
})
