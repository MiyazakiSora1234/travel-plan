import type { ApiClient } from './client'
import type { CreateTripInput, Trip } from '../types/trip'

// 旅行計画登録API（POST /api/v1/trips）の呼び出し
export function createTripApi(api: ApiClient) {
  return async (input: CreateTripInput): Promise<Trip> => {
    const response = await api.post<Trip>('/api/v1/trips', input)
    return response.data
  }
}
