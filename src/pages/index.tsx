import React, { useState } from 'react'

import { initialProps } from '../initialprops/initialProps'
import { useSoknader } from '../queryhooks/useSoknader'
import FnrInput from '../components/FnrInput'
import Tidslinje from '../components/Tidslinje'

const Index = () => {
    const [fnr, setFnr] = useState<string>()

    const { data: data } = useSoknader(fnr, fnr !== undefined)
    const soknader = data?.sykepengesoknadListe || []
    const klipp = data?.klippetSykepengesoknadRecord || []

    return (
        <div className="flex-row space-y-4">
            <FnrInput setFnr={setFnr} />
            <Tidslinje soknader={soknader} klipp={klipp} />
        </div>
    )
}

export const getServerSideProps = initialProps

export default Index
