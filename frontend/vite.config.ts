/// <reference types="vitest/config" />
import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const rootDir = import.meta.dirname

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@shared': path.resolve(rootDir, '../shared/src'),
    },
    // shared/はfrontendとは別のnpm packageのため、node_modulesの探索木が独立している
    // （例: shared/node_modules/react が別途インストールされ得る）。
    // react/react-queryが二重に解決されるとReact Hookやcontextの同一性が壊れるため、
    // shared/src配下のコードから参照される場合もfrontend自身の実体に強制的に寄せる。
    dedupe: ['react', 'react-dom', '@tanstack/react-query'],
  },
  server: {
    host: true,
    port: 5173,
    fs: {
      allow: [rootDir, path.resolve(rootDir, '../shared')],
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
})
