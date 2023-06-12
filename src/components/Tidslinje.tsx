import { Timeline } from '@navikt/ds-react-internal'
import React from 'react'

import { Soknad } from '../queryhooks/useSoknader'

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
    if (soknader.length === 0) {
        return <></>
    }

    return (
        <div className="min-w-[800px] overflow-x-auto">
            <Timeline>
                {soknader.map((s: any) => (
                    <Timeline.Row key={s.id} label="Soknad">
                        <Timeline.Period start={s.fom} end={s.tom} status="success">
                            <ul>
                                <li>sok id: {s.id}</li>
                                <li>
                                    syk id: {s.sykmeldingId}{' '}
                                    <FilterFelt
                                        prop="sykmeldingId"
                                        verdi={s.sykmeldingId}
                                        filter={filter}
                                        setFilter={setFilter}
                                    />
                                </li>
                                <li>
                                    status: {s.status}{' '}
                                    <FilterFelt prop="status" verdi={s.status} filter={filter} setFilter={setFilter} />
                                </li>
                                <li>sykmelding skrevet: {JSON.stringify(s.sykmeldingUtskrevet)}</li>
                                <li>
                                    soknadstype: {s.soknadstype}{' '}
                                    <FilterFelt
                                        prop="soknadstype"
                                        verdi={s.soknadstype}
                                        filter={filter}
                                        setFilter={setFilter}
                                    />
                                </li>
                                <li>
                                    arbeidsgiver: {JSON.stringify(s.arbeidsgiver)}{' '}
                                    <FilterFelt
                                        prop="arbeidsgiver"
                                        verdi={s.arbeidsgiver}
                                        filter={filter}
                                        setFilter={setFilter}
                                    />
                                </li>
                            </ul>
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
