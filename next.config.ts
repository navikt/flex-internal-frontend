import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    output: 'standalone',
    outputFileTracingIncludes: {
        '/*': [
            './node_modules/@swc/helpers/**/*',
            './node_modules/.pnpm/@swc+helpers@*/node_modules/@swc/helpers/**/*',
        ],
    },
}

export default nextConfig
