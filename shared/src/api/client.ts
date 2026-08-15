import axios, { type AxiosInstance } from 'axios'

export type ApiClient = AxiosInstance

interface CreateApiClientOptions {
  baseUrl: string
}

/**
 * API URLをコンポーネント内にハードコードしないよう、axiosインスタンスを一箇所に集約する。
 * baseUrlの取得方法（Vite/Expoで環境変数の読み方が異なる）はアプリごとに異なるため、
 * ここでは受け取るだけで環境変数を直接読まない。
 */
export function createApiClient({ baseUrl }: CreateApiClientOptions): ApiClient {
  return axios.create({
    baseURL: baseUrl,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
