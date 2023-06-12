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
                            </ul>
                        </Timeline.Period>
                    </Timeline.Row>
                ))}
            </Timeline>
        </div>
    )
}
