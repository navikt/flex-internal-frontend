import React from 'react'
import dayjs from 'dayjs'
import { BodyShort, Box, Timeline } from '@navikt/ds-react'

import type { ArbeidsgiverGruppering } from '../../utils/gruppering'

import type { SammenlignElement } from './useTidslinjeKombinert'
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
    sammenlignModus?: boolean
    sammenlignValgteIder?: string[]
    onSammenlignValgt?: (element: SammenlignElement) => void
}

const SoknadTidslinje = ({
    soknaderGruppert,
    aktivTidsvindu,
    aktivPeriodeId,
    aktivDrawerKildeId,
    onPeriodeValgt,
    onDrawerValgt,
    sammenlignModus = false,
    sammenlignValgteIder = [],
    onSammenlignValgt,
}: Props): React.ReactElement => {
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
                endDate={dayjs(aktivTidsvindu.til).startOf('day').add(1, 'day').toDate()}
                startDate={aktivTidsvindu.fra}
                key={`sok-${aktivTidsvindu.fra.toISOString()}-${aktivTidsvindu.til.toISOString()}`}
            >
                {lagSoknadRader({
                    soknaderGruppert,
                    aktivTidsvindu,
                    aktivPeriodeId,
                    aktivDrawerKildeId,
                    onPeriodeValgt,
                    sammenlignModus,
                    sammenlignValgteIder,
                    onSammenlignValgt,
                })}
                {lagOppholdUtlandPins({
                    soknaderGruppert,
                    aktivDrawerKildeId,
                    onDrawerValgt,
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

export default SoknadTidslinje
