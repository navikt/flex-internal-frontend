import React, { useState } from 'react'

import FnrSokefelt from '../components/FnrSokefelt'
import { initialProps } from '../initialprops/initialProps'
import { useSykmeldinger } from '../queryhooks/useSykmeldinger'
import TidslinjeSykmeldinger from '../components/sykmelding/TidslinjeSykmeldinger'
import { Filter, ValgteFilter } from '../components/Filter'
import { useValgtFnr } from '../utils/useValgtFnr'

const Sykmeldinger = () => {
    const { fnr } = useValgtFnr()
    const [filter, setFilter] = useState<Filter[]>([])

    const { data: sykmeldinger = [] } = useSykmeldinger(fnr, fnr !== undefined)

    return (
        <div className="flex-row space-y-4">
            <FnrSokefelt />
            <ValgteFilter filter={filter} setFilter={setFilter} />
            <TidslinjeSykmeldinger sykmeldinger={sykmeldinger} filter={filter} setFilter={setFilter} />
        </div>
    )
}

export const getServerSideProps = initialProps

export default Sykmeldinger
