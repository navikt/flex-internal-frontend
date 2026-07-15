import React, { useState } from 'react'
import { Table, ToggleGroup, VStack, HStack } from '@navikt/ds-react'

import { sammenlignObjekter, SammenlignRad } from '../utils/sammenlignUtils'

interface Props {
    tittel1: string
    tittel2: string
    objekt1: object
    objekt2: object
}

const radBakgrunn = (rad: SammenlignRad): string => {
    if (rad.verdi1 === undefined || rad.verdi2 === undefined) {
        return 'bg-ax-bg-neutral-soft'
    }
    if (!rad.erLik) return 'bg-ax-bg-warning-soft'
    return ''
}

const VerdiCelle = ({ verdi }: { verdi: string | undefined }) => {
    if (verdi === undefined) {
        return <span className="text-ax-text-neutral-subtle italic">—</span>
    }
    return <span className="break-all">{verdi}</span>
}

export const SammenlignDetaljer = ({ tittel1, tittel2, objekt1, objekt2 }: Props) => {
    const [kunForskjeller, setKunForskjeller] = useState<'alle' | 'forskjeller'>('forskjeller')

    const rader = sammenlignObjekter(objekt1, objekt2)
    const filtrertRader = kunForskjeller === 'forskjeller' ? rader.filter((r) => !r.erLik) : rader

    const antallForskjeller = rader.filter((r) => !r.erLik).length

    return (
        <VStack gap="space-12">
            <HStack align="center" gap="space-12">
                <ToggleGroup
                    value={kunForskjeller}
                    onChange={(v) => setKunForskjeller(v as 'alle' | 'forskjeller')}
                    size="small"
                    data-color="neutral"
                    aria-label="Velg hvilke felt som vises"
                >
                    <ToggleGroup.Item value="forskjeller" label={`Kun forskjeller (${antallForskjeller})`} />
                    <ToggleGroup.Item value="alle" label={`Alle felt (${rader.length})`} />
                </ToggleGroup>
            </HStack>

            <Table size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell scope="col" className="w-[35%] text-ax-text-neutral-subtle">
                            Felt
                        </Table.HeaderCell>
                        <Table.HeaderCell scope="col" className="w-[32.5%]">
                            {tittel1}
                        </Table.HeaderCell>
                        <Table.HeaderCell scope="col" className="w-[32.5%]">
                            {tittel2}
                        </Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {filtrertRader.map((rad) => (
                        <Table.Row key={rad.nøkkel} className={radBakgrunn(rad)}>
                            <Table.HeaderCell
                                scope="row"
                                className="font-mono text-xs align-top text-ax-text-neutral-subtle"
                            >
                                {rad.nøkkel}
                            </Table.HeaderCell>
                            <Table.DataCell className="align-top">
                                <VerdiCelle verdi={rad.verdi1} />
                            </Table.DataCell>
                            <Table.DataCell className="align-top">
                                <VerdiCelle verdi={rad.verdi2} />
                            </Table.DataCell>
                        </Table.Row>
                    ))}
                    {filtrertRader.length === 0 && (
                        <Table.Row>
                            <Table.DataCell colSpan={3} className="text-center text-ax-text-neutral-subtle italic">
                                Ingen forskjeller funnet
                            </Table.DataCell>
                        </Table.Row>
                    )}
                </Table.Body>
            </Table>
        </VStack>
    )
}
