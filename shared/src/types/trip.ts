// APIレスポンスの旅行計画（Backendの TripResponse に対応）
export interface Trip {
  id: number
  name: string
  startDate: string
  endDate: string
  memo: string | null
  createdAt: string
  updatedAt: string
}

// 旅行計画登録APIのリクエストボディ（Backendの CreateTripRequest に対応）
export interface CreateTripInput {
  name: string
  startDate: string
  endDate: string
  memo?: string
}

// 旅行計画更新APIのリクエストボディ（Backendの UpdateTripRequest に対応）。
// 更新対象のIDはURL Path Parameterで渡すため、ここには含めない。
export type UpdateTripInput = CreateTripInput
