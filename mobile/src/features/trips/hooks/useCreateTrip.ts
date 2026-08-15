import { useMutation } from '@tanstack/react-query'
import { createTrip } from '../../../api/trips'

// 旅行計画登録のミューテーション（TanStack Query経由でサーバー状態を管理）
export function useCreateTrip() {
  return useMutation({
    mutationFn: createTrip,
  })
}
