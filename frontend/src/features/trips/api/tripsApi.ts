import { createTripApi, getTripApi, listTripsApi, updateTripApi } from '@shared/api/trips'
import { apiClient } from '../../../lib/apiClient'

// 旅行計画登録API（POST /api/v1/trips）の呼び出し
export const createTrip = createTripApi(apiClient)

// 旅行計画一覧取得API（GET /api/v1/trips）の呼び出し
export const listTrips = listTripsApi(apiClient)

// 旅行計画取得API（GET /api/v1/trips/{id}）の呼び出し
export const getTrip = getTripApi(apiClient)

// 旅行計画更新API（PUT /api/v1/trips/{id}）の呼び出し
export const updateTrip = updateTripApi(apiClient)
