import { Chips } from '@navikt/ds-react'
import React, { Fragment } from 'react'

export interface Filter {
    prop: string
    verdi: string
    inkluder: boolean
}

export function ValgteFilter({ filter, setFilter }: { filter: Filter[]; setFilter: (prev: any) => void }) {
    if (filter.length === 0) return <Fragment />

    return (
        <Chips>
            {filter.map((f) => (
                <Chips.Removable
                    key={f.prop}
                    variant="action"
                    onClick={() => setFilter((prev: Filter[]) => prev.filter((f2) => f2 !== f))}
                >
                    {f.prop + (f.inkluder ? ' = ' : ' != ') + f.verdi}
                </Chips.Removable>
            ))}
        </Chips>
    )
}

export function FilterFelt({
    prop,
    verdi,
    filter,
    setFilter,
}: {
    prop: string
    verdi: string
    filter: Filter[]
    setFilter: (prev: any) => void
}) {
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
                    setFilter((prev: Filter[]) =>
                        finnes(prev, inkluder) ? prev.filter((x) => !finnes([x], inkluder)) : [...prev, inkluder],
                    )
                }}
            >
                +
            </Chips.Toggle>
            <Chips.Toggle
                selected={finnes(filter, ekskluder)}
                onClick={() => {
                    setFilter((prev: Filter[]) =>
                        finnes(prev, ekskluder) ? prev.filter((x) => !finnes([x], ekskluder)) : [...prev, ekskluder],
                    )
                }}
            >
                -
            </Chips.Toggle>
        </Chips>
    )
}
