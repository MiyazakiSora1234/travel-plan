import { createTripQueries } from '@shared/query/trips'
import { tripsApi } from '../api/tripsApi'

export const { useTrips, useTrip, useCreateTrip, useUpdateTrip } = createTripQueries(tripsApi)
