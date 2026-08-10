import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TripCreateForm } from './TripCreateForm'

function setup() {
  const onSubmit = vi.fn()
  render(<TripCreateForm onSubmit={onSubmit} isSubmitting={false} />)
  return { onSubmit, user: userEvent.setup() }
}

describe('TripCreateForm', () => {
  it('旅行名が未入力だとエラーを表示し送信されない', async () => {
    const { onSubmit, user } = setup()

    await user.type(screen.getByLabelText(/開始日/), '2026-09-01')
    await user.type(screen.getByLabelText(/終了日/), '2026-09-05')
    await user.click(screen.getByRole('button', { name: '登録する' }))

    expect(await screen.findByText('旅行名は必須です')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('旅行名が101文字だとエラーを表示する', async () => {
    const { onSubmit, user } = setup()

    // HTMLのmaxLengthはユーザー入力を100文字に制限するため、
    // Zod側の制約（防御的二重チェック）を検証する目的でDOM操作により101文字を直接設定する。
    fireEvent.change(screen.getByLabelText('旅行名 *'), { target: { value: 'あ'.repeat(101) } })
    await user.type(screen.getByLabelText(/開始日/), '2026-09-01')
    await user.type(screen.getByLabelText(/終了日/), '2026-09-05')
    await user.click(screen.getByRole('button', { name: '登録する' }))

    expect(await screen.findByText('旅行名は100文字以内で入力してください')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('終了日が開始日より前だとエラーを表示する', async () => {
    const { onSubmit, user } = setup()

    await user.type(screen.getByLabelText('旅行名 *'), '東京・京都旅行')
    await user.type(screen.getByLabelText(/開始日/), '2026-09-05')
    await user.type(screen.getByLabelText(/終了日/), '2026-09-01')
    await user.click(screen.getByRole('button', { name: '登録する' }))

    expect(
      await screen.findByText('終了日は開始日以降の日付を指定してください'),
    ).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('必須項目が正しく入力されていれば送信される', async () => {
    const { onSubmit, user } = setup()

    await user.type(screen.getByLabelText('旅行名 *'), '東京・京都旅行')
    await user.type(screen.getByLabelText(/開始日/), '2026-09-01')
    await user.type(screen.getByLabelText(/終了日/), '2026-09-05')
    await user.type(screen.getByLabelText('メモ'), '寺社巡りをする')
    await user.click(screen.getByRole('button', { name: '登録する' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1))
    expect(onSubmit.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        name: '東京・京都旅行',
        startDate: '2026-09-01',
        endDate: '2026-09-05',
        memo: '寺社巡りをする',
      }),
    )
  })

  it('送信中はボタンが無効化される', () => {
    render(<TripCreateForm onSubmit={vi.fn()} isSubmitting={true} />)

    expect(screen.getByRole('button', { name: '送信中...' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeDisabled()
  })
})
