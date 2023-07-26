import { Timeline } from '@navikt/ds-react'
import React, { Fragment } from 'react'

import { ArbeidsgiverGruppering, SoknadGruppering } from '../utils/gruppering'
import { dayjsToDate } from '../queryhooks/useSoknader'

import { KlippDetaljer, SoknadDetaljer, timelinePeriodeStatus } from './Tidslinje'
import { Filter } from './Filter'

export default function TidslinjeArbeidsgiver({
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
    if (arbeidsgiver !== 'alle') {
        return <Fragment />
    }

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <Timeline>
                {Array.from(soknaderGruppertPaArbeidsgiver.entries()).map(([arbId, arb]) => {
                    const erGhostArbeidsgiver = arbId.endsWith('_GHOST')

                    return (
                        <Timeline.Row key={arbId} label={erGhostArbeidsgiver ? 'Arbeidsgiver 👻' : arbId}>
                            {Array.from(arb.sykmeldinger.entries()).flatMap(([sykId, syk]) => {
                                const erGhostSykmelding = sykId.endsWith('_GHOST')

                                return Array.from(syk.soknader.values())
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
                                    )
                            })}
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
