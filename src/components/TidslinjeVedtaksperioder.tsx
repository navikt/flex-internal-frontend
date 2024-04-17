import { Timeline } from '@navikt/ds-react'
import React, { Fragment } from 'react'

import { dayjsToDate } from '../queryhooks/useSoknader'
import { VedtaksperiodeResponse } from '../queryhooks/useVedtaksperioder'

export function TidslinjeVedtaksperioder({ vedtaksperioder }: { vedtaksperioder: VedtaksperiodeResponse[] }) {
    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <Timeline>
                {vedtaksperioder.map((vp) => {
                    return (
                        <Timeline.Row key={vp.orgnr} label={vp.orgnr}>
                            {vp.statusHistorikk.map((sh) => {
                                return (
                                    <Timeline.Period
                                        start={dayjsToDate(sh.vedtakFom)!}
                                        end={dayjsToDate(sh.vedtakTom)!}
                                        status="neutral"
                                        key={sh.id}
                                    >
                                        <Fragment>
                                            <span>${JSON.stringify(sh)}</span>
                                        </Fragment>
                                    </Timeline.Period>
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
