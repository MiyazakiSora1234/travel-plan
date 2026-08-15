import { createTripApi } from '@shared/api/trips'
import { apiClient } from './client'

// 旅行計画登録API（POST /api/v1/trips）の呼び出し
export const createTrip = createTripApi(apiClient)
