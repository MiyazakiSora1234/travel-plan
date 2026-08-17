import { createTripsClient } from '@shared/api/trips'
import { apiClient } from '../../../lib/apiClient'

export const tripsApi = createTripsClient(apiClient)
