import React, { Fragment, useEffect, useState } from 'react'
import { Timeline } from '@navikt/ds-react'

import { dayjsToDate, KlippetSykepengesoknadRecord, RSSoknadstatusType, Soknad } from '../queryhooks/useSoknader'
import { Klipp, perioderSomMangler } from '../utils/overlapp'

import { Filter, FilterFelt } from './Filter'

interface SoknadGruppering {
    soknad: Soknad
    klippingAvSoknad: Klipp[]
}

interface SykmeldingGruppering {
    soknader: Map<string, SoknadGruppering>
    klippingAvSykmelding: Klipp[]
}

function gruppering(soknader: Soknad[], klipp: KlippetSykepengesoknadRecord[]) {
    const sykmeldingGruppering = new Map<string, SykmeldingGruppering>()

    soknader.forEach((sok) => {
        const key = sok.sykmeldingId!

        if (!sykmeldingGruppering.has(key)) {
            sykmeldingGruppering.set(key, {
                soknader: new Map<string, SoknadGruppering>(),
                klippingAvSykmelding: [],
            })
        }

        sykmeldingGruppering.get(key)?.soknader.set(sok.id, { soknad: sok, klippingAvSoknad: [] })
    })

    const fullstendigKlipp = klipp.filter((k) => k.periodeEtter === null)
    fullstendigKlipp.forEach((k) => {
        const perioderSomErKlippet = perioderSomMangler(k)

        if (k.klippVariant.startsWith('SYKMELDING')) {
            // Sykmeldingen ble klippet før vi opprettet søknader for den
            sykmeldingGruppering.set(k.sykmeldingUuid, {
                soknader: new Map<string, SoknadGruppering>(),
                klippingAvSykmelding: [...perioderSomErKlippet],
            })
        }
        if (k.klippVariant.startsWith('SOKNAD')) {
            let sykmeldingEksisterte = false

            // Noen ganger er hele søknaden klippet bort, men sykmelding var lang og vi finner fremdeles sykmeldingen
            sykmeldingGruppering.forEach((sokGruppering) => {
                // TODO: Vi finner aldri denne søknaden, og vi kjenner heller ikke sykmelding id'n, så i disse tilfellene klarer vi ikke koble sammen klipping av søknad med riktig sykmelding
                if (sokGruppering.soknader.has(k.sykepengesoknadUuid)) {
                    sokGruppering.soknader.get(k.sykepengesoknadUuid)?.klippingAvSoknad.push(...perioderSomErKlippet)
                    sykmeldingEksisterte = true
                }
            })

            // Når hele søknaden er klippet bort og det ikke fantes flere søknader på samme sykmelding
            if (!sykmeldingEksisterte) {
                const ghostSoknad = new Soknad({
                    id: k.sykepengesoknadUuid,
                    sykmeldingId: k.sykmeldingUuid + '_GHOST',
                    soknadstype: 'ARBEIDSTAKERE',
                    arbeidssituasjon: 'ARBEIDSTAKER',
                })

                if (!sykmeldingGruppering.has(ghostSoknad.sykmeldingId!)) {
                    sykmeldingGruppering.set(ghostSoknad.sykmeldingId!, {
                        soknader: new Map<string, SoknadGruppering>(),
                        klippingAvSykmelding: [],
                    })
                }

                sykmeldingGruppering.get(ghostSoknad.sykmeldingId!)?.soknader.set(k.sykepengesoknadUuid, {
                    soknad: ghostSoknad,
                    klippingAvSoknad: [...perioderSomErKlippet],
                })
            }
        }
    })

    const delvisKlipp = klipp.filter((k) => k.periodeEtter !== null)
    delvisKlipp.forEach((k) => {
        const perioderSomErKlippet = perioderSomMangler(k)

        if (k.klippVariant.startsWith('SYKMELDING')) {
            sykmeldingGruppering.get(k.sykmeldingUuid)?.klippingAvSykmelding.push(...perioderSomErKlippet)
        }
        if (k.klippVariant.startsWith('SOKNAD')) {
            sykmeldingGruppering.forEach((sokGruppering) => {
                sokGruppering.soknader.get(k.sykepengesoknadUuid)?.klippingAvSoknad.push(...perioderSomErKlippet)
            })
        }
    })

    return sykmeldingGruppering
}

