import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { tripCreateSchema, type TripCreateFormValues } from '@shared/schemas/tripCreateSchema'
import { TRIP_MEMO_MAX_LENGTH, TRIP_NAME_MAX_LENGTH } from '@shared/constants/trip'
import { DateField } from './DateField'
import { theme } from '../../../theme/theme'

interface TripCreateFormProps {
  onSubmit: (values: TripCreateFormValues) => void
  isSubmitting: boolean
}

// 旅行計画登録フォーム。バリデーションはZodスキーマ（tripCreateSchema）に委譲する
export function TripCreateForm({ onSubmit, isSubmitting }: TripCreateFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TripCreateFormValues>({
    resolver: zodResolver(tripCreateSchema),
    defaultValues: {
      name: '',
      startDate: '',
      endDate: '',
      memo: '',
    },
  })

  return (
    <View style={styles.form} accessibilityLabel="旅行計画を作成">
      <View style={styles.field}>
        <Text style={styles.label}>
          旅行名
          <Text style={styles.required}> *</Text>
        </Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="例: 東京・京都旅行"
              placeholderTextColor={theme.colors.placeholder}
              maxLength={TRIP_NAME_MAX_LENGTH}
              style={[styles.input, errors.name ? styles.inputError : null]}
              accessibilityLabel="旅行名"
              accessibilityHint="旅行名を入力してください"
            />
          )}
        />
        {errors.name ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {errors.name.message}
          </Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>旅行日程</Text>

        <View style={styles.field}>
          <Controller
            control={control}
            name="startDate"
            render={({ field: { onChange, value } }) => (
              <DateField
                label="開始日"
                value={value}
                placeholder="開始日を選択"
                required
                error={errors.startDate?.message}
                onChange={onChange}
              />
            )}
          />
        </View>

        <View style={styles.field}>
          <Controller
            control={control}
            name="endDate"
            render={({ field: { onChange, value } }) => (
              <DateField
                label="終了日"
                value={value}
                placeholder="終了日を選択"
                required
                error={errors.endDate?.message}
                onChange={onChange}
              />
            )}
          />
        </View>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>メモ</Text>
        <Controller
          control={control}
          name="memo"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="持ち物、行きたい場所、予約情報など"
              placeholderTextColor={theme.colors.placeholder}
              maxLength={TRIP_MEMO_MAX_LENGTH}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={[styles.input, styles.memoInput, errors.memo ? styles.inputError : null]}
              accessibilityLabel="メモ"
              accessibilityHint="持ち物や行きたい場所などを入力してください（任意）"
            />
          )}
        />
        {errors.memo ? (
          <Text style={styles.errorText} accessibilityRole="alert">
            {errors.memo.message}
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={handleSubmit(onSubmit)}
        disabled={isSubmitting}
        accessibilityRole="button"
        accessibilityLabel="旅行を登録"
        accessibilityState={{ disabled: isSubmitting, busy: isSubmitting }}
        style={({ pressed }) => [
          styles.submitButton,
          isSubmitting ? styles.submitButtonDisabled : null,
          pressed && !isSubmitting ? styles.submitButtonPressed : null,
        ]}
      >
        <Text style={styles.submitButtonText}>{isSubmitting ? '登録中...' : '旅行を登録'}</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  form: {
    gap: theme.spacing.xl,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  field: {
    gap: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  required: {
    color: theme.colors.danger,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  memoInput: {
    minHeight: 120,
    paddingTop: theme.spacing.md,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  errorText: {
    marginTop: theme.spacing.xs,
    fontSize: 12,
    color: theme.colors.danger,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.md + 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonPressed: {
    backgroundColor: theme.colors.primaryDark,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
})
