import React, { useState } from 'react'
import { Button, HStack } from '@navikt/ds-react'
import { ArrowsSquarepathIcon } from '@navikt/aksel-icons'

import FnrSokefelt from '../components/FnrSokefelt'
import IdOppslagSokefelt from '../components/IdOppslagSokefelt'
import { initialProps, PrefetchResults } from '../initialprops/initialProps'
import { useSoknader } from '../queryhooks/useSoknader'
import { useSykmeldinger } from '../queryhooks/useSykmeldinger'
import TidslinjeKombinert from '../components/TidslinjeKombinert'
import { useValgtFnr } from '../utils/useValgtFnr'

const Index = ({ erMockBackend }: Pick<PrefetchResults, 'erMockBackend'>) => {
    const { fnr } = useValgtFnr()
    const [sammenlignModus, setSammenlignModus] = useState(false)

    const { data: soknadData } = useSoknader(fnr, fnr !== undefined)
    const soknader = soknadData?.sykepengesoknadListe || []
    const klipp = soknadData?.klippetSykepengesoknadRecord || []

    const { data: sykmeldinger = [] } = useSykmeldinger(fnr, fnr !== undefined)

    return (
        <div className="space-y-4">
            <HStack align="end" gap="space-4" wrap={false}>
                <div className="inline-flex items-start gap-4">
                    <FnrSokefelt
                        label="Fødselsnummer eller aktørId"
                        description="11-sifret fnr eller 13-sifret aktørId"
                        valideringstype="fnrEllerAktorId"
                        erMockBackend={erMockBackend}
                    />
                    <IdOppslagSokefelt />
                </div>
                {!sammenlignModus ? (
                    <Button
                        size="small"
                        variant="secondary"
                        icon={<ArrowsSquarepathIcon aria-hidden />}
                        onClick={() => setSammenlignModus(true)}
                    >
                        Sammenlign
                    </Button>
                ) : (
                    <Button size="small" variant="tertiary-neutral" onClick={() => setSammenlignModus(false)}>
                        Avslutt sammenligning
                    </Button>
                )}
            </HStack>
            <TidslinjeKombinert
                sykmeldinger={sykmeldinger}
                soknader={soknader}
                klipp={klipp}
                sammenlignModus={sammenlignModus}
                onSammenlignAvslutt={() => setSammenlignModus(false)}
            />
        </div>
    )
}

export const getServerSideProps = initialProps

export default Index
