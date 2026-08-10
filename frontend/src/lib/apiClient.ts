import axios from 'axios'

/**
 * API URLをコンポーネント内にハードコードしないよう、axiosインスタンスを一箇所に集約する。
 * ベースURLはビルド時ではなく実行時の環境変数（VITE_API_BASE_URL）から取得する。
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
