import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tripQueryKeys } from './tripQueryKeys'
import type { TripsApi } from '../api/trips'
import type { UpdateTripInput } from '../types/trip'

/**
 * Trip関連のReact Query hookをまとめて生成するFactory。
 * frontend/mobileでqueryKey・invalidateの対象が食い違わないよう、ロジックをここに一本化する。
 *
 * apiClientの実体（axiosインスタンス）はWeb/Mobileで異なるため、Trip APIの呼び出し（TripsApi）を
 * 引数として受け取るDI方式にしている。sharedからfrontend/mobileのコードを直接importすることはない。
 */
export function createTripQueries(tripsApi: TripsApi) {
  // 旅行計画一覧のクエリ（TanStack Query経由でサーバー状態を管理）
  function useTrips() {
    return useQuery({
      queryKey: tripQueryKeys.list(),
      queryFn: tripsApi.listTrips,
    })
  }

  // 旅行計画詳細のクエリ（編集画面で既存データを取得するために使用）。
  // idが不正（undefined）の場合はAPIを呼び出さない。
  function useTrip(id: number | undefined) {
    return useQuery({
      queryKey: id !== undefined ? tripQueryKeys.detail(id) : tripQueryKeys.all,
      queryFn: () => tripsApi.getTrip(id as number),
      enabled: id !== undefined,
    })
  }

  // 旅行計画登録のミューテーション
  function useCreateTrip() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: tripsApi.createTrip,
      onSuccess: () => {
        // 登録後に一覧へ戻ったときに古いデータが表示されないようにする
        queryClient.invalidateQueries({ queryKey: tripQueryKeys.list() })
      },
    })
  }

  // 旅行計画更新のミューテーション
  function useUpdateTrip(id: number) {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: (input: UpdateTripInput) => tripsApi.updateTrip(id, input),
      onSuccess: () => {
        // 一覧・詳細のどちらから見ても更新後の内容が反映されるようにする
        queryClient.invalidateQueries({ queryKey: tripQueryKeys.list() })
        queryClient.invalidateQueries({ queryKey: tripQueryKeys.detail(id) })
      },
    })
  }

  return { useTrips, useTrip, useCreateTrip, useUpdateTrip }
}

export type TripQueries = ReturnType<typeof createTripQueries>
