import { Timeline } from '@navikt/ds-react-internal'
import React, { Fragment } from 'react'

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
            <ul>
                <li>sok id: {soknad.id}</li>
                <li>
                    syk id: {soknad.sykmeldingId}{' '}
                    <FilterFelt prop="sykmeldingId" verdi={soknad.sykmeldingId} filter={filter} setFilter={setFilter} />
                </li>
                <li>
                    status: {soknad.status}{' '}
                    <FilterFelt prop="status" verdi={soknad.status} filter={filter} setFilter={setFilter} />
                </li>
                <li>sykmelding skrevet: {JSON.stringify(soknad.sykmeldingUtskrevet)}</li>
                <li>
                    soknadstype: {soknad.soknadstype}{' '}
                    <FilterFelt prop="soknadstype" verdi={soknad.soknadstype} filter={filter} setFilter={setFilter} />
                </li>
                <li>
                    arbeidsgiver: {JSON.stringify(soknad.arbeidsgiver)}{' '}
                    <FilterFelt prop="arbeidsgiver" verdi={soknad.arbeidsgiver} filter={filter} setFilter={setFilter} />
                </li>
            </ul>
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
