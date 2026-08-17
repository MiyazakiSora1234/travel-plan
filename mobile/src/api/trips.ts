import { createTripsClient } from '@shared/api/trips'
import { apiClient } from './client'

export const tripsApi = createTripsClient(apiClient)
