import React from 'react'
import { HStack } from '@navikt/ds-react'

import FnrSokefelt from '../components/FnrSokefelt'
import IdOppslagSokefelt from '../components/IdOppslagSokefelt'
import { initialProps, PrefetchResults } from '../initialprops/initialProps'
import { useSoknader } from '../queryhooks/useSoknader'
import { useSykmeldinger } from '../queryhooks/useSykmeldinger'
import TidslinjeKombinert from '../components/TidslinjeKombinert'
import { useValgtFnr } from '../utils/useValgtFnr'

const Index = ({ erMockBackend }: Pick<PrefetchResults, 'erMockBackend'>) => {
    const { fnr } = useValgtFnr()

    const { data: soknadData } = useSoknader(fnr, fnr !== undefined)
    const soknader = soknadData?.sykepengesoknadListe || []
    const klipp = soknadData?.klippetSykepengesoknadRecord || []

    const { data: sykmeldinger = [] } = useSykmeldinger(fnr, fnr !== undefined)

    return (
        <div className="space-y-4">
            <HStack align="end" gap="space-4" wrap>
                <div className="inline-flex items-start gap-4">
                    <FnrSokefelt
                        label="Fnr eller aktørId"
                        description="11 eller 13 siffer"
                        valideringstype="fnrEllerAktorId"
                        erMockBackend={erMockBackend}
                    />
                    <IdOppslagSokefelt />
                </div>
            </HStack>
            <TidslinjeKombinert sykmeldinger={sykmeldinger} soknader={soknader} klipp={klipp} />
        </div>
    )
}

export const getServerSideProps = initialProps

export default Index
