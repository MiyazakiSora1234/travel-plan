import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { Alert, CircularProgress, Stack, Typography } from '@mui/material'
import EditCalendarRoundedIcon from '@mui/icons-material/EditCalendarRounded'
import { TripForm } from '../features/trips/components/TripForm'
import { TripFormPageLayout } from '../features/trips/components/TripFormPageLayout'
import { useTrip, useUpdateTrip } from '../features/trips/hooks/tripQueries'
import { extractErrorMessage } from '@shared/api/error'
import type { TripCreateFormValues } from '@shared/schemas/tripCreateSchema'

// URLのidはユーザーが自由に書き換えられるため、正の整数であることを確認してから使う
function parseTripId(rawId: string | undefined): number | undefined {
  if (!rawId) {
    return undefined
  }
  const id = Number(rawId)
  return Number.isInteger(id) && id > 0 ? id : undefined
}

// /trips/:id/edit 旅行計画編集画面
export function TripEditPage() {
  const { id: rawId } = useParams<{ id: string }>()
  const tripId = parseTripId(rawId)
  const navigate = useNavigate()

  const { data: trip, isLoading, isError, error } = useTrip(tripId)
  const updateTrip = useUpdateTrip(tripId ?? -1)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const isInvalidId = tripId === undefined
  const isNotFound = isInvalidId || (axios.isAxiosError(error) && error.response?.status === 404)

  const handleSubmit = (values: TripCreateFormValues) => {
    // 送信中の二重クリックによる多重送信を防ぐ
    if (tripId === undefined || updateTrip.isPending) {
      return
    }
    setErrorMessage(null)
    updateTrip.mutate(
      {
        name: values.name,
        startDate: values.startDate,
        endDate: values.endDate,
        memo: values.memo,
      },
      {
        onSuccess: () =>
          navigate('/trips', { state: { successMessage: '旅行計画を更新しました' } }),
        onError: (err) => setErrorMessage(extractErrorMessage(err)),
      },
    )
  }

  return (
    <TripFormPageLayout
      icon={<EditCalendarRoundedIcon sx={{ color: '#fff', fontSize: 28 }} />}
      title="旅行計画を編集"
      subtitle="内容を変更して更新しましょう"
      error={errorMessage}
      onDismissError={() => setErrorMessage(null)}
    >
      {isLoading ? (
        <Stack spacing={2} sx={{ alignItems: 'center', py: 6 }} aria-label="旅行計画を読み込み中">
          <CircularProgress size={28} />
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            読み込み中...
          </Typography>
        </Stack>
      ) : isInvalidId || isError || !trip ? (
        <Alert severity="error" variant="outlined">
          {isNotFound
            ? '旅行計画が見つかりません'
            : `旅行計画の取得に失敗しました（${extractErrorMessage(error)}）`}
        </Alert>
      ) : (
        <TripForm
          defaultValues={{
            name: trip.name,
            startDate: trip.startDate,
            endDate: trip.endDate,
            memo: trip.memo ?? '',
          }}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/trips')}
          isSubmitting={updateTrip.isPending}
          submitLabel="更新する"
          formAriaLabel="旅行計画を編集"
        />
      )}
    </TripFormPageLayout>
  )
}
