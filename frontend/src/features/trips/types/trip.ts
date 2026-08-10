// APIレスポンスの旅行計画（サーバー側の TripResponse に対応）
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
