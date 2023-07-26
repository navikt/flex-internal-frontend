import { Fragment } from 'react'
import { Alert } from '@navikt/ds-react'

import { SykmeldingGruppering } from '../utils/gruppering'
import { overlappendePeriodeInnenforTimelineRad } from '../utils/overlapp'

export default function OverlappendeTidslinjeRad({
    sykmeldingGruppering,
}: {
    sykmeldingGruppering: Map<string, SykmeldingGruppering>
}) {
    const overlappendePerioder = overlappendePeriodeInnenforTimelineRad(sykmeldingGruppering)

    if (overlappendePerioder.length === 0) {
        return <Fragment />
    }

    return (
        <Alert variant="info" size="small">
            Det er overlappende perioder i en av sykmeldingen, visningen av disse periodene kan være feil:{'\n'}
            {JSON.stringify(overlappendePerioder)}
        </Alert>
    )
}
