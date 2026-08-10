/// <reference types="vite/client" />

// VITE_プレフィックスの環境変数に型を付ける
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
