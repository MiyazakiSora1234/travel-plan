import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { TripListPage } from './TripListPage'
import { listTrips } from '../features/trips/api/tripsApi'
import type { Trip } from '@shared/types/trip'

vi.mock('../features/trips/api/tripsApi', () => ({
  listTrips: vi.fn(),
}))

const mockedListTrips = vi.mocked(listTrips)

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TripListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

const trip: Trip = {
  id: 1,
  name: '東京・京都旅行',
  startDate: '2026-09-01',
  endDate: '2026-09-05',
  memo: '寺社巡りをする',
  createdAt: '2026-08-08T10:00:00+09:00',
  updatedAt: '2026-08-08T10:00:00+09:00',
}

describe('TripListPage', () => {
  it('読み込み中はSkeletonを表示する', () => {
    mockedListTrips.mockReturnValue(new Promise(() => {}))

    renderPage()

    expect(screen.getByLabelText('旅行計画を読み込み中')).toBeInTheDocument()
  })

  it('取得できたTripを一覧表示する', async () => {
    mockedListTrips.mockResolvedValue([trip])

    renderPage()

    expect(await screen.findByText('東京・京都旅行')).toBeInTheDocument()
    expect(screen.getByText('2026/09/01 - 2026/09/05')).toBeInTheDocument()
    expect(screen.getByText('5日間')).toBeInTheDocument()
  })

  it('0件の場合は空状態メッセージと作成ボタンを表示する', async () => {
    mockedListTrips.mockResolvedValue([])

    renderPage()

    expect(await screen.findByText('まだ旅行計画がありません')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /最初の旅行を作成する/ })).toBeInTheDocument()
  })

  it('取得に失敗した場合はエラーメッセージと再読み込みボタンを表示する', async () => {
    mockedListTrips.mockRejectedValue(new Error('network error'))

    renderPage()

    expect(await screen.findByText(/旅行計画を取得できませんでした/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '再読み込み' })).toBeInTheDocument()
  })

  it('再読み込みボタン押下でlistTripsが再実行される', async () => {
    mockedListTrips.mockRejectedValueOnce(new Error('network error'))
    mockedListTrips.mockResolvedValueOnce([trip])

    const { default: userEvent } = await import('@testing-library/user-event')
    const user = userEvent.setup()
    renderPage()

    await screen.findByText(/旅行計画を取得できませんでした/)
    await user.click(screen.getByRole('button', { name: '再読み込み' }))

    await waitFor(() => expect(mockedListTrips).toHaveBeenCalledTimes(2))
    expect(await screen.findByText('東京・京都旅行')).toBeInTheDocument()
  })
})
