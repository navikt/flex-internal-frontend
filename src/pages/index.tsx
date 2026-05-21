import React from 'react'
import { HStack } from '@navikt/ds-react'

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
            <HStack gap="space-8" align="end" wrap={false}>
                <FnrSokefelt label="Fødselsnummer" description="Søk direkte på 11-sifret fødselsnummer" />
                <IdOppslagSokefelt />
            </HStack>
            <TidslinjeKombinert sykmeldinger={sykmeldinger} soknader={soknader} klipp={klipp} />
        </div>
    )
}

export const getServerSideProps = initialProps

export default Index