export default function Tidslinje({
    soknader,
    klipp,
    filter,
    setFilter,
}: {
    soknader: Soknad[]
    klipp: KlippetSykepengesoknadRecord[]
    filter: Filter[]
    setFilter: (prev: any) => void
}) {
    const [soknaderGruppertPaSykmeldinger, setSoknaderGruppertPaSykmeldinger] =
        useState<Map<string, SykmeldingGruppering>>()

    useEffect(() => {
        setSoknaderGruppertPaSykmeldinger(gruppering(soknader, klipp))
    }, [soknader, klipp])

    function timelinePeriodeStatus(status: RSSoknadstatusType) {
        if (['AVBRUTT', 'SLETTET', 'UTGAATT'].includes(status)) {
            return 'warning'
        }
        if (['SENDT', 'KORRIGERT'].includes(status)) {
            return 'success'
        }
        return 'info'
    }

    function SoknadDetaljer({ soknad }: { soknad: Soknad }) {
        return (
            <Fragment>
                {Object.entries(soknad).map(([key, val], idx) => (
                    <div key={key + idx}>
                        <FilterFelt prop={key} verdi={val} filter={filter} setFilter={setFilter} />
                        {` ${key}: ${JSON.stringify(val)}`}
                    </div>
                ))}
            </Fragment>
        )
    }

    function KlippDetaljer({ klipp }: { klipp: Klipp }) {
        return (
            <Fragment>
                {Object.entries(klipp).map(([key, val], idx) => (
                    <div key={key + idx}>{`${key}: ${JSON.stringify(val)}`}</div>
                ))}
            </Fragment>
        )
    }

    if (soknader.length === 0 || !soknaderGruppertPaSykmeldinger || soknaderGruppertPaSykmeldinger.size === 0) {
        return <Fragment />
    }

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <Timeline>
                {Array.from(soknaderGruppertPaSykmeldinger.entries()).map(([sykId, syk]) => {
                    const erGhostSykmelding = sykId.endsWith('_GHOST')

                    return (
                        <Timeline.Row key={sykId} label={erGhostSykmelding ? 'Sykmelding 👻' : 'Sykmelding'}>
                            {Array.from(syk.soknader.values())
                                .flatMap((sok: SoknadGruppering) => {
                                    const klippingAvSoknad = sok.klippingAvSoknad.map((k) => (
                                        <Timeline.Period
                                            start={dayjsToDate(k.fom)!}
                                            end={dayjsToDate(k.tom)!}
                                            status="neutral"
                                            key={k.tom}
                                        >
                                            <KlippDetaljer klipp={k} />
                                        </Timeline.Period>
                                    ))

                                    if (!erGhostSykmelding) {
                                        klippingAvSoknad.push(
                                            <Timeline.Period
                                                start={dayjsToDate(sok.soknad.fom!)!}
                                                end={dayjsToDate(sok.soknad.tom!)!}
                                                status={timelinePeriodeStatus(sok.soknad.status)}
                                                key={sok.soknad.tom}
                                            >
                                                <SoknadDetaljer soknad={sok.soknad} />
                                            </Timeline.Period>,
                                        )
                                    }

                                    return klippingAvSoknad
                                })
                                .concat(
                                    syk.klippingAvSykmelding.map((k) => (
                                        <Timeline.Period
                                            start={dayjsToDate(k.fom)!}
                                            end={dayjsToDate(k.tom)!}
                                            status="neutral"
                                            key={k.tom}
                                        >
                                            <KlippDetaljer klipp={k} />
                                        </Timeline.Period>
                                    )),
                                )}
                        </Timeline.Row>
                    )
                })}

                <Timeline.Zoom>
                    <Timeline.Zoom.Button label="3 mnd" interval="month" count={3} />
                    <Timeline.Zoom.Button label="7 mnd" interval="month" count={7} />
                    <Timeline.Zoom.Button label="9 mnd" interval="month" count={9} />
                    <Timeline.Zoom.Button label="1.5 år" interval="year" count={1.5} />
                </Timeline.Zoom>
            </Timeline>
        </div>
    )
}
