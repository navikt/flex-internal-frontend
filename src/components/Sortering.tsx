import { ToggleGroup } from '@navikt/ds-react'
import React from 'react'

import { Soknad } from '../queryhooks/useSoknader'

export type Sortering = 'sykmelding skrevet' | 'opprettet' | 'tom'

export default function ValgtSortering({
    soknader,
    sortering,
    setSortering,
}: {
    soknader: Soknad[]
    sortering: Sortering
    setSortering: (v: any) => void
}) {
    soknader.sort((a: Soknad, b: Soknad) => {
        switch (sortering) {
            case 'sykmelding skrevet': {
                const verdiA = a.sykmeldingUtskrevet || new Date(0)
                const verdiB = b.sykmeldingUtskrevet || new Date(0)
                return verdiA > verdiB ? -1 : 1
            }
            case 'opprettet': {
                const verdiA = a.opprettetDato || new Date(0)
                const verdiB = b.opprettetDato || new Date(0)
                return verdiA > verdiB ? -1 : 1
            }
            case 'tom': {
                const verdiA = a.tom || new Date(0)
                const verdiB = b.tom || new Date(0)
                return verdiA > verdiB ? -1 : 1
            }
        }
    })

    return (
        <ToggleGroup
            label="Sorter nyeste øverst:"
            defaultValue={sortering}
            onChange={(v: any) => setSortering(v)}
            size="small"
        >
            <ToggleGroup.Item value="sykmelding skrevet">sykmelding skrevet</ToggleGroup.Item>
            <ToggleGroup.Item value="opprettet">opprettet</ToggleGroup.Item>
            <ToggleGroup.Item value="tom">tom</ToggleGroup.Item>
        </ToggleGroup>
    )
}
