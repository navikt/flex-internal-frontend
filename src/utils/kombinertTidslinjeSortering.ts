import type { SykmeldingerPerArbeidsgiver } from '../components/sykmelding/sykmeldingTidslinjeUtils'

import type { ArbeidsgiverGruppering } from './gruppering'

export function sorterSykmeldingGrupperEtterSignaturDato(
    entries: [string, SykmeldingerPerArbeidsgiver][],
): [string, SykmeldingerPerArbeidsgiver][] {
    return entries.slice().sort((a, b) => {
        const maxA = Math.max(...a[1].sykmeldinger.map((s) => s.signaturDato?.valueOf() ?? 0))
        const maxB = Math.max(...b[1].sykmeldinger.map((s) => s.signaturDato?.valueOf() ?? 0))
        return maxB - maxA
    })
}

export function sorterSoknadGrupperEtterSignaturDato(
    entries: [string, ArbeidsgiverGruppering][],
): [string, ArbeidsgiverGruppering][] {
    return entries.slice().sort((a, b) => {
        const maxA = Math.max(
            ...[...a[1].sykmeldinger.values()].flatMap((syk) =>
                [...syk.soknader.values()].map((sg) => sg.soknad.sykmeldingSignaturDato?.valueOf() ?? 0),
            ),
        )
        const maxB = Math.max(
            ...[...b[1].sykmeldinger.values()].flatMap((syk) =>
                [...syk.soknader.values()].map((sg) => sg.soknad.sykmeldingSignaturDato?.valueOf() ?? 0),
            ),
        )
        return maxB - maxA
    })
}
