import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import FlightTakeoffRoundedIcon from '@mui/icons-material/FlightTakeoffRounded'
import { TripForm } from '../features/trips/components/TripForm'
import { TripFormPageLayout } from '../features/trips/components/TripFormPageLayout'
import { useCreateTrip } from '../features/trips/hooks/tripQueries'
import { extractErrorMessage } from '@shared/api/error'
import type { TripCreateFormValues } from '@shared/schemas/tripCreateSchema'

// /trips/new 旅行計画登録画面
export function TripCreatePage() {
  const navigate = useNavigate()
  const createTrip = useCreateTrip()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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
        onSuccess: () =>
          navigate('/trips', { state: { successMessage: '旅行計画を登録しました' } }),
        onError: (error) => setErrorMessage(extractErrorMessage(error)),
      },
    )
  }

  return (
    <TripFormPageLayout
      icon={<FlightTakeoffRoundedIcon sx={{ color: '#fff', fontSize: 28 }} />}
      title="旅行計画を作成"
      subtitle="行き先が決まったら、まずは日程を登録しましょう"
      error={errorMessage}
      onDismissError={() => setErrorMessage(null)}
    >
      <TripForm
        onSubmit={handleSubmit}
        onCancel={() => navigate('/trips')}
        isSubmitting={createTrip.isPending}
        submitLabel="登録する"
        formAriaLabel="旅行計画を作成"
      />
    </TripFormPageLayout>
  )
}
