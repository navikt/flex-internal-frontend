import React from 'react'
import { BodyShort, Box, Timeline } from '@navikt/ds-react'

import type { SykmeldingerPerArbeidsgiver } from '../sykmelding/sykmeldingTidslinjeUtils'

import { lagSykmeldingRader, type OnPeriodeValgt } from './SykmeldingRader'

interface Props {
    sykmeldingerGruppertPaArbeidsgiver: Map<string, SykmeldingerPerArbeidsgiver>
    aktivTidsvindu: { fra: Date; til: Date }
    aktivPeriodeId: string | null
    aktivDrawerKildeId: string | null
    onPeriodeValgt: OnPeriodeValgt
}

const SykmeldingTidslinje = ({
    sykmeldingerGruppertPaArbeidsgiver,
    aktivTidsvindu,
    aktivPeriodeId,
    aktivDrawerKildeId,
    onPeriodeValgt,
}: Props): React.ReactElement => {
    return (
        <Box
            borderColor="brand-blue"
            borderWidth="2"
            padding="space-16"
            borderRadius="12"
            className="mb-4 kombinert-tidslinje-boks"
        >
            <BodyShort className="font-semibold mb-2">Sykmeldinger</BodyShort>
            <Timeline
                endDate={aktivTidsvindu.til}
                startDate={aktivTidsvindu.fra}
                key={`syk-${aktivTidsvindu.fra.toISOString()}-${aktivTidsvindu.til.toISOString()}`}
            >
                {lagSykmeldingRader({
                    sykmeldingerGruppertPaArbeidsgiver,
                    aktivTidsvindu,
                    aktivPeriodeId,
                    aktivDrawerKildeId,
                    onPeriodeValgt,
                })}
            </Timeline>
        </Box>
    )
}

export default SykmeldingTidslinje
