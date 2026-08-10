import { useState } from 'react'
import { Alert, Box, Container, Paper, Snackbar, Stack, Typography } from '@mui/material'
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded'
import { TripCreateForm } from '../features/trips/components/TripCreateForm'
import { useCreateTrip } from '../features/trips/hooks/useCreateTrip'
import { extractErrorMessage } from '../lib/apiError'
import type { TripCreateFormValues } from '../features/trips/schemas/tripCreateSchema'

// /trips/new 旅行計画登録画面
export function TripCreatePage() {
  const createTrip = useCreateTrip()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = (values: TripCreateFormValues) => {
    // 送信中の二重クリックによる多重送信を防ぐ
    if (createTrip.isPending) {
      return
    }
    setErrorMessage(null)
    createTrip.mutate(
      {
        name: values.name,
        startDate: values.startDate,
        endDate: values.endDate,
        memo: values.memo,
      },
      {
        onSuccess: () => setShowSuccess(true),
        onError: (error) => setErrorMessage(extractErrorMessage(error)),
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
            <FlightTakeoffRoundedIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Typography variant="h5" component="h1" sx={{ color: 'text.primary' }}>
            旅行計画を作成
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            行き先が決まったら、まずは日程を登録しましょう
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
          <TripCreateForm onSubmit={handleSubmit} isSubmitting={createTrip.isPending} />
        </Paper>
      </Container>

      <Snackbar
        open={showSuccess}
        autoHideDuration={4000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setShowSuccess(false)}
          sx={{ borderRadius: 2.5 }}
        >
          旅行計画を登録しました
        </Alert>
      </Snackbar>

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
