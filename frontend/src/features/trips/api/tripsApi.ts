import { createTripApi, listTripsApi } from '@shared/api/trips'
import { apiClient } from '../../../lib/apiClient'

// 旅行計画登録API（POST /api/v1/trips）の呼び出し
export const createTrip = createTripApi(apiClient)

// 旅行計画一覧取得API（GET /api/v1/trips）の呼び出し
export const listTrips = listTripsApi(apiClient)
