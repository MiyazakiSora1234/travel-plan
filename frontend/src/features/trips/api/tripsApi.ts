import { createTripsClient } from '@shared/api/trips'
import { apiClient } from '../../../lib/apiClient'

// Trip APIのクライアント（GET/POST/PUT /api/v1/trips...）。URL・HTTP Methodはshared/api/trips.tsに集約している
export const tripsApi = createTripsClient(apiClient)
