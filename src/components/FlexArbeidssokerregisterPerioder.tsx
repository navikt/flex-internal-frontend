import React, { useState } from 'react'
import { Alert, Button, Detail, Heading, Table } from '@navikt/ds-react'
import dayjs from 'dayjs'
import { DatePicker, useDatepicker } from '@navikt/ds-react'

import {
    PeriodebekreftelseResponse,
    useFlexArbeidssokerperioder,
    ArbeidssokerperiodeResponse,
} from '../queryhooks/useFlexArbeidssokerperioder'
import { useOppdaterArbeidssokerperiodeTomMutation } from '../queryhooks/useOppdaterArbeidssokerperiodeTom'
import { useOppdaterArbeidssokerperiodeIdMutation } from '../queryhooks/useOppdaterArbeidssokerperiodeId'

// Komponent for å endre vedtaksperiodeTom
const EndreVedtaksperiodeTom: React.FC<{ periode: ArbeidssokerperiodeResponse }> = ({ periode }) => {
    const { datepickerProps, inputProps, selectedDay } = useDatepicker({
        defaultSelected: new Date(periode.vedtaksperiodeTom),
    })
    const formattertSelected = dayjs(selectedDay).format('YYYY-MM-DD')
    const oppdaterTom = useOppdaterArbeidssokerperiodeTomMutation()

    return (
        <div className="mt-4 mb-4">
            <DatePicker {...datepickerProps}>
                <DatePicker.Input {...inputProps} label="Endre Vedtaksperiode til" size="small" />
            </DatePicker>
            {formattertSelected !== periode.vedtaksperiodeTom && (
                <Button
                    className="mt-4"
                    size="small"
                    variant="primary"
                    loading={oppdaterTom.isPending}
                    onClick={() => {
                        oppdaterTom.mutate({
                            request: {
                                id: periode.id,
                                vedtaksperiodeTom: formattertSelected,
                            },
                            fnr: periode.fnr,
                        })
                    }}
                >
                    Lagre ny Vedtaksperiode til
                </Button>
            )}
        </div>
    )
}

// Komponent for å endre arbeidssokerperiodeId
const EndreArbeidssokerperiodeId: React.FC<{ periode: ArbeidssokerperiodeResponse }> = ({ periode }) => {
    const [arbeidssokerperiodeId, setArbeidssokerperiodeId] = useState(periode.arbeidssokerperiodeId || '')
    const oppdaterArbeidssokerperiodeId = useOppdaterArbeidssokerperiodeIdMutation()
    const isChanged = arbeidssokerperiodeId !== periode.arbeidssokerperiodeId

    return (
        <div className="mt-4 mb-4">
            <div className="flex items-end gap-4">
                <div>
                    <label htmlFor="arbeidssokerperiodeId" className="text-sm font-medium mb-1 block">
                        Endre Arbeidssøkerperiode ID
                    </label>
                    <input
                        id="arbeidssokerperiodeId"
                        type="text"
                        className="border border-gray-300 rounded-md p-2 text-sm"
                        value={arbeidssokerperiodeId}
                        onChange={(e) => setArbeidssokerperiodeId(e.target.value)}
                    />
                </div>
                {isChanged && (
                    <Button
                        size="small"
                        variant="primary"
                        loading={oppdaterArbeidssokerperiodeId.isPending}
                        onClick={() => {
                            oppdaterArbeidssokerperiodeId.mutate({
                                request: {
                                    id: periode.id,
                                    arbeidssokerperiodeId: arbeidssokerperiodeId,
                                },
                                fnr: periode.fnr,
                            })
                        }}
                    >
                        Lagre ny Arbeidssøkerperiode ID
                    </Button>
                )}
            </div>
        </div>
    )
}

