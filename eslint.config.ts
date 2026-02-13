import { defineConfig } from 'eslint/config'
import nextTs from 'eslint-config-next/typescript'
import nextVitals from 'eslint-config-next/core-web-vitals'
import tsmEslintReact from '@navikt/tsm-eslint-react'
import prettierRecommended from 'eslint-plugin-prettier/recommended'

const config = defineConfig([
    ...nextVitals,
    ...nextTs,
    ...tsmEslintReact,
    {
        rules: {
            '@typescript-eslint/explicit-function-return-type': 'off',
        },
    },
    {
        extends: [prettierRecommended],
        rules: {
            'prettier/prettier': 'warn',
        },
    },
])

export default config
