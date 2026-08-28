import { Button, HStack } from '@navikt/ds-react'
import { isAfter, subMonths, subYears } from 'date-fns'
import React from 'react'

import { now, tilOsloDatoFraDato } from '../utils/dato-utils'

interface VelgZoomPeriodeProps {
    setFraDato: (date: Date | null) => void
    setTilDato: (date: Date | null) => void
    maxTilDato?: Date
}

export default function VelgZoomPeriode({ setFraDato, setTilDato, maxTilDato }: VelgZoomPeriodeProps) {
    const handleZoom = (måneder?: number, år?: number) => {
        // Alle vindusgrenser pinnes til Oslo-midnatt slik at Aksels interne
        // månedsberegning får én konsistent tidssonekontekst.
        const iDag = now()
        if (måneder) {
            setFraDato(tilOsloDatoFraDato(subMonths(iDag, måneder)))
        } else if (år) {
            setFraDato(tilOsloDatoFraDato(subYears(iDag, år)))
        }
        const tilDato = maxTilDato && isAfter(maxTilDato, iDag) ? maxTilDato : iDag
        setTilDato(tilOsloDatoFraDato(tilDato))
    }

    return (
        <div className="mb-4">
            <HStack gap="space-4" wrap={false}>
                <Button size="small" variant="secondary" onClick={() => handleZoom(3)} aria-label="Zoom 3 måneder">
                    3 mnd
                </Button>
                <Button size="small" variant="secondary" onClick={() => handleZoom(7)} aria-label="Zoom 7 måneder">
                    7 mnd
                </Button>
                <Button size="small" variant="secondary" onClick={() => handleZoom(9)} aria-label="Zoom 9 måneder">
                    9 mnd
                </Button>
                <Button
                    size="small"
                    variant="secondary"
                    onClick={() => handleZoom(undefined, 2)}
                    aria-label="Zoom 2 år"
                >
                    2 år
                </Button>
                <Button
                    size="small"
                    variant="secondary"
                    onClick={() => {
                        setFraDato(null)
                        setTilDato(null)
                    }}
                    aria-label="Vis alle perioder"
                >
                    Alle
                </Button>
            </HStack>
        </div>
    )
}