// Komponent for å vise periodebekreftelsene i en egen tabell
const PeriodebekreftelserTable: React.FC<{ periodebekreftelser: PeriodebekreftelseResponse[] }> = ({
    periodebekreftelser,
}) => {
    return (
        <Table size="small">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>ID</Table.HeaderCell>
                    <Table.HeaderCell>Sykepengesøknad ID</Table.HeaderCell>
                    <Table.HeaderCell>Fortsatt arbeidssøker</Table.HeaderCell>
                    <Table.HeaderCell>Inntekt underveis</Table.HeaderCell>
                    <Table.HeaderCell>Opprettet</Table.HeaderCell>
                    <Table.HeaderCell>Avsluttende søknad</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {periodebekreftelser.map((pb) => (
                    <Table.Row key={pb.id}>
                        <Table.DataCell>{pb.id}</Table.DataCell>
                        <Table.DataCell>{pb.sykepengesoknadId}</Table.DataCell>
                        <Table.DataCell>{pb.fortsattArbeidssoker ? 'Ja' : 'Nei'}</Table.DataCell>
                        <Table.DataCell>{pb.inntektUnderveis ? 'Ja' : 'Nei'}</Table.DataCell>
                        <Table.DataCell>{dayjs(pb.opprettet).format('DD.MM.YYYY HH:mm')}</Table.DataCell>
                        <Table.DataCell>{pb.avsluttendeSoknad ? 'Ja' : 'Nei'}</Table.DataCell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table>
    )
}

// Hovedkomponent som viser arbeidssøkerperiodene med mulighet for å vise periodebekreftelser
interface ArbeidssokerperioderTableProps {
    fnr: string
}

const ArbeidssokerperioderTable: React.FC<ArbeidssokerperioderTableProps> = ({ fnr }) => {
    const { data, isLoading, isError } = useFlexArbeidssokerperioder(fnr)
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

    if (isLoading) {
        return <div>Laster arbeidssøkerperioder...</div>
    }

    if (isError || !data) {
        return <Alert variant="error">Det oppsto en feil ved henting av arbeidssøkerperioder.</Alert>
    }

    // Sorterer periodene basert på vedtaksperiodeFom
    const sortedPerioder = data.arbeidssokerperioder.sort((a, b) =>
        dayjs(a.vedtaksperiodeFom).diff(dayjs(b.vedtaksperiodeFom)),
    )

    const toggleRow = (id: string) => {
        setExpandedRows((prev) => {
            const newSet = new Set(prev)
            if (newSet.has(id)) {
                newSet.delete(id)
            } else {
                newSet.add(id)
            }
            return newSet
        })
    }

    return (
        <>
            <Heading size="small" className="mt-8">
                Arbeidssøkerperioder
            </Heading>
            <Detail spacing>Oversikt over registrerte arbeidssøkerperioder med tilhørende periodebekreftelser</Detail>
            <Table size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell />
                        <Table.HeaderCell>ID</Table.HeaderCell>
                        <Table.HeaderCell>FNR</Table.HeaderCell>
                        <Table.HeaderCell>Vedtaksperiode ID</Table.HeaderCell>
                        <Table.HeaderCell>Vedtaksperiode fra</Table.HeaderCell>
                        <Table.HeaderCell>Vedtaksperiode til</Table.HeaderCell>
                        <Table.HeaderCell>Arbeidssøkerregisterperiode ID</Table.HeaderCell>
                        <Table.HeaderCell>Opprettet</Table.HeaderCell>
                        <Table.HeaderCell>Avsluttet</Table.HeaderCell>
                        <Table.HeaderCell>Avsluttet årsak</Table.HeaderCell>
                        <Table.HeaderCell>Antall periodebekreftelser</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {sortedPerioder.map((periode) => (
                        <React.Fragment key={periode.id}>
                            <Table.Row>
                                <Table.DataCell>
                                    <Button variant="tertiary" size="small" onClick={() => toggleRow(periode.id)}>
                                        {expandedRows.has(periode.id) ? 'Skjul' : 'Vis'}
                                    </Button>
                                </Table.DataCell>
                                <Table.DataCell>{periode.id}</Table.DataCell>
                                <Table.DataCell>{periode.fnr}</Table.DataCell>
                                <Table.DataCell>{periode.vedtaksperiodeId}</Table.DataCell>
                                <Table.DataCell>{periode.vedtaksperiodeFom}</Table.DataCell>
                                <Table.DataCell>{periode.vedtaksperiodeTom}</Table.DataCell>
                                <Table.DataCell>{periode.arbeidssokerperiodeId}</Table.DataCell>
                                <Table.DataCell>{dayjs(periode.opprettet).format('DD.MM.YYYY HH:mm')}</Table.DataCell>
                                <Table.DataCell>
                                    {periode.avsluttetTidspunkt &&
                                        dayjs(periode.avsluttetTidspunkt).format('DD.MM.YYYY HH:mm')}
                                </Table.DataCell>
                                <Table.DataCell>{periode.avsluttetAarsak}</Table.DataCell>
                                <Table.DataCell>
                                    {periode.periodebekreftelser ? periode.periodebekreftelser.length : 0}
                                </Table.DataCell>
                            </Table.Row>
                            {expandedRows.has(periode.id) && (
                                <Table.Row>
                                    <Table.DataCell colSpan={11}>
                                        <div className="flex flex-col md:flex-row md:gap-8">
                                            <EndreVedtaksperiodeTom periode={periode} />
                                            <EndreArbeidssokerperiodeId periode={periode} />
                                        </div>
                                        {periode.periodebekreftelser && periode.periodebekreftelser.length > 0 ? (
                                            <PeriodebekreftelserTable
                                                periodebekreftelser={periode.periodebekreftelser}
                                            />
                                        ) : (
                                            <Alert variant="info" size="small">
                                                Ingen periodebekreftelser funnet.
                                            </Alert>
                                        )}
                                    </Table.DataCell>
                                </Table.Row>
                            )}
                        </React.Fragment>
                    ))}
                </Table.Body>
            </Table>
        </>
    )
}

export default ArbeidssokerperioderTable
