import { useQuery } from '@tanstack/react-query'
import { tripQueryKeys } from '@shared/query/tripQueryKeys'
import { getTrip } from '../api/tripsApi'

// 旅行計画詳細のクエリ（編集画面で既存データを取得するために使用）。
// idが不正（undefined）の場合はAPIを呼び出さない。
export function useTrip(id: number | undefined) {
  return useQuery({
    queryKey: id !== undefined ? tripQueryKeys.detail(id) : tripQueryKeys.all,
    queryFn: () => getTrip(id as number),
    enabled: id !== undefined,
  })
}
