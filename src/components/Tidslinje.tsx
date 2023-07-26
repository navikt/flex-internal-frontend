import React, { Fragment, useEffect, useState } from 'react'
import { Timeline } from '@navikt/ds-react'

import { dayjsToDate, KlippetSykepengesoknadRecord, RSSoknadstatusType, Soknad } from '../queryhooks/useSoknader'
import { Klipp } from '../utils/overlapp'
import gruppertOgFiltrert, { SoknadGruppering, sortert, SykmeldingGruppering } from '../utils/gruppering'

import { Filter, FilterFelt } from './Filter'
import { Sortering } from './ValgtSortering'
import OverlappendeTidslinjeRad from './OverlappendeTidslinjeRad'

export default function Tidslinje({
    soknader,
    klipp,
    filter,
    setFilter,
    sortering,
}: {
    soknader: Soknad[]
    klipp: KlippetSykepengesoknadRecord[]
    filter: Filter[]
    setFilter: (prev: any) => void
    sortering: Sortering
}) {
    const [soknaderGruppertPaSykmeldinger, setSoknaderGruppertPaSykmeldinger] =
        useState<Map<string, SykmeldingGruppering>>()

    useEffect(() => {
        setSoknaderGruppertPaSykmeldinger(gruppertOgFiltrert(filter, soknader, klipp))
    }, [soknader, klipp, filter])

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
            <OverlappendeTidslinjeRad sykmeldingGruppering={soknaderGruppertPaSykmeldinger} />
            <Timeline>
                {Array.from(soknaderGruppertPaSykmeldinger.entries())
                    .sort((a, b) => sortert(a, b, sortering))
                    .map(([sykId, syk]) => {
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
