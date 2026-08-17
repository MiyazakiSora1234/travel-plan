import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tripQueryKeys } from './tripQueryKeys'
import type { TripsApi } from '../api/trips'
import type { UpdateTripInput } from '../types/trip'

// apiClientの実体はWeb/Mobileで異なるため、TripsApiをDIで受け取る
export function createTripQueries(tripsApi: TripsApi) {
  function useTrips() {
    return useQuery({
      queryKey: tripQueryKeys.list(),
      queryFn: tripsApi.listTrips,
    })
  }

  function useTrip(id: number | undefined) {
    return useQuery({
      queryKey: id !== undefined ? tripQueryKeys.detail(id) : tripQueryKeys.all,
      queryFn: () => tripsApi.getTrip(id as number),
      enabled: id !== undefined,
    })
  }

  function useCreateTrip() {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: tripsApi.createTrip,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: tripQueryKeys.list() })
      },
    })
  }

  function useUpdateTrip(id: number) {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: (input: UpdateTripInput) => tripsApi.updateTrip(id, input),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: tripQueryKeys.list() })
        queryClient.invalidateQueries({ queryKey: tripQueryKeys.detail(id) })
      },
    })
  }

  return { useTrips, useTrip, useCreateTrip, useUpdateTrip }
}

export type TripQueries = ReturnType<typeof createTripQueries>
