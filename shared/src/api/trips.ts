import type { ApiClient } from './client'
import type { CreateTripInput, Trip, UpdateTripInput } from '../types/trip'

// Trip APIの呼び出し契約。Web/Mobileが同じURL・HTTP Methodを使うことをこの型で保証する。
export interface TripsApi {
  listTrips: () => Promise<Trip[]>
  getTrip: (id: number) => Promise<Trip>
  createTrip: (input: CreateTripInput) => Promise<Trip>
  updateTrip: (id: number, input: UpdateTripInput) => Promise<Trip>
}

/**
 * Trip APIのクライアントを生成する。
 * axiosインスタンス（ApiClient）の作り方はWeb/Mobileで異なる（baseURLの取得方法が違う）ため、
 * ここでは受け取るだけで、生成はアプリ側（frontend/lib/apiClient.ts, mobile/api/client.ts）に委ねる。
 */
export function createTripsClient(api: ApiClient): TripsApi {
  return {
    // 旅行計画一覧取得API（GET /api/v1/trips）
    listTrips: async () => {
      const response = await api.get<Trip[]>('/api/v1/trips')
      return response.data
    },

    // 旅行計画取得API（GET /api/v1/trips/{id}）
    getTrip: async (id) => {
      const response = await api.get<Trip>(`/api/v1/trips/${id}`)
      return response.data
    },

    // 旅行計画登録API（POST /api/v1/trips）
    createTrip: async (input) => {
      const response = await api.post<Trip>('/api/v1/trips', input)
      return response.data
    },

    // 旅行計画更新API（PUT /api/v1/trips/{id}）
    updateTrip: async (id, input) => {
      const response = await api.put<Trip>(`/api/v1/trips/${id}`, input)
      return response.data
    },
  }
}
