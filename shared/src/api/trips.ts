import type { ApiClient } from './client'
import type { CreateTripInput, Trip, UpdateTripInput } from '../types/trip'

export interface TripsApi {
  listTrips: () => Promise<Trip[]>
  getTrip: (id: number) => Promise<Trip>
  createTrip: (input: CreateTripInput) => Promise<Trip>
  updateTrip: (id: number, input: UpdateTripInput) => Promise<Trip>
}

// axiosインスタンスの作り方はWeb/Mobileで異なるため、生成はアプリ側に委ねてここでは受け取るだけにする
export function createTripsClient(api: ApiClient): TripsApi {
  return {
    listTrips: async () => {
      const response = await api.get<Trip[]>('/api/v1/trips')
      return response.data
    },

    getTrip: async (id) => {
      const response = await api.get<Trip>(`/api/v1/trips/${id}`)
      return response.data
    },

    createTrip: async (input) => {
      const response = await api.post<Trip>('/api/v1/trips', input)
      return response.data
    },

    updateTrip: async (id, input) => {
      const response = await api.put<Trip>(`/api/v1/trips/${id}`, input)
      return response.data
    },
  }
}
