import { defineConfig } from 'vitest/config'

export default defineConfig({
    envDir: '/tmp/vitest-env-dir',
    test: {
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
    },
})
