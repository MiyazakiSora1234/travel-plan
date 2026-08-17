import { createTripQueries } from '@shared/query/trips'
import { tripsApi } from '../../../api/trips'

// Trip関連のReact Query hook。queryKeyやinvalidateの対象はshared/query/trips.tsに集約している。
export const { useTrips, useTrip, useCreateTrip, useUpdateTrip } = createTripQueries(tripsApi)
