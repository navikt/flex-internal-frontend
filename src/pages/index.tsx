import React, { useState } from 'react'
import { Search } from '@navikt/ds-react'

import { initialProps } from '../initialprops/initialProps'
import { useSoknader } from '../queryhooks/useSoknader'
import Tidslinje from '../components/Tidslinje'
import { handterFnrValidering } from '../utils/inputValidering'

const Index = () => {
    const [fnr, setFnr] = useState<string>()

    const { data: data } = useSoknader(fnr, fnr !== undefined)
    const soknader = data?.sykepengesoknadListe || []
    const klipp = data?.klippetSykepengesoknadRecord || []

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
            <Tidslinje soknader={soknader} klipp={klipp} />
        </div>
    )
}

export const getServerSideProps = initialProps

export default Index
