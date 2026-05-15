import { Chips } from '@navikt/ds-react'
import React, { Fragment, useState } from 'react'

export interface Filter {
    prop: string
    verdi: string
    inkluder: boolean
}

export function ValgteFilter({
    filter,
    setFilter,
}: {
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
}) {
    const [deaktiverteFilter, setDeaktiverteFilter] = useState<Filter[]>([])

    const filterNokkel = (f: Filter) => `${f.prop}_${f.inkluder ? 'inkluder' : 'ekskluder'}_${f.verdi}`

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
                <Chips.Removable
                    data-color={f.inkluder ? 'success' : 'danger'}
                    key={filterNokkel(f)}
                    onClick={(e) => filterOnClick(e, f)}
                >
                    {f.prop + (f.inkluder ? ' = ' : ' != ') + f.verdi}
                </Chips.Removable>
            ))}
            {deaktiverteFilter.map((f) => (
                <Chips.Removable
                    data-color="neutral"
                    key={filterNokkel(f) + '_deaktivert'}
                    onClick={(e) => filterOnClick(e, f)}
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
    barn,
    markerHeleRad = false,
}: {
    prop: string
    verdi: unknown
    filter: Filter[]
    setFilter: React.Dispatch<React.SetStateAction<Filter[]>>
    barn: React.ReactNode
    markerHeleRad?: boolean
}) {
    const inkluderFarger = {
        bakgrunn: '#ccffd8',
        tekst: '#0f5132',
    }

    const ekskluderFarger = {
        bakgrunn: '#ffd6d9',
        tekst: '#842029',
    }

    const inkluderFilter: Filter = {
        prop: prop,
        verdi: JSON.stringify(verdi),
        inkluder: true,
    }
    const ekskluderFilter: Filter = {
        prop: prop,
        verdi: JSON.stringify(verdi),
        inkluder: false,
    }

    function erSammeFilter(a: Filter, b: Filter) {
        return a.prop === b.prop && a.verdi === b.verdi && a.inkluder === b.inkluder
    }

    function finnesFilter(filterliste: Filter[], kandidat: Filter) {
        return filterliste.some((filterelement) => erSammeFilter(filterelement, kandidat))
    }

    const inkluderer = finnesFilter(filter, inkluderFilter)
    const ekskluderer = finnesFilter(filter, ekskluderFilter)

    const markering = inkluderer ? 'inkluder' : ekskluderer ? 'ekskluder' : 'ingen'

    const markeringsstil: React.CSSProperties =
        markering === 'inkluder'
            ? {
                  backgroundColor: inkluderFarger.bakgrunn,
                  color: inkluderFarger.tekst,
              }
            : markering === 'ekskluder'
              ? {
                    backgroundColor: ekskluderFarger.bakgrunn,
                    color: ekskluderFarger.tekst,
                }
              : {}

    function byttFilter() {
        setFilter((forrigeFilter: Filter[]) => {
            const utenSammeFelt = forrigeFilter.filter(
                (filterelement) =>
                    !erSammeFilter(filterelement, inkluderFilter) && !erSammeFilter(filterelement, ekskluderFilter),
            )

            if (finnesFilter(forrigeFilter, inkluderFilter)) {
                return [...utenSammeFelt, ekskluderFilter]
            }

            if (finnesFilter(forrigeFilter, ekskluderFilter)) {
                return utenSammeFelt
            }

            return [...utenSammeFelt, inkluderFilter]
        })
    }

    return (
        <button
            type="button"
            onClick={byttFilter}
            className={
                markerHeleRad
                    ? 'flex w-full items-start rounded text-left'
                    : 'inline-flex items-center rounded text-left'
            }
            style={{
                ...markeringsstil,
                borderRadius: '0.35rem',
                cursor: 'pointer',
                paddingInline: markerHeleRad ? '0.55rem' : '0.45rem',
                paddingBlock: markerHeleRad ? '0.3rem' : '0.2rem',
            }}
            aria-label={`Bytt filter for ${prop}`}
            aria-pressed={markering !== 'ingen'}
        >
            <span className={markerHeleRad ? 'w-full' : undefined}>{barn}</span>
        </button>
    )
}
