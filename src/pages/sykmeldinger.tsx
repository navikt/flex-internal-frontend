import React, { useState } from 'react'
import { Search } from '@navikt/ds-react'

import { initialProps } from '../initialprops/initialProps'
import { useSykmeldinger } from '../queryhooks/useSykmeldinger'
import { handterFnrValidering } from '../utils/inputValidering'
import TidslinjeSykmeldinger from '../components/sykmelding/TidslinjeSykmeldinger'
import { Filter, ValgteFilter } from '../components/Filter'

const Sykmeldinger = () => {
    const [fnr, setFnr] = useState<string>()
    const [filter, setFilter] = useState<Filter[]>([])

    const { data: sykmeldinger = [] } = useSykmeldinger(fnr, fnr !== undefined)
    console.log('sykmeldinger', sykmeldinger)

    return (
        <div className="flex-row space-y-4">
            <Search
                htmlSize="20"
                label="Fødselsnummer"
                onSearchClick={(input) => {
                    handterFnrValidering(input, setFnr)
                }}
                onKeyDown={(evt) => {
                    if (evt.key === 'Enter') {
                        handterFnrValidering(evt.currentTarget.value, setFnr)
                    }
                }}
            />
            <ValgteFilter filter={filter} setFilter={setFilter} />
            <TidslinjeSykmeldinger sykmeldinger={sykmeldinger} filter={filter} setFilter={setFilter} />
        </div>
    )
}

export const getServerSideProps = initialProps

export default Sykmeldinger
