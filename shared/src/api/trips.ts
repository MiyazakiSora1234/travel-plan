import type { ApiClient } from './client'
import type { CreateTripInput, Trip } from '../types/trip'

// 旅行計画登録API（POST /api/v1/trips）の呼び出し
export function createTripApi(api: ApiClient) {
  return async (input: CreateTripInput): Promise<Trip> => {
    const response = await api.post<Trip>('/api/v1/trips', input)
    return response.data
  }
}

// 旅行計画一覧取得API（GET /api/v1/trips）の呼び出し
export function listTripsApi(api: ApiClient) {
  return async (): Promise<Trip[]> => {
    const response = await api.get<Trip[]>('/api/v1/trips')
    return response.data
  }
}
