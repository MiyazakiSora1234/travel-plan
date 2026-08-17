import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { TripCard } from '../features/trips/components/TripCard'
import { useTrips } from '../features/trips/hooks/tripQueries'
import { theme } from '../theme/theme'
import type { RootStackParamList } from '../navigation/RootNavigator'
import type { Trip } from '@shared/types/trip'

type TripListNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TripList'>

// 旅行計画一覧画面
export function TripListScreen() {
  const navigation = useNavigation<TripListNavigationProp>()
  const { data: trips, isLoading, isError, isFetching, refetch } = useTrips()

  const goToCreate = () => navigation.navigate('TripCreate')

  const header = (
    <View style={styles.header}>
      <View style={styles.iconBadge}>
        <Text style={styles.iconBadgeText}>✈️</Text>
      </View>
      <Text style={styles.title} accessibilityRole="header">
        旅行計画
      </Text>
      <Text style={styles.subtitle}>旅行を計画して、{'\n'}思い出をつくろう。</Text>

      <Pressable
        onPress={goToCreate}
        accessibilityRole="button"
        accessibilityLabel="新しい旅行を作成"
        style={({ pressed }) => [styles.createButton, pressed ? styles.buttonPressed : null]}
      >
        <Text style={styles.createButtonText}>＋ 新しい旅行</Text>
      </Pressable>

      <Text style={styles.sectionTitle} accessibilityRole="header">
        旅行計画
      </Text>
    </View>
  )

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {header}
        <View style={styles.centerState}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.stateText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {header}
        <View style={styles.centerState} accessibilityRole="alert">
          <Text style={styles.errorText}>旅行計画を取得できませんでした</Text>
          <Pressable
            onPress={() => refetch()}
            accessibilityRole="button"
            accessibilityLabel="再読み込み"
            style={({ pressed }) => [styles.retryButton, pressed ? styles.buttonPressed : null]}
          >
            <Text style={styles.retryButtonText}>再読み込み</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <FlatList
        data={trips}
        keyExtractor={(item: Trip) => String(item.id)}
        renderItem={({ item }) => <TripCard trip={item} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <View style={styles.centerState}>
            <Text style={styles.stateText}>まだ旅行計画がありません</Text>
            <Pressable
              onPress={goToCreate}
              accessibilityRole="button"
              accessibilityLabel="最初の旅行を作成する"
              style={({ pressed }) => [styles.createButton, pressed ? styles.buttonPressed : null]}
            >
              <Text style={styles.createButtonText}>最初の旅行を作成する</Text>
            </Pressable>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: theme.spacing.lg }} />}
        contentContainerStyle={styles.listContent}
        refreshing={isFetching}
        onRefresh={refetch}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.xs,
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  iconBadgeText: {
    fontSize: 26,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  sectionTitle: {
    alignSelf: 'flex-start',
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.lg,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  buttonPressed: {
    backgroundColor: theme.colors.primaryDark,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  centerState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
  stateText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.danger,
    textAlign: 'center',
  },
})
