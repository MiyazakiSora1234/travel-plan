import { z } from 'zod'
import { TRIP_MEMO_MAX_LENGTH, TRIP_NAME_MAX_LENGTH } from '../constants/trip'

/**
 * 旅行計画登録フォームのスキーマ。
 * Backend(Bean Validation)と同じ制約を表現するが、あくまでUXのための一次防御であり、
 * 最終的な整合性はBackend側で保証する。
 */
export const tripCreateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, '旅行名は必須です')
      .max(TRIP_NAME_MAX_LENGTH, `旅行名は${TRIP_NAME_MAX_LENGTH}文字以内で入力してください`),
    startDate: z.string().min(1, '開始日は必須です'),
    endDate: z.string().min(1, '終了日は必須です'),
    memo: z
      .string()
      .max(TRIP_MEMO_MAX_LENGTH, `メモは${TRIP_MEMO_MAX_LENGTH}文字以内で入力してください`)
      .optional(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: '終了日は開始日以降の日付を指定してください',
    path: ['endDate'],
  })

export type TripCreateFormValues = z.infer<typeof tripCreateSchema>
