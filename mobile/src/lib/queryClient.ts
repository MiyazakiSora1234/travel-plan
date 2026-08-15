import { QueryClient } from '@tanstack/react-query'

// アプリ全体で共有するTanStack Queryのクライアント
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
})
