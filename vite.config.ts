/// <reference types="vitest/config" />
import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import path from 'node:path'

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  server: {
    port: 5555,
  },
  test: {
    include: ['src/**/*.test.ts'],
    alias: {
      '$lib': path.resolve('./src/lib'),
      '$lib/': path.resolve('./src/lib/'),
    },
  },
})
