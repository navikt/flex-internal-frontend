import React from 'react'
import { BodyShort, Box, Timeline } from '@navikt/ds-react'

import type { ArbeidsgiverGruppering } from '../../utils/gruppering'

import { lagOppholdUtlandPins, type OnDrawerValgt } from './OppholdUtlandPins'
import { lagSoknadRader } from './SoknadRader'
import type { OnPeriodeValgt } from './SykmeldingRader'

interface Props {
    soknaderGruppert: Map<string, ArbeidsgiverGruppering>
    aktivTidsvindu: { fra: Date; til: Date }
    aktivPeriodeId: string | null
    aktivDrawerKildeId: string | null
    onPeriodeValgt: OnPeriodeValgt
    onDrawerValgt: OnDrawerValgt
}

export default function SoknadTidslinje({
    soknaderGruppert,
    aktivTidsvindu,
    aktivPeriodeId,
    aktivDrawerKildeId,
    onPeriodeValgt,
    onDrawerValgt,
}: Props) {
    return (
        <Box
            borderColor="brand-blue"
            borderWidth="2"
            padding="space-16"
            borderRadius="12"
            className="kombinert-tidslinje-boks"
        >
            <BodyShort className="font-semibold mb-2">Søknader</BodyShort>
            <Timeline
                endDate={aktivTidsvindu.til}
                startDate={aktivTidsvindu.fra}
                key={`sok-${aktivTidsvindu.fra.toISOString()}-${aktivTidsvindu.til.toISOString()}`}
            >
                {lagSoknadRader({
                    soknaderGruppert,
                    aktivTidsvindu,
                    aktivPeriodeId,
                    aktivDrawerKildeId,
                    onPeriodeValgt,
                })}
                {lagOppholdUtlandPins({
                    soknaderGruppert,
                    aktivDrawerKildeId,
                    onDrawerValgt,
                })}
            </Timeline>
        </Box>
    )
}
