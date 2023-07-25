import React, { useState } from 'react'

import { initialProps } from '../initialprops/initialProps'
import { useSoknader } from '../queryhooks/useSoknader'
import { Filter, ValgteFilter } from '../components/Filter'
import FnrInput from '../components/FnrInput'
import Tidslinje from '../components/Tidslinje'
import ValgtSortering, { Sortering } from '../components/ValgtSortering'

const Index = () => {
    const [fnr, setFnr] = useState<string>()
    const [filter, setFilter] = useState<Filter[]>([])
    const [sortering, setSortering] = useState<Sortering>('sykmelding skrevet')

    const { data: data } = useSoknader(fnr, fnr !== undefined)
    const soknader = data?.sykepengesoknadListe || []
    const klipp = data?.klippetSykepengesoknadRecord || []

    return (
        <div className="flex-row space-y-4">
            <FnrInput setFnr={setFnr} />

            <ValgtSortering sortering={sortering} setSortering={setSortering} />

            <ValgteFilter filter={filter} setFilter={setFilter} />

            <Tidslinje soknader={soknader} klipp={klipp} filter={filter} setFilter={setFilter} sortering={sortering} />
        </div>
    )
}

export const getServerSideProps = initialProps

export default Index
