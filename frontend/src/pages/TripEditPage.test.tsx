import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import { TripEditPage } from './TripEditPage'
import { tripsApi } from '../features/trips/api/tripsApi'
import type { Trip } from '@shared/types/trip'

vi.mock('../features/trips/api/tripsApi', () => ({
  tripsApi: {
    listTrips: vi.fn(),
    getTrip: vi.fn(),
    createTrip: vi.fn(),
    updateTrip: vi.fn(),
  },
}))

const mockedGetTrip = vi.mocked(tripsApi.getTrip)
const mockedUpdateTrip = vi.mocked(tripsApi.updateTrip)

beforeEach(() => {
  // テストごとに呼び出し回数をリセットする（vi.mockのfactoryはファイル内で共有されるため）
  mockedGetTrip.mockClear()
  mockedUpdateTrip.mockClear()
})

const trip: Trip = {
  id: 1,
  name: '東京・京都旅行',
  startDate: '2026-09-01',
  endDate: '2026-09-05',
  memo: 'ホテル予約済み',
  createdAt: '2026-08-08T10:00:00+09:00',
  updatedAt: '2026-08-08T10:00:00+09:00',
}

function renderPage(path = '/trips/1/edit') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/trips/:id/edit" element={<TripEditPage />} />
          <Route path="/trips" element={<div>一覧画面</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function notFoundError() {
  return new AxiosError(
    'Request failed',
    '404',
    undefined,
    undefined,
    {
      status: 404,
      statusText: 'Not Found',
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
      data: { code: 'NOT_FOUND', message: '旅行計画が見つかりません', errors: [] },
    } as never,
  )
}

describe('TripEditPage', () => {
  it('読み込み中はローディング表示をする', () => {
    mockedGetTrip.mockReturnValue(new Promise(() => {}))

    renderPage()

    expect(screen.getByLabelText('旅行計画を読み込み中')).toBeInTheDocument()
  })

  it('既存データがフォームにセットされる', async () => {
    mockedGetTrip.mockResolvedValue(trip)

    renderPage()

    await waitFor(() => expect(screen.getByLabelText('旅行名 *')).toHaveValue('東京・京都旅行'))
    expect(screen.getByLabelText(/開始日/)).toHaveValue('2026-09-01')
    expect(screen.getByLabelText(/終了日/)).toHaveValue('2026-09-05')
    expect(screen.getByLabelText('メモ')).toHaveValue('ホテル予約済み')
  })

  it('存在しないIDの場合は見つからない旨を表示する', async () => {
    mockedGetTrip.mockRejectedValue(notFoundError())

    renderPage()

    expect(await screen.findByText('旅行計画が見つかりません')).toBeInTheDocument()
  })

  it('IDが不正な場合はAPIを呼ばずに見つからない旨を表示する', async () => {
    renderPage('/trips/abc/edit')

    expect(await screen.findByText('旅行計画が見つかりません')).toBeInTheDocument()
    expect(mockedGetTrip).not.toHaveBeenCalled()
  })

  it('更新ボタン押下でAPIが呼ばれ、成功後に一覧へ遷移する', async () => {
    mockedGetTrip.mockResolvedValue(trip)
    mockedUpdateTrip.mockResolvedValue({ ...trip, name: '東京・京都旅行（更新）' })
    const user = userEvent.setup()

    renderPage()

    await waitFor(() => expect(screen.getByLabelText('旅行名 *')).toHaveValue('東京・京都旅行'))

    await user.clear(screen.getByLabelText('旅行名 *'))
    await user.type(screen.getByLabelText('旅行名 *'), '東京・京都旅行（更新）')
    await user.click(screen.getByRole('button', { name: '更新する' }))

    await waitFor(() => expect(mockedUpdateTrip).toHaveBeenCalledTimes(1))
    expect(mockedUpdateTrip).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ name: '東京・京都旅行（更新）' }),
    )
    expect(await screen.findByText('一覧画面')).toBeInTheDocument()
  })

  it('更新API失敗時にエラーメッセージを表示する', async () => {
    mockedGetTrip.mockResolvedValue(trip)
    mockedUpdateTrip.mockRejectedValue(new Error('network error'))
    const user = userEvent.setup()

    renderPage()

    await waitFor(() => expect(screen.getByLabelText('旅行名 *')).toHaveValue('東京・京都旅行'))
    await user.click(screen.getByRole('button', { name: '更新する' }))

    expect(await screen.findByText('予期しないエラーが発生しました。時間をおいて再度お試しください。')).toBeInTheDocument()
  })

  it('更新中はボタンが無効化され二重送信できない', async () => {
    mockedGetTrip.mockResolvedValue(trip)
    mockedUpdateTrip.mockReturnValue(new Promise(() => {}))
    const user = userEvent.setup()

    renderPage()

    await waitFor(() => expect(screen.getByLabelText('旅行名 *')).toHaveValue('東京・京都旅行'))
    await user.click(screen.getByRole('button', { name: '更新する' }))

    expect(await screen.findByRole('button', { name: '送信中...' })).toBeDisabled()
    expect(mockedUpdateTrip).toHaveBeenCalledTimes(1)
  })
})
