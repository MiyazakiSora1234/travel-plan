import { apiClient } from './client'
import type { CreateTripInput, Trip } from '../features/trips/types/trip'

// 旅行計画登録API（POST /api/v1/trips）の呼び出し
export async function createTrip(input: CreateTripInput): Promise<Trip> {
  const response = await apiClient.post<Trip>('/api/v1/trips', input)
  return response.data
}
