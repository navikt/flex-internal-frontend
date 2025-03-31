import React, { useState } from 'react'
import { Alert, Button, Detail, Heading, Search, Table } from '@navikt/ds-react'

import { initialProps } from '../initialprops/initialProps'
import { useArbeidssoker, ArbeidssokerDetaljer } from '../queryhooks/useArbeidssoker'
import { useSoknader } from '../queryhooks/useSoknader'

const FriskmeldtPage = () => {
    const [fnr, setFnr] = useState<string>()

    if (!fnr) {
        return (
            <Search
                className="w-56"
                label="Søk opp person"
                onSearchClick={(input) => {
                    if (input.length == 11) {
                        setFnr(input)
                    } else {
                        window.alert('Fnr må være 11 siffer')
                    }
                }}
                onKeyDown={(evt) => {
                    if (evt.key === 'Enter') {
                        if (evt.currentTarget.value.length == 11) {
                            setFnr(evt.currentTarget.value)
                        } else {
                            window.alert('Fnr må være 11 siffer')
                        }
                    }
                }}
            />
        )
    }

    return (
        <div>
            <Button
                className="mb-8"
                size="small"
                variant="secondary"
                onClick={() => {
                    setFnr('')
                }}
            >
                Tilbake
            </Button>
            <FriskmeldtEnkeltPerson fnr={fnr} />
        </div>
    )
}

function ArbeidssokerDetaljerVisning({ arbeidssokerdata }: { arbeidssokerdata: ArbeidssokerDetaljer[] | undefined }) {
    if (arbeidssokerdata === undefined) {
        return <div>Laster arbeidssøkerregister...</div>
    }
    if (arbeidssokerdata.length == 0) {
        return (
            <Alert className="mb-8" variant="warning">
                Ikke registrert arbeidssoker
            </Alert>
        )
    }
    const first = arbeidssokerdata[0]
    if (first.avsluttet) {
        return (
            <Alert className="mb-8" variant="warning">
                Siste arbeidssøkerperiode avsluttet {first.avsluttet.tidspunkt}
            </Alert>
        )
    }
    return (
        <Alert className="mb-8" variant="success">
            Arbeidssøkerperiode startet {first.startet.tidspunkt}
        </Alert>
    )
}

const FriskmeldtEnkeltPerson = ({ fnr }: { fnr: string }) => {
    const { data: arbeidssokerdata } = useArbeidssoker(fnr, !!fnr && fnr.length == 11)

    return (
        <div className="max-w-4xl">
            <Heading level="1" size="medium" spacing>
                Friskmeldt for {fnr}
            </Heading>
            <ArbeidssokerDetaljerVisning arbeidssokerdata={arbeidssokerdata} />
            <Soknader fnr={fnr} />
        </div>
    )
}

const Soknader = ({ fnr }: { fnr: string }) => {
    const { data: soknader, isLoading } = useSoknader(fnr, !!fnr && fnr.length == 11)
    if (isLoading || soknader === undefined) {
        return <div>Laster søknader...</div>
    }
    const friskmeldtsoknader = soknader.sykepengesoknadListe.filter(
        (soknad) => soknad.soknadstype === 'FRISKMELDT_TIL_ARBEIDSFORMIDLING',
    )

    friskmeldtsoknader.sort((a, b) => {
        if (a.fom! < b.fom!) {
            return -1
        }
        if (a.fom! > b.fom!) {
            return 1
        }
        return 0
    })
    if (friskmeldtsoknader.length == 0) {
        return <Alert variant="info">Ingen friskmeldt til arbeidsformidling søknader generert</Alert>
    }
    return (
        <>
            <Heading size="small">Søknader</Heading>
            <Detail spacing>Viser kun søknadstype friskmeldt til arbeid</Detail>
            <Table size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>ID</Table.HeaderCell>
                        <Table.HeaderCell>Periode</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {friskmeldtsoknader.map((soknad) => (
                        <Table.Row key={soknad.id}>
                            <Table.DataCell>{soknad.id}</Table.DataCell>
                            <Table.DataCell>
                                {soknad.fom} - {soknad.tom}
                            </Table.DataCell>
                            <Table.DataCell>{soknad.status}</Table.DataCell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </>
    )
}
export const getServerSideProps = initialProps

export default FriskmeldtPage
