// ESLint flat config for ESLint v9+
// Goal: pure flat config, no legacy FlatCompat fallback
// See: https://eslint.org/docs/latest/use/configure/migration-guide

const nextPlugin = require('@next/eslint-plugin-next')
const tsParser = require('@typescript-eslint/parser')
const tsPlugin = require('@typescript-eslint/eslint-plugin')

// Use NAV's flat ESLint preset directly (assumes dependency is installed)
const naviktConfigs = require('@navikt/tsm-eslint-react')

module.exports = [
    // Ignore build artifacts and vendor dirs
    {
        ignores: ['**/node_modules/**', '**/.next/**', '**/out/**', '**/dist/**', '**/build/**', '**/.turbo/**'],
    },

    // NAV config (only if the flat preset is available)
    ...naviktConfigs,

    // Next.js official flat config for Core Web Vitals
    nextPlugin.configs['core-web-vitals'],

    // Enable TypeScript parsing and plugin for all TS/TSX files
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            '@typescript-eslint': tsPlugin,
        },
        rules: {
            'postcss-modules/no-undef-class': 'off',
            'postcss-modules/no-unused-class': 'off',
            'react/react-in-jsx-scope': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
        },
    },
]
