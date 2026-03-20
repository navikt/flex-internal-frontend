import React, { useState } from 'react'
import { Search } from '@navikt/ds-react'

import { initialProps } from '../initialprops/initialProps'
import { useSykmeldinger } from '../queryhooks/useSykmeldinger'
import { handterFnrValidering } from '../utils/inputValidering'
import TidslinjeSykmeldinger from '../components/sykmelding/TidslinjeSykmeldinger'

const Sykmeldinger = () => {
    const [fnr, setFnr] = useState<string>()

    const { data: sykmeldinger = [] } = useSykmeldinger(fnr, fnr !== undefined)

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
            <TidslinjeSykmeldinger sykmeldinger={sykmeldinger} />
        </div>
    )
}

export const getServerSideProps = initialProps

export default Sykmeldinger
