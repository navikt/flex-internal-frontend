import React, { useState } from 'react'

import { initialProps } from '../initialprops/initialProps'
import { Soknad, useSoknader } from '../queryhooks/useSoknader'
import { Filter, ValgteFilter } from '../components/Filter'
import FnrInput from '../components/FnrInput'
import Tidslinje from '../components/Tidslinje'

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

    return (
        <div className="flex-row space-y-4">
            <FnrInput setFnr={setFnr} />

            <ValgteFilter filter={filter} setFilter={setFilter} />

            <Tidslinje soknader={filtrerteSoknader} filter={filter} setFilter={setFilter} />
        </div>
    )
}

export const getServerSideProps = initialProps

export default Index
