import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Container,
  Skeleton,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded'
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { TripCard } from '../features/trips/components/TripCard'
import { useTrips } from '../features/trips/hooks/tripQueries'
import { extractErrorMessage } from '@shared/api/error'
import { iconBadgeGradient, pageBackgroundGradient } from '../app/theme'

const SKELETON_ITEM_COUNT = 3

interface TripListLocationState {
  successMessage?: string
}

// /trips 旅行計画一覧画面
export function TripListPage() {
  const { data: trips, isLoading, isError, error, refetch, isRefetching } = useTrips()

  // 登録・更新画面からの遷移直後にのみ成功通知を表示する。
  // ブラウザの再読み込みや戻る操作で再表示されないよう、表示後にlocation.stateをクリアする。
  const location = useLocation()
  const navigate = useNavigate()
  const locationState = location.state as TripListLocationState | null
  const [successMessage, setSuccessMessage] = useState(locationState?.successMessage ?? null)

  const handleCloseSuccess = () => {
    setSuccessMessage(null)
    if (locationState?.successMessage) {
      navigate(location.pathname, { replace: true, state: null })
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: pageBackgroundGradient,
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
              background: iconBadgeGradient,
              boxShadow: '0 12px 24px -10px rgba(15, 118, 110, 0.55)',
              mb: 1,
            }}
          >
            <FlightTakeoffRoundedIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Box>
          <Typography variant="h5" component="h1" sx={{ color: 'text.primary' }}>
            旅行計画
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            旅行を計画して、思い出をつくろう。
          </Typography>

          <Button
            component={RouterLink}
            to="/trips/new"
            variant="contained"
            disableElevation
            startIcon={<AddRoundedIcon />}
            sx={{ mt: 2 }}
          >
            新しい旅行を作成
          </Button>
        </Stack>

        <Typography variant="h6" component="h2" sx={{ mb: 2, fontWeight: 700, color: 'text.primary' }}>
          旅行計画一覧
        </Typography>

        {isLoading ? (
          <Stack spacing={2.5} aria-label="旅行計画を読み込み中">
            {Array.from({ length: SKELETON_ITEM_COUNT }).map((_, index) => (
              <Skeleton key={index} variant="rounded" height={132} sx={{ borderRadius: '14px' }} />
            ))}
          </Stack>
        ) : isError ? (
          <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 6 }}>
            <Alert severity="error" variant="outlined" sx={{ width: '100%' }}>
              旅行計画を取得できませんでした
              {error ? `（${extractErrorMessage(error)}）` : null}
            </Alert>
            <Button
              variant="outlined"
              startIcon={<RefreshRoundedIcon />}
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              再読み込み
            </Button>
          </Stack>
        ) : trips && trips.length > 0 ? (
          <Stack spacing={2.5}>
            {trips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center', py: 6 }}>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              まだ旅行計画がありません
            </Typography>
            <Button
              component={RouterLink}
              to="/trips/new"
              variant="contained"
              disableElevation
              startIcon={<AddRoundedIcon />}
            >
              最初の旅行を作成する
            </Button>
          </Stack>
        )}
      </Container>

      <Snackbar
        open={successMessage !== null}
        autoHideDuration={4000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={handleCloseSuccess}
          sx={{ borderRadius: 2.5 }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
