import dsTailwind from '@navikt/ds-tailwind'
import type { Config } from 'tailwindcss'

const config: Config = {
    presets: [dsTailwind],
    content: ['./src/**'],
    theme: {
        extend: {},
    },
}

export default config
