import React, { useState } from 'react'
import { BodyShort, Button, HStack } from '@navikt/ds-react'
import { ArrowsSquarepathIcon } from '@navikt/aksel-icons'

import FnrSokefelt from '../components/FnrSokefelt'
import IdOppslagSokefelt from '../components/IdOppslagSokefelt'
import { initialProps, PrefetchResults } from '../initialprops/initialProps'
import { useSoknader } from '../queryhooks/useSoknader'
import { useSykmeldinger } from '../queryhooks/useSykmeldinger'
import TidslinjeKombinert from '../components/TidslinjeKombinert'
import { useValgtFnr } from '../utils/useValgtFnr'

const sammenlignStatusTekst = (titler: string[]) => {
    if (titler.length === 0) return 'Velg første element'
    if (titler.length === 1) return `Valgt: ${titler[0]} — velg ett til`
    return `Sammenligner: ${titler[0]} vs ${titler[1]}`
}

const Index = ({ erMockBackend }: Pick<PrefetchResults, 'erMockBackend'>) => {
    const { fnr } = useValgtFnr()
    const [sammenlignModus, setSammenlignModus] = useState(false)
    const [sammenlignTitler, setSammenlignTitler] = useState<string[]>([])

    const { data: soknadData } = useSoknader(fnr, fnr !== undefined)
    const soknader = soknadData?.sykepengesoknadListe || []
    const klipp = soknadData?.klippetSykepengesoknadRecord || []

    const { data: sykmeldinger = [] } = useSykmeldinger(fnr, fnr !== undefined)

    const avsluttSammenlign = () => {
        setSammenlignModus(false)
        setSammenlignTitler([])
    }

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
                        variant="secondary"
                        icon={<ArrowsSquarepathIcon aria-hidden />}
                        onClick={() => setSammenlignModus(true)}
                        disabled={sykmeldinger.length === 0 && soknader.length === 0}
                    >
                        Sammenlign
                    </Button>
                ) : (
                    <HStack align="center" gap="space-4">
                        <BodyShort className="text-ax-text-neutral-subtle italic" aria-live="polite" aria-atomic="true">
                            {sammenlignStatusTekst(sammenlignTitler)}
                        </BodyShort>
                        <Button variant="tertiary-neutral" onClick={avsluttSammenlign}>
                            Avslutt sammenligning
                        </Button>
                    </HStack>
                )}
            </HStack>
            <TidslinjeKombinert
                sykmeldinger={sykmeldinger}
                soknader={soknader}
                klipp={klipp}
                sammenlignModus={sammenlignModus}
                onSammenlignAvslutt={avsluttSammenlign}
                onSammenlignValgteEndret={setSammenlignTitler}
            />
        </div>
    )
}

export const getServerSideProps = initialProps

export default Index
