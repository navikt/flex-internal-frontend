import React, { useState } from 'react'
import { TextField } from '@navikt/ds-react'
import { Timeline } from '@navikt/ds-react-internal'

import { initialProps } from '../initialprops/initialProps'
import { Soknad, useSoknader } from '../queryhooks/useSoknader'
import { Filter, FilterFelt, ValgteFilter } from '../components/Filter'

const Index = () => {
    const [fnr, setFnr] = useState<string>()
    const [filter, setFilter] = useState<Filter[]>([])

    const { data: soknader } = useSoknader(fnr, fnr !== undefined)

    let filtrerteSoknader: Soknad[] = soknader || []
    filter.forEach((f: Filter) => {
        filtrerteSoknader = filtrerteSoknader.filter((sok: any) => {
            return (f.inkluder && sok[f.prop] === f.verdi) || (!f.inkluder && sok[f.prop] !== f.verdi)
        })
    })

    function fnrInput(fnrChange: string): void {
        setFnr(fnrChange.length == 11 ? fnrChange : undefined)
    }

    function Tidslinje() {
        if (soknader === undefined || filtrerteSoknader.length === 0) {
            return <></>
        }

        return (
            <div className="min-w-[800px] overflow-x-auto">
                <Timeline>
                    {filtrerteSoknader?.map((s: any) => (
                        <Timeline.Row key={s.id} label="Soknad">
                            <Timeline.Period start={s.fom} end={s.tom} status="success">
                                <ul>
                                    <li>
                                        sok id: {s.id}{' '}
                                        <FilterFelt prop="id" verdi={s.id} filter={filter} setFilter={setFilter} />
                                    </li>
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
                                        <FilterFelt
                                            prop="status"
                                            verdi={s.status}
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

    return (
        <div className="flex-row space-y-4">
            <TextField type="number" label="fnr" onChange={(e) => fnrInput(e.target.value)} />

            <ValgteFilter filter={filter} setFilter={setFilter} />

            <Tidslinje />
        </div>
    )
}

export const getServerSideProps = initialProps

export default Index
