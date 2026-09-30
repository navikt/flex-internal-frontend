import React, { useState } from 'react'
import { BodyShort, Heading, ReadMore, Table } from '@navikt/ds-react'

import type { RSVedtakWrapper, Utbetalingsdag } from '../queryhooks/useVedtakForSoknad'
import { formaterDato, toDateEllerUndefined } from '../utils/dato-utils'

import { Detaljer } from './Detaljer'
import type { Filter } from './Filter'

const kroneformat = new Intl.NumberFormat('nb-NO')

function datoTekst(dato: string | null | undefined): string {
    const verdi = toDateEllerUndefined(dato)
    return verdi ? formaterDato(verdi, 'd. MMMM yyyy') : dato || 'Ikke oppgitt'
}

function periodeTekst(fom: string | undefined, tom: string | undefined): string {
    const fra = toDateEllerUndefined(fom)
    const til = toDateEllerUndefined(tom)
    if (!fra || !til) return 'Ikke oppgitt'
    if (formaterDato(fra, 'yyyy-MM') === formaterDato(til, 'yyyy-MM')) {
        return `${formaterDato(fra, 'd.')}–${formaterDato(til, 'd. MMMM yyyy')}`
    }
    return `${datoTekst(fom)}–${datoTekst(tom)}`
}

function beløpTekst(beløp: number | null | undefined): string {
    return beløp == null ? '–' : `${kroneformat.format(beløp)} kr`
}

function DagRader({ dager }: { dager: readonly Utbetalingsdag[] }) {
    return (
        <div className="overflow-x-auto">
            <Table size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell scope="col">Dato</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Dagtype</Table.HeaderCell>
                        <Table.HeaderCell scope="col" align="right">
                            Til arbeidsgiver
                        </Table.HeaderCell>
                        <Table.HeaderCell scope="col" align="right">
                            Til sykmeldt
                        </Table.HeaderCell>
                        <Table.HeaderCell scope="col" align="right">
                            Sykdomsgrad
                        </Table.HeaderCell>
                        <Table.HeaderCell scope="col">Begrunnelser</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {dager.map((dag, indeks) => (
                        <Table.Row key={`${dag.dato}-${indeks}`}>
                            <Table.HeaderCell scope="row">{datoTekst(dag.dato)}</Table.HeaderCell>
                            <Table.DataCell>{dag.type}</Table.DataCell>
                            <Table.DataCell align="right">{beløpTekst(dag.beløpTilArbeidsgiver)}</Table.DataCell>
                            <Table.DataCell align="right">{beløpTekst(dag.beløpTilSykmeldt)}</Table.DataCell>
                            <Table.DataCell align="right">
                                {dag.sykdomsgrad == null ? '–' : `${dag.sykdomsgrad} %`}
                            </Table.DataCell>
                            <Table.DataCell>{dag.begrunnelser.join(', ') || '–'}</Table.DataCell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </div>
    )
}

export function VedtakOppsummering({ vedtak }: { vedtak: RSVedtakWrapper }) {
    const [filter, setFilter] = useState<Filter[]>([])
    const utbetaling = vedtak.vedtak.utbetaling
    const dager = utbetaling.utbetalingsdager

    return (
        <div className="space-y-3">
            <div>
                {vedtak.annullert && <BodyShort>Vedtaket er annullert</BodyShort>}
                {vedtak.revurdert && <BodyShort>Tidligere vedtak, revurdert</BodyShort>}
                <BodyShort>Periode: {periodeTekst(vedtak.vedtak.fom, vedtak.vedtak.tom)}</BodyShort>
                {vedtak.orgnavn && <BodyShort>{vedtak.orgnavn}</BodyShort>}
                {vedtak.vedtak.organisasjonsnummer && (
                    <BodyShort>Organisasjonsnummer: {vedtak.vedtak.organisasjonsnummer}</BodyShort>
                )}
                {vedtak.vedtak.vedtakFattetTidspunkt && (
                    <BodyShort>Vedtaksdato: {datoTekst(vedtak.vedtak.vedtakFattetTidspunkt)}</BodyShort>
                )}
                {utbetaling.utbetalingType && <BodyShort>Utbetalingstype: {utbetaling.utbetalingType}</BodyShort>}
                {vedtak.sykepengebelopSykmeldt != null && (
                    <BodyShort>Til sykmeldt i vedtaket: {beløpTekst(vedtak.sykepengebelopSykmeldt)}</BodyShort>
                )}
                {vedtak.sykepengebelopArbeidsgiver != null && (
                    <BodyShort>Til arbeidsgiver i vedtaket: {beløpTekst(vedtak.sykepengebelopArbeidsgiver)}</BodyShort>
                )}
                <BodyShort>
                    {dager === undefined || dager === null
                        ? 'Dagliste mangler i vedtaksdata'
                        : dager.length === 0
                          ? 'Ingen dager i utbetalingen'
                          : `${dager.length} dager i utbetalingen`}
                </BodyShort>
            </div>
            {dager && dager.length > 0 && (
                <ReadMore header={`Dager i utbetalingen (${dager.length})`}>
                    <Heading size="xsmall" level="4">
                        Faktiske dager fra utbetalingen
                    </Heading>
                    <DagRader dager={dager} />
                </ReadMore>
            )}
            <ReadMore header="Alle vedtaksdata">
                <Detaljer objekt={vedtak} filter={filter} setFilter={setFilter} />
            </ReadMore>
        </div>
    )
}
