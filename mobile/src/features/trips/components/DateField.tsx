import { useState } from 'react'
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker'
import { theme } from '../../../theme/theme'

interface DateFieldProps {
  label: string
  value: string
  placeholder: string
  error?: string
  required?: boolean
  onChange: (value: string) => void
}

function parseDate(value: string): Date {
  if (!value) {
    return new Date()
  }
  const parsed = new Date(`${value}T00:00:00`)
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ネイティブの日付ピッカー（iOS/Android）でタップ操作から日付を選択させる入力欄。
// Androidはネイティブダイアログとして表示され選択と同時に閉じるが、
// iOSはインライン表示のため、シートに載せて「完了」で明示的に閉じさせる。
export function DateField({ label, value, placeholder, error, required, onChange }: DateFieldProps) {
  const [isPickerOpen, setPickerOpen] = useState(false)

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setPickerOpen(false)
    }
    if (event.type === 'set' && selectedDate) {
      onChange(formatDate(selectedDate))
    }
  }

  return (
    <View>
      <Text style={styles.label}>
        {label}
        {required ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <Pressable
        onPress={() => setPickerOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}を選択`}
        accessibilityHint="タップするとカレンダーが開きます"
        style={({ pressed }) => [
          styles.input,
          error ? styles.inputError : null,
          pressed ? styles.inputPressed : null,
        ]}
      >
        <Text style={value ? styles.valueText : styles.placeholderText}>{value || placeholder}</Text>
        <Text style={styles.icon}>📅</Text>
      </Pressable>
      {error ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}

      {isPickerOpen && Platform.OS === 'android' ? (
        <DateTimePicker value={parseDate(value)} mode="date" display="default" onChange={handleChange} />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={isPickerOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setPickerOpen(false)}
        >
          <Pressable
            style={styles.backdrop}
            onPress={() => setPickerOpen(false)}
            accessibilityLabel="閉じる"
          />
          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable onPress={() => setPickerOpen(false)} accessibilityRole="button" accessibilityLabel="完了">
                <Text style={styles.sheetDone}>完了</Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={parseDate(value)}
              mode="date"
              display="spinner"
              onChange={handleChange}
            />
          </View>
        </Modal>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  inputPressed: {
    borderColor: theme.colors.primaryLight,
  },
  inputError: {
    borderColor: theme.colors.danger,
  },
  valueText: {
    fontSize: 16,
    color: theme.colors.textPrimary,
  },
  placeholderText: {
    fontSize: 16,
    color: theme.colors.placeholder,
  },
  icon: {
    fontSize: 16,
  },
  errorText: {
    marginTop: theme.spacing.xs,
    fontSize: 12,
    color: theme.colors.danger,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  sheet: {
    backgroundColor: theme.colors.card,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    paddingBottom: theme.spacing.xl,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.textPrimary,
  },
  sheetDone: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
})
