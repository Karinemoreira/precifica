import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      /* Evita corridas no mesmo localStorage entre ficheiros (ex.: app.spec vs itensLocal.spec). */
      fileParallelism: false,
    },
  }),
)
