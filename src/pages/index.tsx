import React from 'react'

import { initialProps } from '../initialprops/initialProps'
import FnrSokefelt from '../components/FnrSokefelt'
import { useSoknader } from '../queryhooks/useSoknader'
import Tidslinje from '../components/soknad/Tidslinje'
import { useValgtFnr } from '../utils/useValgtFnr'

const Index = () => {
    const { fnr } = useValgtFnr()

    const { data: data } = useSoknader(fnr, fnr !== undefined)
    const soknader = data?.sykepengesoknadListe || []
    const klipp = data?.klippetSykepengesoknadRecord || []

    return (
        <div className="flex-row space-y-4">
            <FnrSokefelt />
            <Tidslinje soknader={soknader} klipp={klipp} />
        </div>
    )
}

export const getServerSideProps = initialProps

export default Index
