import React, { useRef, useState } from 'react'
import {
    Alert,
    BodyLong,
    Button,
    DatePicker,
    Detail,
    Heading,
    Modal,
    Search,
    Table,
    useDatepicker,
} from '@navikt/ds-react'
import { FileIcon } from '@navikt/aksel-icons'

import { initialProps } from '../initialprops/initialProps'
import { useArbeidssoker, ArbeidssokerDetaljer } from '../queryhooks/useArbeidssoker'
import { useSoknader } from '../queryhooks/useSoknader'
import { useFtaVedtak } from '../queryhooks/useFtaVedtak'
import { useNyttFriskmeldtVedtak } from '../queryhooks/useNyttFriskmeldtVedtak'
import { useUbehandledeFtaVedtak } from '../queryhooks/useUbehandledeFtaVedtak'
import { useEndreStatusMutation } from '../queryhooks/useEndreFtaVedtakStatus'

const FriskmeldtPage = () => {
    const [fnr, setFnr] = useState<string>()
    const { data: ubehandlede } = useUbehandledeFtaVedtak()

    if (!fnr) {
        return (
            <>
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
                {ubehandlede && ubehandlede.length > 0 && (
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>ID</Table.HeaderCell>
                                <Table.HeaderCell>Fra</Table.HeaderCell>
                                <Table.HeaderCell>Til</Table.HeaderCell>
                                <Table.HeaderCell>Status</Table.HeaderCell>
                                <Table.HeaderCell>Fnr</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {ubehandlede.map((vedtak) => (
                                <Table.Row
                                    className="cursor-pointer"
                                    key={vedtak.id}
                                    onClick={() => {
                                        setFnr(vedtak.fnr)
                                    }}
                                >
                                    <Table.DataCell>{vedtak.id}</Table.DataCell>
                                    <Table.DataCell>{vedtak.fom}</Table.DataCell>{' '}
                                    <Table.DataCell>{vedtak.tom}</Table.DataCell>
                                    <Table.DataCell>{vedtak.behandletStatus}</Table.DataCell>
                                    <Table.DataCell>{vedtak.fnr}</Table.DataCell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                )}
            </>
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

    function arbeidssokerTekst() {
        if (arbeidssokerdata!.length == 0) {
            return {
                tekst: 'Ikke registrert arbeidssoker',
                color: 'bg-red-300 p-8 rounded',
            }
        }
        if (arbeidssokerdata![0].avsluttet) {
            return {
                tekst: 'Siste arbeidssøkerperiode avsluttet ' + arbeidssokerdata![0].avsluttet.tidspunkt,
                color: 'bg-red-300 p-8 rounded',
            }
        }
        return {
            tekst: 'Arbeidssøkerperiode startet ' + arbeidssokerdata![0].startet.tidspunkt,
            color: 'py-8',
        }
    }

    const tekstOgFarge = arbeidssokerTekst()
    return (
        <div className="mb-8">
            <Heading size="small">Arbeidssøkerregister status</Heading>
            <BodyLong className={tekstOgFarge.color}>{tekstOgFarge.tekst}</BodyLong>
        </div>
    )
}

const FriskmeldtEnkeltPerson = ({ fnr }: { fnr: string }) => {
    const { data: arbeidssokerdata } = useArbeidssoker(fnr, !!fnr && fnr.length == 11)

    return (
        <div className="max-w-6xl">
            <Heading level="1" size="medium" spacing>
                Friskmeldt {fnr}
            </Heading>
            <ArbeidssokerDetaljerVisning arbeidssokerdata={arbeidssokerdata} />
            <FtaVedtak fnr={fnr} />
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
                        <Table.HeaderCell>Fom</Table.HeaderCell>
                        <Table.HeaderCell>Tom</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {friskmeldtsoknader.map((soknad) => (
                        <Table.Row key={soknad.id}>
                            <Table.DataCell>{soknad.id}</Table.DataCell>
                            <Table.DataCell>{soknad.fom}</Table.DataCell> <Table.DataCell>{soknad.tom}</Table.DataCell>
                            <Table.DataCell>{soknad.status}</Table.DataCell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
        </>
    )
}

const FtaVedtak = ({ fnr }: { fnr: string }) => {
    const { data: vedtak, isLoading } = useFtaVedtak(fnr)
    const nyttVedtak = useNyttFriskmeldtVedtak()
    const ref = useRef<HTMLDialogElement>(null)
    const {
        datepickerProps: fomDpProps,
        inputProps: fomInputProps,
        selectedDay: fomDag,
    } = useDatepicker({ fromDate: new Date('2025-01-01') })
    const {
        datepickerProps: tomDpProps,
        inputProps: tomInputProps,
        selectedDay: tomDag,
    } = useDatepicker({ fromDate: new Date('2025-01-01') })

    const endreStatus = useEndreStatusMutation()

    if (isLoading || vedtak === undefined) {
        return <div>Laster vedtak...</div>
    }

    const ok = fomDag && tomDag && fomDag < tomDag

    // weeks between fom and tom
    function regnUtUker() {
        if (!fomDag || !tomDag) {
            return undefined
        }
        return Math.ceil((tomDag.getTime() - fomDag.getTime()) / (1000 * 60 * 60 * 24 * 7))
    }

    const weeks = regnUtUker()
    return (
        <>
            <Heading size="small" spacing>
                Vedtak i sykepengesoknad-backend
            </Heading>
            {vedtak.length == 0 && (
                <Alert variant="info" className="mb-8">
                    Ingen friskmeldt til arbeidsformidling vedtak registert
                </Alert>
            )}
            {vedtak.length > 0 && (
                <Table size="small" className="mb-8">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>ID</Table.HeaderCell>
                            <Table.HeaderCell>Fom</Table.HeaderCell>
                            <Table.HeaderCell>Tom</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>Opprettet</Table.HeaderCell>
                            <Table.HeaderCell>Avsluttet</Table.HeaderCell>
                            <Table.HeaderCell></Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {vedtak.map((vedtak) => {
                            return (
                                <Table.Row
                                    key={vedtak.id}
                                    className={vedtak.behandletStatus != 'BEHANDLET' ? 'bg-red-100' : ''}
                                >
                                    <Table.DataCell>{vedtak.id}</Table.DataCell>
                                    <Table.DataCell>{vedtak.fom}</Table.DataCell>{' '}
                                    <Table.DataCell>{vedtak.tom}</Table.DataCell>
                                    <Table.DataCell>{vedtak.behandletStatus}</Table.DataCell>
                                    <Table.DataCell>{vedtak.opprettet}</Table.DataCell>
                                    <Table.DataCell>{vedtak.avsluttetTidspunkt}</Table.DataCell>
                                    <Table.DataCell>
                                        {vedtak.behandletStatus == 'OVERLAPP' && (
                                            <Button
                                                size="small"
                                                variant="secondary-neutral"
                                                onClick={() => {
                                                    endreStatus.mutate({
                                                        request: {
                                                            id: vedtak.id,
                                                            status: 'OVERLAPP_OK',
                                                        },
                                                        fnr: fnr,
                                                    })
                                                }}
                                            >
                                                Marker ok
                                            </Button>
                                        )}
                                        {vedtak.behandletStatus == 'INGEN_ARBEIDSSOKERPERIODE' ||
                                            (vedtak.behandletStatus == 'SISTE_ARBEIDSSOKERPERIODE_AVSLUTTET' && (
                                                <Button
                                                    size="small"
                                                    variant="secondary-neutral"
                                                    onClick={() => {
                                                        endreStatus.mutate({
                                                            request: {
                                                                id: vedtak.id,
                                                                status: 'NY',
                                                            },
                                                            fnr: fnr,
                                                        })
                                                    }}
                                                >
                                                    Rebehandle
                                                </Button>
                                            ))}
                                    </Table.DataCell>
                                </Table.Row>
                            )
                        })}
                    </Table.Body>
                </Table>
            )}
            <Button
                className="mb-8"
                size="small"
                variant="secondary"
                onClick={() => {
                    ref.current?.showModal()
                }}
            >
                Legg til vedtak
            </Button>
            <Modal
                ref={ref}
                header={{
                    icon: <FileIcon aria-hidden />,
                    heading: 'Legg til vedtak',
                }}
            >
                <Modal.Body>
                    <div className="min-w-96 flex gap-8 mb-8">
                        <DatePicker {...fomDpProps}>
                            <DatePicker.Input {...fomInputProps} label="Fra og med" />
                        </DatePicker>
                        <DatePicker {...tomDpProps}>
                            <DatePicker.Input {...tomInputProps} label="Til og med" />
                        </DatePicker>
                    </div>
                    {/* weeks is not undefined */}
                    {weeks === undefined && <BodyLong spacing>Velg fra og til dato</BodyLong>}
                    {weeks !== undefined && (
                        <>
                            <BodyLong spacing>{weeks} uker valgt.</BodyLong>
                            {!ok && <Alert variant="warning">Fra og med må være før til og med</Alert>}
                        </>
                    )}
                    {weeks && weeks > 11 && <Alert variant="warning">Vedtak er over 11 uker</Alert>}
                    {nyttVedtak.error && <Alert variant="error">{JSON.stringify(nyttVedtak.error)}</Alert>}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        type="button"
                        loading={nyttVedtak.isPending}
                        disabled={!ok || (weeks !== undefined && weeks > 14)}
                        onClick={() => {
                            nyttVedtak.mutate({
                                request: {
                                    fnr: fnr,
                                    fom: fomDag?.toISOString().slice(0, 10) ?? '',
                                    tom: tomDag?.toISOString().slice(0, 10) ?? '',
                                },
                                callback: () => {
                                    ref.current?.close()
                                },
                            })
                        }}
                    >
                        Lagre
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => ref.current?.close()}>
                        Lukk
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}
export const getServerSideProps = initialProps

export default FriskmeldtPage
