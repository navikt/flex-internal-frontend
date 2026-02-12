import naviktTailwindPreset from '@navikt/ds-tailwind'
import type { Config } from 'tailwindcss'

const config: Config = {
    presets: [naviktTailwindPreset],
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {},
    },
    plugins: [],
}

export default config
