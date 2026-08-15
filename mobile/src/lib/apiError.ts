import axios from 'axios'

/** Backendの GlobalExceptionHandler が返す統一エラーレスポンス形式。 */
export interface ApiErrorResponse {
  code: string
  message: string
  errors: { field: string; message: string }[]
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'errors' in value
  )
}

/** axiosエラーからユーザーに提示できるメッセージを抽出する。生のException/Stack Traceは表示しない。 */
export function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data: unknown = error.response?.data
    if (isApiErrorResponse(data)) {
      return data.message
    }
    if (error.code === 'ERR_NETWORK') {
      return 'サーバーに接続できませんでした。ネットワーク状況を確認してください。'
    }
  }
  return '予期しないエラーが発生しました。時間をおいて再度お試しください。'
}
