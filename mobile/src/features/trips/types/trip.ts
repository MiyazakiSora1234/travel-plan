// APIレスポンスの旅行計画（サーバー側の TripResponse に対応）
// frontend/src/features/trips/types/trip.ts と同じ形。Web/Mobileで型定義を分けているのは、
// 現時点でパッケージを共有する仕組み（monorepoのcommonパッケージ等）が存在しないため。
export interface Trip {
  id: number
  name: string
  startDate: string
  endDate: string
  memo: string | null
  createdAt: string
  updatedAt: string
}

// 旅行計画登録APIのリクエストボディ
export interface CreateTripInput {
  name: string
  startDate: string
  endDate: string
  memo?: string
}
