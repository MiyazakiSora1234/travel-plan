import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tripQueryKeys } from '@shared/query/tripQueryKeys'
import { createTrip } from '../api/tripsApi'

// 旅行計画登録のミューテーション（TanStack Query経由でサーバー状態を管理）
export function useCreateTrip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => {
      // 登録後に一覧へ戻ったときに古いデータが表示されないようにする
      queryClient.invalidateQueries({ queryKey: tripQueryKeys.list() })
    },
  })
}
