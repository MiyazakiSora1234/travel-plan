import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TripCreateForm } from '../features/trips/components/TripCreateForm'
import { useCreateTrip } from '../features/trips/hooks/useCreateTrip'
import { extractErrorMessage } from '../lib/apiError'
import { theme } from '../theme/theme'
import type { TripCreateFormValues } from '../features/trips/schemas/tripCreateSchema'

// 旅行計画登録画面
export function TripCreateScreen() {
  const createTrip = useCreateTrip()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = (values: TripCreateFormValues) => {
    // 送信中の二重タップによる多重送信を防ぐ
    if (createTrip.isPending) {
      return
    }
    setErrorMessage(null)
    setShowSuccess(false)
    createTrip.mutate(
      {
        name: values.name,
        startDate: values.startDate,
        endDate: values.endDate,
        memo: values.memo,
      },
      {
        onSuccess: () => setShowSuccess(true),
        onError: (error) => {
          console.error('旅行計画の登録に失敗しました', error)
          setErrorMessage(extractErrorMessage(error))
        },
      },
    )
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconBadge}>
              <Text style={styles.iconBadgeText}>✈️</Text>
            </View>
            <Text style={styles.title} accessibilityRole="header">
              旅行計画を作成
            </Text>
            <Text style={styles.subtitle}>行き先が決まったら、まずは日程を登録しましょう</Text>
          </View>

          {showSuccess ? (
            <View style={styles.successBanner} accessibilityRole="alert">
              <Text style={styles.successText}>旅行計画を登録しました</Text>
            </View>
          ) : null}

          {errorMessage ? (
            <View style={styles.errorBanner} accessibilityRole="alert">
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <TripCreateForm onSubmit={handleSubmit} isSubmitting={createTrip.isPending} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
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
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 2,
  },
  successBanner: {
    backgroundColor: theme.colors.successBackground,
    borderWidth: 1,
    borderColor: theme.colors.successBorder,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  successText: {
    color: theme.colors.success,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: theme.colors.dangerBackground,
    borderWidth: 1,
    borderColor: theme.colors.dangerBorder,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  errorBannerText: {
    color: theme.colors.danger,
    fontWeight: '600',
    textAlign: 'center',
  },
})
