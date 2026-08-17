import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { Alert, Box, CircularProgress, Container, Paper, Snackbar, Stack, Typography } from '@mui/material'
import EditCalendarRoundedIcon from '@mui/icons-material/EditCalendarRounded'
import { TripForm } from '../features/trips/components/TripForm'
import { useTrip } from '../features/trips/hooks/useTrip'
import { useUpdateTrip } from '../features/trips/hooks/useUpdateTrip'
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
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'radial-gradient(circle at 15% 0%, rgba(20,184,166,0.16), transparent 45%), radial-gradient(circle at 100% 20%, rgba(249,115,22,0.12), transparent 40%), #F4F7F6',
        py: { xs: 6, sm: 10 },
      }}
    >
      <Container maxWidth="sm">
        <Stack spacing={1} sx={{ alignItems: 'center', mb: 4, textAlign: 'center' }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              display: 'grid',
              placeItems: 'center',
              background: 'linear-gradient(135deg, #14B8A6, #0F766E)',
              boxShadow: '0 12px 24px -10px rgba(15, 118, 110, 0.55)',
              mb: 1,
            }}
          >
            <EditCalendarRoundedIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Typography variant="h5" component="h1" sx={{ color: 'text.primary' }}>
            旅行計画を編集
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            内容を変更して更新しましょう
          </Typography>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4.5 },
            border: '1px solid',
            borderColor: 'rgba(15, 23, 42, 0.06)',
            boxShadow: '0 24px 48px -24px rgba(15, 23, 42, 0.18)',
          }}
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
        </Paper>
      </Container>

      <Snackbar
        open={errorMessage !== null}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="error"
          variant="filled"
          onClose={() => setErrorMessage(null)}
          sx={{ borderRadius: 2.5 }}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
