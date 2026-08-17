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
    // shared/node_modulesに別インスタンスが解決され得るため、単一インスタンスに強制する
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
