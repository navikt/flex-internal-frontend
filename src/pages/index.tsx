import React, { useState } from 'react'

import { initialProps } from '../initialprops/initialProps'
import { Soknad, useSoknader } from '../queryhooks/useSoknader'
import { Filter, ValgteFilter } from '../components/Filter'
import FnrInput from '../components/FnrInput'
import Tidslinje from '../components/Tidslinje'
import ValgtSortering, { Sortering } from '../components/Sortering'

const Index = () => {
    const [fnr, setFnr] = useState<string>()
    const [filter, setFilter] = useState<Filter[]>([])
    const [sortering, setSortering] = useState<Sortering>('sykmelding skrevet')

    const { data: soknader } = useSoknader(fnr, fnr !== undefined)

    let filtrerteSoknader: Soknad[] = soknader || []
    filter.forEach((f: Filter) => {
        filtrerteSoknader = filtrerteSoknader.filter((sok: any) => {
            return (
                (f.inkluder && f.verdi === JSON.stringify(sok[f.prop])) ||
                (!f.inkluder && f.verdi !== JSON.stringify(sok[f.prop]))
            )
        })
    })

    return (
        <div className="flex-row space-y-4">
            <FnrInput setFnr={setFnr} />

            <ValgtSortering soknader={filtrerteSoknader} sortering={sortering} setSortering={setSortering} />

            <ValgteFilter filter={filter} setFilter={setFilter} />

            <Tidslinje soknader={filtrerteSoknader} filter={filter} setFilter={setFilter} />
        </div>
    )
}

export const getServerSideProps = initialProps

export default Index
