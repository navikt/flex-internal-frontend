import React from 'react'
import { addDays, isAfter } from 'date-fns'
import { BodyShort, Box, Timeline } from '@navikt/ds-react'

import { now, tilOsloDatoFraDato } from '../../utils/dato-utils'
import type { SykmeldingerPerArbeidsgiver } from '../sykmelding/sykmeldingTidslinjeUtils'

import type { SammenlignElement } from './useTidslinjeKombinert'
import { lagSykmeldingRader, type OnPeriodeValgt } from './SykmeldingRader'

interface Props {
    sykmeldingerGruppertPaArbeidsgiver: Map<string, SykmeldingerPerArbeidsgiver>
    aktivTidsvindu: { fra: Date; til: Date }
    aktivPeriodeId: string | null
    aktivDrawerKildeId: string | null
    onPeriodeValgt: OnPeriodeValgt
    sammenlignModus?: boolean
    sammenlignValgteIder?: string[]
    onSammenlignValgt?: (element: SammenlignElement) => void
}

const SykmeldingTidslinje = ({
    sykmeldingerGruppertPaArbeidsgiver,
    aktivTidsvindu,
    aktivPeriodeId,
    aktivDrawerKildeId,
    onPeriodeValgt,
    sammenlignModus = false,
    sammenlignValgteIder = [],
    onSammenlignValgt,
}: Props): React.ReactElement => {
    const iDag = tilOsloDatoFraDato(now())
    const tilDato = tilOsloDatoFraDato(aktivTidsvindu.til)

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
                endDate={addDays(tilDato, 1)}
                startDate={tilOsloDatoFraDato(aktivTidsvindu.fra)}
                key={`syk-${aktivTidsvindu.fra.toISOString()}-${aktivTidsvindu.til.toISOString()}`}
            >
                {lagSykmeldingRader({
                    sykmeldingerGruppertPaArbeidsgiver,
                    aktivTidsvindu,
                    aktivPeriodeId,
                    aktivDrawerKildeId,
                    onPeriodeValgt,
                    sammenlignModus,
                    sammenlignValgteIder,
                    onSammenlignValgt,
                })}
                {!isAfter(iDag, tilDato) && (
                    <Timeline.Pin date={iDag} data-idag="true">
                        I dag
                    </Timeline.Pin>
                )}
            </Timeline>
        </Box>
    )
}

export default SykmeldingTidslinje
