import { useQuery } from '@tanstack/react-query'
import { tripQueryKeys } from '@shared/query/tripQueryKeys'
import { listTrips } from '../../../api/trips'

// 旅行計画一覧のクエリ（TanStack Query経由でサーバー状態を管理）
export function useTrips() {
  return useQuery({
    queryKey: tripQueryKeys.list(),
    queryFn: listTrips,
  })
}
