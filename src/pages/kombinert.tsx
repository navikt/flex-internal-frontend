import React from 'react'

import FnrSokefelt from '../components/FnrSokefelt'
import { initialProps } from '../initialprops/initialProps'
import { useSoknader } from '../queryhooks/useSoknader'
import { useSykmeldinger } from '../queryhooks/useSykmeldinger'
import TidslinjeKombinert from '../components/TidslinjeKombinert'
import { useValgtFnr } from '../utils/useValgtFnr'

const KombinertPage = () => {
    const { fnr } = useValgtFnr()

    const { data: soknadData } = useSoknader(fnr, fnr !== undefined)
    const soknader = soknadData?.sykepengesoknadListe || []
    const klipp = soknadData?.klippetSykepengesoknadRecord || []

    const { data: sykmeldinger = [] } = useSykmeldinger(fnr, fnr !== undefined)

    return (
        <div className="flex-row space-y-4">
            <FnrSokefelt />
            <TidslinjeKombinert sykmeldinger={sykmeldinger} soknader={soknader} klipp={klipp} />
        </div>
    )
}

export const getServerSideProps = initialProps

export default KombinertPage
