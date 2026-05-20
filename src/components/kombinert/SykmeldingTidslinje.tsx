import React from 'react'
import dayjs from 'dayjs'
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
                endDate={dayjs(aktivTidsvindu.til).startOf('day').add(1, 'day').toDate()}
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
                {!dayjs().isAfter(dayjs(aktivTidsvindu.til), 'day') && (
                    <Timeline.Pin date={dayjs().startOf('day').toDate()} data-idag="true">
                        I dag
                    </Timeline.Pin>
                )}
            </Timeline>
        </Box>
    )
}

export default SykmeldingTidslinje
