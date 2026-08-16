import { Card, CardActionArea, CardContent, Stack, Typography } from '@mui/material'
import FlightRoundedIcon from '@mui/icons-material/FlightRounded'
import { formatTripDateRange, calculateTripDays } from '@shared/utils/date'
import type { Trip } from '@shared/types/trip'

interface TripCardProps {
  trip: Trip
  // 将来的に旅行詳細画面へ遷移するための拡張ポイント。現時点では未接続でも良い。
  onClick?: () => void
}

// 旅行計画一覧の1件分のCard
export function TripCard({ trip, onClick }: TripCardProps) {
  const days = calculateTripDays(trip.startDate, trip.endDate)
  const memo = trip.memo?.trim()

  const content = (
    <CardContent sx={{ p: 2.5 }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <FlightRoundedIcon fontSize="small" color="primary" />
          <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 700, color: 'text.primary' }}>
            {trip.name}
          </Typography>
        </Stack>

        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {formatTripDateRange(trip.startDate, trip.endDate)}
        </Typography>

        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600 }}>
          {days}日間
        </Typography>

        {memo ? (
          <Typography
            variant="body2"
            sx={{
              color: 'text.secondary',
              mt: 0.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {memo}
          </Typography>
        ) : null}
      </Stack>
    </CardContent>
  )

  return (
    <Card
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'rgba(15, 23, 42, 0.06)',
        boxShadow: '0 12px 24px -18px rgba(15, 23, 42, 0.25)',
      }}
    >
      {onClick ? (
        <CardActionArea onClick={onClick} aria-label={`${trip.name}の詳細`}>
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  )
}
