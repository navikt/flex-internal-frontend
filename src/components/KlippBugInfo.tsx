import { Fragment } from 'react'
import { Alert } from '@navikt/ds-react'

import { SykmeldingGruppering } from '../utils/gruppering'
import { maxTom, minFom } from '../utils/overlapp'

function finnUglerIMosen(sykmeldingGruppering: Map<string, SykmeldingGruppering>) {
    const ugler: string[] = []

    Array.from(sykmeldingGruppering.entries()).forEach(([, syk]) => {
        Array.from(syk.soknader.entries()).forEach(([sokId, sok]) => {
            if (sok.soknad.soknadPerioder === undefined) {
                return
            }
            const forventetFom = minFom(sok.soknad.soknadPerioder)
            const forventetTom = maxTom(sok.soknad.soknadPerioder)
            if (sok.soknad.fom !== forventetFom) {
                ugler.push(
                    `Soknad ${sokId} har feil fom ${sok.soknad.fom}, perioder ${JSON.stringify(
                        sok.soknad.soknadPerioder,
                    )}`,
                )
            }
            if (sok.soknad.tom !== forventetTom) {
                ugler.push(
                    `Soknad ${sokId} har feil tom ${sok.soknad.tom}, perioder ${JSON.stringify(
                        sok.soknad.soknadPerioder,
                    )}`,
                )
            }
        })
    })

    return ugler
}

export default function KlippBugInfo({
    sykmeldingGruppering,
}: {
    sykmeldingGruppering: Map<string, SykmeldingGruppering>
}) {
    const bugs = finnUglerIMosen(sykmeldingGruppering)

    if (bugs.length === 0) {
        return <Fragment />
    }

    return (
        <Alert variant="info" size="small" className="[&>div]:max-w-max">
            <ul>
                {bugs.map((bug, key) => (
                    <li key={key}>{bug}</li>
                ))}
            </ul>
        </Alert>
    )
}
