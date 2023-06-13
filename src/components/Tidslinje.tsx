import React, { Fragment } from 'react'
import { Timeline } from '@navikt/ds-react'

import { RSSoknadstatusType, Soknad } from '../queryhooks/useSoknader'

import { Filter, FilterFelt } from './Filter'

export default function Tidslinje({
    soknader,
    filter,
    setFilter,
}: {
    soknader: Soknad[]
    filter: Filter[]
    setFilter: (prev: any) => void
}) {
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

    if (soknader.length === 0) {
        return <Fragment />
    }

    return (
        <div className="min-w-[800px] overflow-x-auto">
            <Timeline>
                {soknader.map((s: any) => (
                    <Timeline.Row key={s.id} label="Soknad">
                        <Timeline.Period start={s.fom} end={s.tom} status={timelinePeriodeStatus(s.status)}>
                            <SoknadDetaljer soknad={s} />
                        </Timeline.Period>
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
