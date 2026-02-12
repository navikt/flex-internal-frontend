import React, { useEffect, useRef, useState } from 'react'
import {
    Alert,
    BodyLong,
    Button,
    DatePicker,
    Detail,
    Heading,
    Modal,
    Radio,
    RadioGroup,
    Search,
    Table,
    useDatepicker,
} from '@navikt/ds-react'
import { ArrowsCirclepathIcon, FileIcon, TrashIcon } from '@navikt/aksel-icons'
import { useQueryClient } from '@tanstack/react-query'
import dayjs from 'dayjs'

import { initialProps } from '../initialprops/initialProps'
import { useArbeidssoker, ArbeidssokerDetaljer } from '../queryhooks/useArbeidssoker'
import { useSoknader } from '../queryhooks/useSoknader'
import { FtaVedtak, useFtaVedtak } from '../queryhooks/useFtaVedtak'
import { useNyttFriskmeldtVedtak } from '../queryhooks/useNyttFriskmeldtVedtak'
import { useUbehandledeFtaVedtak } from '../queryhooks/useUbehandledeFtaVedtak'
import { useEndreStatusMutation } from '../queryhooks/useEndreFtaVedtakStatus'
import { formatterTimestamp } from '../utils/formatterDatoer'
import ArbeidssokerperioderTable from '../components/FlexArbeidssokerregisterPerioder'
import { useFtaVedtakIgnorerArbeidssokerregister } from '../queryhooks/useFtaVedtakIgnorerArbeidssøkerregister'
import { useEndreFtaVedtakTomMutation } from '../queryhooks/useEndreFtaVedtakTom'
import { useDeleteFtaSoknadMutation } from '../queryhooks/useDeleteFtaSoknad'

