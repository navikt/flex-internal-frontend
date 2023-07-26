import React, { Fragment, useState } from 'react'
import { Timeline } from '@navikt/ds-react'

import { ArbeidsgiverGruppering, SoknadGruppering, sortert, SykmeldingGruppering } from '../utils/gruppering'
import { dayjsToDate } from '../queryhooks/useSoknader'

import ValgtSortering, { Sortering } from './ValgtSortering'
import OverlappendeTidslinjeRad from './OverlappendeTidslinjeRad'
import { KlippDetaljer, SoknadDetaljer, timelinePeriodeStatus } from './Tidslinje'
import { Filter } from './Filter'

export default function TidslinjeSykmelding({
    soknaderGruppertPaArbeidsgiver,
    arbeidsgiver,
    filter,
    setFilter,
}: {
    soknaderGruppertPaArbeidsgiver: Map<string, ArbeidsgiverGruppering>
    arbeidsgiver: string
    filter: Filter[]
    setFilter: (val: any) => void
}) {
    const [sortering, setSortering] = useState<Sortering>('sykmelding skrevet')
    const soknaderGruppertPaSykmeldinger = new Map<string, SykmeldingGruppering>()

    if (arbeidsgiver === 'alle') {
        return <Fragment />
    }

    Array.from(soknaderGruppertPaArbeidsgiver.entries())
        .filter(([arbId]) => arbId.includes(arbeidsgiver) || arbId.endsWith('_GHOST'))
        .forEach(([arbId, arb]) => {
            const overlappIndex = arbId.slice(8)

            Array.from(arb.sykmeldinger).forEach(([sykId, syk]) => {
                const id = sykId + overlappIndex
                soknaderGruppertPaSykmeldinger.set(id, syk)
            })
        })

    if (soknaderGruppertPaSykmeldinger.size === 0) {
        return <Fragment />
    }

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <ValgtSortering sortering={sortering} setSortering={setSortering} />
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
                                                    <SoknadDetaljer
                                                        soknad={sok.soknad}
                                                        filter={filter}
                                                        setFilter={setFilter}
                                                    />
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
