import axios from 'axios'

/**
 * API URLをコンポーネント内にハードコードしないよう、axiosインスタンスを一箇所に集約する。
 * ベースURLはExpoのpublic環境変数（EXPO_PUBLIC_API_BASE_URL）から取得する。
 * Secretはこの変数に絶対に入れない（EXPO_PUBLIC_* はクライアントバンドルに埋め込まれるため）。
 */
export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})
