import { Button, HStack } from '@navikt/ds-react'
import dayjs from 'dayjs'
import React from 'react'

interface VelgZoomPeriodeProps {
    setFraDato: (date: Date | null) => void
    setTilDato: (date: Date | null) => void
    maxTilDato?: Date
}

export default function VelgZoomPeriode({ setFraDato, setTilDato, maxTilDato }: VelgZoomPeriodeProps) {
    const handleZoom = (måneder?: number, år?: number) => {
        if (måneder) {
            setFraDato(dayjs().subtract(måneder, 'month').toDate())
        } else if (år) {
            setFraDato(dayjs().subtract(år, 'year').toDate())
        }
        const tilDato = maxTilDato && dayjs() > dayjs(maxTilDato) ? maxTilDato : dayjs().toDate()
        setTilDato(tilDato)
    }

    return (
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
    )
}
