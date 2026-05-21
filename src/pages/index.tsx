import React from 'react'

import FnrSokefelt from '../components/FnrSokefelt'
import IdOppslagSokefelt from '../components/IdOppslagSokefelt'
import { initialProps } from '../initialprops/initialProps'
import { useSoknader } from '../queryhooks/useSoknader'
import { useSykmeldinger } from '../queryhooks/useSykmeldinger'
import TidslinjeKombinert from '../components/TidslinjeKombinert'
import { useValgtFnr } from '../utils/useValgtFnr'

const Index = () => {
    const { fnr } = useValgtFnr()

    const { data: soknadData } = useSoknader(fnr, fnr !== undefined)
    const soknader = soknadData?.sykepengesoknadListe || []
    const klipp = soknadData?.klippetSykepengesoknadRecord || []

    const { data: sykmeldinger = [] } = useSykmeldinger(fnr, fnr !== undefined)

    return (
        <div className="space-y-4">
            <div className="flex gap-4 items-end">
                <FnrSokefelt label="Søk på fødselsnummer" />
                <IdOppslagSokefelt />
            </div>
            <TidslinjeKombinert sykmeldinger={sykmeldinger} soknader={soknader} klipp={klipp} />
        </div>
    )
}

export const getServerSideProps = initialProps

export default Index