const FriskmeldtPage = () => {
    const [fnr, setFnr] = useState<string>()
    const { data: ubehandlede } = useUbehandledeFtaVedtak()

    useEffect(() => {
        if (fnr) {
            window.history.pushState({ personSelected: true }, '')
        }
    }, [fnr])

    useEffect(() => {
        const onPopState = () => {
            if (fnr) {
                setFnr('')
            }
        }
        window.addEventListener('popstate', onPopState)
        return () => window.removeEventListener('popstate', onPopState)
    }, [fnr])

    if (!fnr) {
        return (
            <>
                <Search
                    className="w-56"
                    label="Søk opp person"
                    onSearchClick={(input) => {
                        let fnr = input.trim()
                        if (fnr.length == 10) {
                            fnr = '0' + fnr
                        }

                        if (fnr.length == 11) {
                            setFnr(fnr)
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
                                <Table.HeaderCell></Table.HeaderCell>
                                <Table.HeaderCell>ID</Table.HeaderCell>
                                <Table.HeaderCell>Fnr</Table.HeaderCell>
                                <Table.HeaderCell>Fra</Table.HeaderCell>
                                <Table.HeaderCell>Til</Table.HeaderCell>
                                <Table.HeaderCell>Status</Table.HeaderCell>
                                <Table.HeaderCell>Opprettet</Table.HeaderCell>
                                <Table.HeaderCell>Behandlet</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {ubehandlede.map((vedtak, i) => (
                                <Table.Row
                                    className="cursor-pointer"
                                    key={vedtak.id}
                                    onClick={() => {
                                        setFnr(vedtak.fnr)
                                    }}
                                >
                                    <Table.DataCell>{i + 1}</Table.DataCell>
                                    <Table.DataCell>{vedtak.id}</Table.DataCell>
                                    <Table.DataCell>{vedtak.fnr}</Table.DataCell>
                                    <Table.DataCell>{vedtak.fom}</Table.DataCell>
                                    <Table.DataCell>{vedtak.tom}</Table.DataCell>
                                    <Table.DataCell>{vedtak.behandletStatus}</Table.DataCell>
                                    <Table.DataCell>{formatterTimestamp(vedtak.opprettet)}</Table.DataCell>
                                    <Table.DataCell>{formatterTimestamp(vedtak.behandletTidspunkt)}</Table.DataCell>
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
                color: 'bg-ax-danger-400 p-8 rounded-sm',
            }
        }
        if (arbeidssokerdata![0].avsluttet) {
            return {
                tekst:
                    'Siste arbeidssøkerperiode med id ' +
                    arbeidssokerdata![0].periodeId +
                    ' avsluttet ' +
                    formatterTimestamp(arbeidssokerdata![0].avsluttet.tidspunkt),
                color: 'bg-ax-danger-400 p-8 rounded-sm',
            }
        }
        return {
            tekst:
                'Arbeidssøkerperiode med id ' +
                arbeidssokerdata![0].periodeId +
                ' startet ' +
                formatterTimestamp(arbeidssokerdata![0].startet.tidspunkt),
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
    const queryclient = useQueryClient()
    return (
        <div className="max-w-6xl">
            <Heading level="1" size="medium" spacing>
                Friskmeldt {fnr}
            </Heading>
            <Button
                icon={<ArrowsCirclepathIcon aria-hidden />}
                className="mb-6"
                size="small"
                variant="secondary"
                onClick={() => {
                    queryclient.invalidateQueries({
                        queryKey: ['fta-vedtak-for-person', fnr],
                    })
                    queryclient.invalidateQueries({
                        queryKey: ['soknad', fnr],
                    })
                    queryclient.invalidateQueries({
                        queryKey: ['arbeidssokerperioder', fnr],
                    })
                }}
            >
                Refresh
            </Button>
            <ArbeidssokerDetaljerVisning arbeidssokerdata={arbeidssokerdata} />
            <FtaVedtakComp fnr={fnr} />
            <Soknader fnr={fnr} />
            <ArbeidssokerperioderTable fnr={fnr} />
        </div>
    )
}

const Soknader = ({ fnr }: { fnr: string }) => {
    const { data: soknader, isLoading } = useSoknader(fnr, !!fnr && fnr.length == 11)
    const [selectedSoknad, setSelectedSoknad] = useState<string | null>(null)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const deleteSoknad = useDeleteFtaSoknadMutation()
    const ref = useRef<HTMLDialogElement>(null)

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

    const handleDelete = () => {
        if (selectedSoknad) {
            deleteSoknad.mutate({
                request: {
                    fnr: fnr,
                    sykepengesoknadId: selectedSoknad,
                },
                fnr: fnr,
                callback: () => {
                    setShowDeleteModal(false)
                    setSelectedSoknad(null)
                },
            })
        }
    }

    const openDeleteModal = (soknadId: string) => {
        setSelectedSoknad(soknadId)
        setShowDeleteModal(true)
        if (ref.current) {
            ref.current.showModal()
        }
    }

    const closeDeleteModal = () => {
        setShowDeleteModal(false)
        setSelectedSoknad(null)
        if (ref.current) {
            ref.current.close()
        }
    }

    return (
        <>
            <Heading size="small">Søknader</Heading>
            <Detail spacing>Viser kun søknadstype Friskmeldt Til Arbeidsformidling</Detail>
            <Table size="small">
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>ID</Table.HeaderCell>
                        <Table.HeaderCell>Fom</Table.HeaderCell>
                        <Table.HeaderCell>Tom</Table.HeaderCell>
                        <Table.HeaderCell>Status</Table.HeaderCell>
                        <Table.HeaderCell>Slett</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {friskmeldtsoknader.map((soknad) => (
                        <Table.Row key={soknad.id}>
                            <Table.DataCell>{soknad.id}</Table.DataCell>
                            <Table.DataCell>{soknad.fom}</Table.DataCell> <Table.DataCell>{soknad.tom}</Table.DataCell>
                            <Table.DataCell>{soknad.status}</Table.DataCell>
                            <Table.DataCell>
                                {(soknad.status === 'NY' || soknad.status === 'FREMTIDIG') && (
                                    <Button
                                        icon={<TrashIcon title="Slett søknad" fontSize="1.5rem" />}
                                        size="small"
                                        variant="tertiary"
                                        onClick={() => openDeleteModal(soknad.id)}
                                    />
                                )}
                            </Table.DataCell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table>
            <Modal ref={ref} header={{ heading: 'Bekreft sletting' }} open={showDeleteModal} onClose={closeDeleteModal}>
                <Modal.Body>
                    <BodyLong>Er du sikker på at du vil slette denne søknaden?</BodyLong>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        data-color="danger"
                        variant="primary"
                        onClick={handleDelete}
                        loading={deleteSoknad.isPending}
                    >
                        Slett
                    </Button>
                    <Button variant="secondary" onClick={closeDeleteModal}>
                        Avbryt
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

const EndreTomDato = ({ vedtak }: { vedtak: FtaVedtak }) => {
    const { datepickerProps, inputProps, selectedDay } = useDatepicker({
        defaultSelected: new Date(vedtak.tom),
    })
    const formattertSelected = dayjs(selectedDay).format('YYYY-MM-DD')
    const endreTom = useEndreFtaVedtakTomMutation()
    return (
        <div className="mt-8">
            <DatePicker {...datepickerProps}>
                <DatePicker.Input {...inputProps} label="Endre tom" size="small" />
            </DatePicker>
            {formattertSelected !== vedtak.tom && (
                <Button
                    className="mt-8"
                    size="small"
                    variant="primary"
                    loading={endreTom.isPending}
                    onClick={() => {
                        endreTom.mutate({
                            request: {
                                id: vedtak.id,
                                tom: formattertSelected,
                            },
                            fnr: vedtak.fnr,
                        })
                    }}
                >
                    Lagre ny tom
                </Button>
            )}
        </div>
    )
}

const FtaVedtakComp = ({ fnr }: { fnr: string }) => {
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
    const [ignorerArbeidssokerregister, setIgnorerArbeidssokerregister] = useState(false)
    const endreStatus = useEndreStatusMutation()
    const ignorerArbs = useFtaVedtakIgnorerArbeidssokerregister()

    if (isLoading || vedtak === undefined) {
        return <div>Laster vedtak...</div>
    }

    const ok = fomDag && tomDag && fomDag <= tomDag

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
                            <Table.HeaderCell></Table.HeaderCell>

                            <Table.HeaderCell>ID</Table.HeaderCell>
                            <Table.HeaderCell>Fom</Table.HeaderCell>
                            <Table.HeaderCell>Tom</Table.HeaderCell>
                            <Table.HeaderCell>Status</Table.HeaderCell>
                            <Table.HeaderCell>Ignorer arbeidssøker</Table.HeaderCell>
                            <Table.HeaderCell>Opprettet</Table.HeaderCell>
                            <Table.HeaderCell>Avsluttet</Table.HeaderCell>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {vedtak.map((vedtak) => {
                            const fargeFraStatus = () => {
                                switch (vedtak.behandletStatus) {
                                    case 'BEHANDLET':
                                        return ''
                                    case 'NY':
                                        return 'bg-yellow-100'
                                    case 'OVERLAPP':
                                        return 'bg-ax-danger-200'
                                    case 'OVERLAPP_OK':
                                        return ''
                                    default:
                                        return 'bg-ax-danger-200'
                                }
                            }

                            const rebehandle =
                                vedtak.behandletStatus == 'OVERLAPP' ||
                                vedtak.behandletStatus == 'INGEN_ARBEIDSSOKERPERIODE' ||
                                vedtak.behandletStatus == 'SISTE_ARBEIDSSOKERPERIODE_AVSLUTTET'
                            return (
                                <Table.ExpandableRow
                                    key={vedtak.id}
                                    className={fargeFraStatus()}
                                    content={
                                        <div>
                                            <div className="flex gap-8">
                                                {vedtak.behandletStatus == 'OVERLAPP' && (
                                                    <Button
                                                        data-color="neutral"
                                                        size="small"
                                                        variant="secondary"
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
                                                {vedtak.behandletStatus == 'BEHANDLET' && (
                                                    <Button
                                                        data-color="neutral"
                                                        size="small"
                                                        variant="secondary"
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
                                                        Sett til NY og rebehandle
                                                    </Button>
                                                )}
                                                {!vedtak.ignorerArbeidssokerregister && (
                                                    <Button
                                                        data-color="neutral"
                                                        size="small"
                                                        variant="secondary"
                                                        onClick={() => {
                                                            ignorerArbs.mutate({
                                                                request: {
                                                                    id: vedtak.id,
                                                                    ignorerArbeidssokerregister: true,
                                                                },
                                                                fnr: fnr,
                                                            })
                                                        }}
                                                    >
                                                        Ignorer arbeidssøkerregister
                                                    </Button>
                                                )}
                                                {rebehandle && (
                                                    <Button
                                                        data-color="neutral"
                                                        size="small"
                                                        variant="secondary"
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
                                                )}
                                            </div>
                                            <EndreTomDato vedtak={vedtak} />
                                        </div>
                                    }
                                >
                                    <Table.DataCell>{vedtak.id}</Table.DataCell>
                                    <Table.DataCell>{vedtak.fom}</Table.DataCell>{' '}
                                    <Table.DataCell>{vedtak.tom}</Table.DataCell>
                                    <Table.DataCell>{vedtak.behandletStatus}</Table.DataCell>
                                    <Table.DataCell>{vedtak.ignorerArbeidssokerregister && '✅'}</Table.DataCell>
                                    <Table.DataCell>{formatterTimestamp(vedtak.opprettet)}</Table.DataCell>
                                    <Table.DataCell>{formatterTimestamp(vedtak.avsluttetTidspunkt)}</Table.DataCell>
                                    <Table.DataCell></Table.DataCell>
                                </Table.ExpandableRow>
                            )
                        })}
                    </Table.Body>
                </Table>
            )}
            <div className="mb-8 flex gap-8">
                <Button
                    data-color="neutral"
                    size="small"
                    variant="secondary"
                    onClick={() => {
                        ref.current?.showModal()
                    }}
                >
                    Legg til vedtak
                </Button>
            </div>
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

                    {weeks === undefined && <BodyLong spacing>Velg fra og til dato</BodyLong>}
                    {weeks !== undefined && (
                        <>
                            <BodyLong spacing>{weeks} uker valgt.</BodyLong>
                            {!ok && <Alert variant="warning">Fra og med må være før til og med</Alert>}
                            {weeks > 12 && <Alert variant="warning">Vedtak er over 12 uker</Alert>}
                        </>
                    )}
                    <RadioGroup
                        size="small"
                        legend="Arbeidsøkerregister"
                        onChange={() => {
                            setIgnorerArbeidssokerregister(!ignorerArbeidssokerregister)
                        }}
                        value={ignorerArbeidssokerregister + ''}
                    >
                        <Radio value="false">Overta ansvar og gjør oppdateringer i registeret</Radio>
                        <Radio value="true">Ignorer arbeidssøkerregisteret</Radio>
                    </RadioGroup>
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
                                    ignorerArbeidssokerregister: ignorerArbeidssokerregister,
                                    fom: fomDag ? dayjs(fomDag).format('YYYY-MM-DD') : '',
                                    tom: tomDag ? dayjs(tomDag).format('YYYY-MM-DD') : '',
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
