import { ToggleGroup } from '@navikt/ds-react'
import React from 'react'

export type Sortering = 'sykmelding skrevet' | 'opprettet' | 'tom'

export default function ValgtSortering({
    sortering,
    setSortering,
}: {
    sortering: Sortering
    setSortering: (v: any) => void
}) {
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
