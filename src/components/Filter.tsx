import { Chips } from '@navikt/ds-react'
import React, { Fragment, useState } from 'react'

export interface Filter {
    prop: string
    verdi: string
    inkluder: boolean
}

export function ValgteFilter({ filter, setFilter }: { filter: Filter[]; setFilter: (val: any) => void }) {
    const [deaktiverteFilter, setDeaktiverteFilter] = useState<Filter[]>([])

    function filterOnClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>, f: Filter) {
        if (e.target instanceof HTMLSpanElement) {
            if (filter.some((f2) => f2 === f)) {
                deaktiverFilter(f)
            } else {
                aktiverFilter(f)
            }
        } else {
            slettFilter(f)
        }
    }

    function deaktiverFilter(f: Filter) {
        setDeaktiverteFilter((prev) => [...prev, f])
        setFilter((prev: Filter[]) => prev.filter((f2) => f2 !== f))
    }

    function aktiverFilter(f: Filter) {
        setDeaktiverteFilter((prev) => prev.filter((f2) => f2 !== f))
        setFilter((prev: Filter[]) => [...prev, f])
    }

    function slettFilter(f: Filter) {
        setDeaktiverteFilter((prev) => prev.filter((f2) => f2 !== f))
        setFilter((prev: Filter[]) => prev.filter((f2) => f2 !== f))
    }

    if (filter.length === 0 && deaktiverteFilter.length === 0) return <Fragment />

    return (
        <Chips>
            {filter.map((f) => (
                <Chips.Removable data-color="accent" key={f.prop} onClick={(e) => filterOnClick(e, f)}>
                    {f.prop + (f.inkluder ? ' = ' : ' != ') + f.verdi}
                </Chips.Removable>
            ))}
            {deaktiverteFilter.map((f) => (
                <Chips.Removable data-color="neutral" key={f.prop + '_deaktivert'} onClick={(e) => filterOnClick(e, f)}>
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
    verdi: any
    filter: Filter[]
    setFilter: (val: any) => void
}) {
    const inkluder: Filter = {
        prop: prop,
        verdi: JSON.stringify(verdi),
        inkluder: true,
    }
    const ekskluder: Filter = {
        prop: prop,
        verdi: JSON.stringify(verdi),
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
