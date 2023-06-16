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

    klipp.forEach((k) => {
        const perioderSomErKlippet = perioderSomMangler(k.periodeFor, k.periodeEtter)

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

    if (soknader.length === 0 || !soknaderGruppertPaSykmeldinger || soknaderGruppertPaSykmeldinger.size === 0) {
        return <Fragment />
    }

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <Timeline>
                {Array.from(soknaderGruppertPaSykmeldinger.entries()).map(([sykId, syk]) => (
                    <Timeline.Row key={sykId} label="Sykmelding">
                        {Array.from(syk.soknader.values()).flatMap((sok: SoknadGruppering) => {
                            const klippingAvSykmelding = syk.klippingAvSykmelding.map((k) => (
                                <Timeline.Period start={k.fom} end={k.tom} status="neutral" key={k.tom.toISOString()}>
                                    {JSON.stringify(k)}
                                </Timeline.Period>
                            ))
                            const klippingAvSoknad = sok.klippingAvSoknad.map((k) => (
                                <Timeline.Period start={k.fom} end={k.tom} status="neutral" key={k.tom.toISOString()}>
                                    {JSON.stringify(k)}
                                </Timeline.Period>
                            ))
                            const soknad = (
                                <Timeline.Period
                                    start={dayjsToDate(sok.soknad.fom!)!}
                                    end={dayjsToDate(sok.soknad.tom!)!}
                                    status={timelinePeriodeStatus(sok.soknad.status)}
                                    key={sok.soknad.tom}
                                >
                                    <SoknadDetaljer soknad={sok.soknad} />
                                </Timeline.Period>
                            )

                            return [soknad, ...klippingAvSoknad, ...klippingAvSykmelding]
                        })}
                    </Timeline.Row>
                ))}

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
