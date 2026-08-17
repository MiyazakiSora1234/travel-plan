import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tripQueryKeys } from '@shared/query/tripQueryKeys'
import type { UpdateTripInput } from '@shared/types/trip'
import { updateTrip } from '../api/tripsApi'

// 旅行計画更新のミューテーション（TanStack Query経由でサーバー状態を管理）
export function useUpdateTrip(id: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateTripInput) => updateTrip(id, input),
    onSuccess: () => {
      // 一覧・詳細のどちらから見ても更新後の内容が反映されるようにする
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.list() })
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.detail(id) })
    },
  })
}
