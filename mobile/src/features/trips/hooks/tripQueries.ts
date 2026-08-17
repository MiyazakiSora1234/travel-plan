import { createTripQueries } from '@shared/query/trips'
import { tripsApi } from '../../../api/trips'

export const { useTrips, useTrip, useCreateTrip, useUpdateTrip } = createTripQueries(tripsApi)
