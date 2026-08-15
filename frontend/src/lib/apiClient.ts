import { createApiClient } from '@shared/api/client'

/**
 * API URLをコンポーネント内にハードコードしないよう、axiosインスタンスを一箇所に集約する。
 * ベースURLはビルド時ではなく実行時の環境変数（VITE_API_BASE_URL）から取得する。
 */
export const apiClient = createApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
})
