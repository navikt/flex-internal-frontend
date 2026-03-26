import React from 'react'
import { BodyShort, HStack, Loader } from '@navikt/ds-react'

type Props = {
    tekst?: string
}

const LasterInnhold = ({ tekst = 'Henter data...' }: Props) => {
    return (
        <HStack align="center" gap="space-8">
            <Loader size="small" title="Laster" aria-live="polite" />
            <BodyShort>{tekst}</BodyShort>
        </HStack>
    )
}

export default LasterInnhold
