import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Box, Button, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import FlightRoundedIcon from '@mui/icons-material/FlightRounded'
import EventRoundedIcon from '@mui/icons-material/EventRounded'
import NotesRoundedIcon from '@mui/icons-material/NotesRounded'
import { tripCreateSchema, type TripCreateFormValues } from '@shared/schemas/tripCreateSchema'
import { TRIP_MEMO_MAX_LENGTH, TRIP_NAME_MAX_LENGTH } from '@shared/constants/trip'

const EMPTY_VALUES: TripCreateFormValues = {
  name: '',
  startDate: '',
  endDate: '',
  memo: '',
}

interface TripFormProps {
  // 更新画面で既存データを反映する場合に指定する。APIから非同期に取得するため、
  // useFormのdefaultValuesには直接渡さず、値が届いたらreset()で反映する。
  defaultValues?: TripCreateFormValues
  onSubmit: (values: TripCreateFormValues) => void
  onCancel: () => void
  isSubmitting: boolean
  submitLabel: string
  formAriaLabel: string
}

// 旅行計画の登録・更新で共通利用するフォーム。バリデーションはZodスキーマ（tripCreateSchema）に委譲する
export function TripForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel,
  formAriaLabel,
}: TripFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TripCreateFormValues>({
    resolver: zodResolver(tripCreateSchema),
    defaultValues: defaultValues ?? EMPTY_VALUES,
  })

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues)
    }
  }, [defaultValues, reset])

  return (
    <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)} aria-label={formAriaLabel}>
      <Stack spacing={3.5}>
        <TextField
          label="旅行名"
          placeholder="例: 東京・京都旅行"
          required
          fullWidth
          slotProps={{
            htmlInput: { maxLength: TRIP_NAME_MAX_LENGTH },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <FlightRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          error={!!errors.name}
          helperText={errors.name?.message}
          {...register('name')}
        />

        <Stack spacing={1}>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', color: 'text.secondary' }}>
            <EventRoundedIcon fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              旅行日程
            </Typography>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="開始日"
              type="date"
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!errors.startDate}
              helperText={errors.startDate?.message}
              {...register('startDate')}
            />

            <TextField
              label="終了日"
              type="date"
              required
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              error={!!errors.endDate}
              helperText={errors.endDate?.message}
              {...register('endDate')}
            />
          </Stack>
        </Stack>

        <TextField
          label="メモ"
          placeholder="持ち物、行きたい場所、予約情報など"
          multiline
          minRows={4}
          fullWidth
          slotProps={{
            htmlInput: { maxLength: TRIP_MEMO_MAX_LENGTH },
            input: {
              startAdornment: (
                <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                  <NotesRoundedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
          }}
          error={!!errors.memo}
          helperText={errors.memo?.message}
          {...register('memo')}
        />

        <Stack
          direction="row"
          spacing={1.5}
          sx={{ justifyContent: 'flex-end', pt: 1 }}
        >
          <Button variant="text" color="inherit" onClick={onCancel} disabled={isSubmitting}>
            キャンセル
          </Button>
          <Button type="submit" variant="contained" disableElevation disabled={isSubmitting}>
            {isSubmitting ? '送信中...' : submitLabel}
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}
