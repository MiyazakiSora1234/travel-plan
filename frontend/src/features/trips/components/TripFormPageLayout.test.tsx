import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TripFormPageLayout } from './TripFormPageLayout'

describe('TripFormPageLayout', () => {
  it('タイトル・サブタイトル・子要素を表示する', () => {
    render(
      <TripFormPageLayout
        icon={<span>icon</span>}
        title="旅行計画を作成"
        subtitle="行き先が決まったら、まずは日程を登録しましょう"
        error={null}
        onDismissError={vi.fn()}
      >
        <div>form-content</div>
      </TripFormPageLayout>,
    )

    expect(screen.getByRole('heading', { name: '旅行計画を作成' })).toBeInTheDocument()
    expect(screen.getByText('行き先が決まったら、まずは日程を登録しましょう')).toBeInTheDocument()
    expect(screen.getByText('form-content')).toBeInTheDocument()
  })

  it('errorが指定されている場合は通知を表示する', () => {
    render(
      <TripFormPageLayout
        icon={<span>icon</span>}
        title="旅行計画を編集"
        subtitle="内容を変更して更新しましょう"
        error="旅行計画の更新に失敗しました"
        onDismissError={vi.fn()}
      >
        <div>form-content</div>
      </TripFormPageLayout>,
    )

    expect(screen.getByText('旅行計画の更新に失敗しました')).toBeInTheDocument()
  })

  it('errorがnullの場合は通知を表示しない', () => {
    render(
      <TripFormPageLayout
        icon={<span>icon</span>}
        title="旅行計画を編集"
        subtitle="内容を変更して更新しましょう"
        error={null}
        onDismissError={vi.fn()}
      >
        <div>form-content</div>
      </TripFormPageLayout>,
    )

    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('通知を閉じるとonDismissErrorが呼ばれる', async () => {
    const onDismissError = vi.fn()
    const user = userEvent.setup()
    render(
      <TripFormPageLayout
        icon={<span>icon</span>}
        title="旅行計画を編集"
        subtitle="内容を変更して更新しましょう"
        error="失敗しました"
        onDismissError={onDismissError}
      >
        <div>form-content</div>
      </TripFormPageLayout>,
    )

    await user.click(screen.getByRole('button', { name: /close/i }))

    expect(onDismissError).toHaveBeenCalledTimes(1)
  })
})
