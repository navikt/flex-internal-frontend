import React, { useState } from 'react'
import { Chips, TextField } from '@navikt/ds-react'
import { Timeline } from '@navikt/ds-react-internal'

import { initialProps } from '../initialprops/initialProps'
import { Soknad, useSoknader } from '../queryhooks/useSoknader'

interface Filter {
    prop: string
    verdi: string
    inkluder: boolean
}

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

    function ValgteFilter() {
        if (filter.length === 0) {
            return <></>
        }

        return (
            <Chips>
                {filter.map((f) => (
                    <Chips.Removable
                        key={f.prop}
                        variant="action"
                        onClick={() => setFilter((prev) => prev.filter((f2) => f2 !== f))}
                    >
                        {f.prop + (f.inkluder ? ' = ' : ' != ') + f.verdi}
                    </Chips.Removable>
                ))}
            </Chips>
        )
    }

    function FilterFelt({ prop, verdi }: { prop: string; verdi: string }) {
        const inkluder: Filter = {
            prop: prop,
            verdi: verdi,
            inkluder: true,
        }
        const ekskluder: Filter = {
            prop: prop,
            verdi: verdi,
            inkluder: false,
        }

        function finnes(array: Filter[], b: Filter) {
            return array.some((a) => a.prop === b.prop && a.verdi === b.verdi && a.inkluder === b.inkluder)
        }

        return (
            <Chips className="inline-flex">
                <Chips.Toggle
                    selected={finnes(filter, inkluder)}
                    onClick={() => {
                        setFilter((prev) =>
                            finnes(prev, inkluder) ? prev.filter((x) => !finnes([x], inkluder)) : [...prev, inkluder],
                        )
                    }}
                >
                    +
                </Chips.Toggle>
                <Chips.Toggle
                    selected={finnes(filter, ekskluder)}
                    onClick={() => {
                        setFilter((prev) =>
                            finnes(prev, ekskluder)
                                ? prev.filter((x) => !finnes([x], ekskluder))
                                : [...prev, ekskluder],
                        )
                    }}
                >
                    -
                </Chips.Toggle>
            </Chips>
        )
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
                                        sok id: {s.id} <FilterFelt prop="id" verdi={s.id} />
                                    </li>
                                    <li>
                                        syk id: {s.sykmeldingId}{' '}
                                        <FilterFelt prop="sykmeldingId" verdi={s.sykmeldingId} />
                                    </li>
                                    <li>
                                        status: {s.status} <FilterFelt prop="status" verdi={s.status} />
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

            <ValgteFilter />

            <Tidslinje />
        </div>
    )
}

export const getServerSideProps = initialProps

export default Index
