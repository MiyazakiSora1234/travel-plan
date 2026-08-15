import { z } from 'zod'

/**
 * 旅行計画登録フォームのスキーマ。
 * frontend/src/features/trips/schemas/tripCreateSchema.ts のBackend(Bean Validation)と同じ制約
 * （name: 必須・最大100文字 / startDate・endDate: 必須・endDateはstartDate以降 / memo: 任意・最大2000文字）
 * をそのまま踏襲する。あくまでUXのための一次防御であり、最終的な整合性はBackend側で保証する。
 */
export const tripCreateSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, '旅行名は必須です')
      .max(100, '旅行名は100文字以内で入力してください'),
    startDate: z.string().min(1, '開始日は必須です'),
    endDate: z.string().min(1, '終了日は必須です'),
    memo: z.string().max(2000, 'メモは2000文字以内で入力してください').optional(),
  })
  .refine((data) => !data.startDate || !data.endDate || data.endDate >= data.startDate, {
    message: '終了日は開始日以降の日付を指定してください',
    path: ['endDate'],
  })

export type TripCreateFormValues = z.infer<typeof tripCreateSchema>
