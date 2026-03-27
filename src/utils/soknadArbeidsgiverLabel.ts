import { ArbeidsgiverGruppering } from './gruppering'

const harKlippstatusSoknadStarterForSlutterEtter = (arbeidsgiver: ArbeidsgiverGruppering) =>
    Array.from(arbeidsgiver.sykmeldinger.values()).some((sykmelding) =>
        Array.from(sykmelding.soknader.values()).some((soknad) =>
            soknad.klippingAvSoknad.some((klipp) => klipp.klippVariant === 'SOKNAD_STARTER_FOR_SLUTTER_ETTER'),
        ),
    )

const sykmeldingIderUtenGhostSuffix = (arbeidsgiver: ArbeidsgiverGruppering) =>
    Array.from(arbeidsgiver.sykmeldinger.keys())
        .filter((sykmeldingId) => sykmeldingId.endsWith('_GHOST'))
        .map((sykmeldingId) => sykmeldingId.replace('_GHOST', ''))

const finnOrgnummerForSykmeldingId = (
    sykmeldingId: string,
    soknaderGruppertPaArbeidsgiver: Map<string, ArbeidsgiverGruppering>,
): string | null => {
    for (const { sykmeldinger } of soknaderGruppertPaArbeidsgiver.values()) {
        const sykmelding = sykmeldinger.get(sykmeldingId)
        if (!sykmelding) continue

        const orgnummer = Array.from(sykmelding.soknader.values()).find((soknad) => soknad.soknad.arbeidsgiverOrgnummer)
            ?.soknad.arbeidsgiverOrgnummer
        if (orgnummer) return orgnummer
    }

    return null
}

export const arbeidsgiverLabelForSoknader = (
    arbeidsgiverId: string,
    arbeidsgiver: ArbeidsgiverGruppering,
    soknaderGruppertPaArbeidsgiver: Map<string, ArbeidsgiverGruppering>,
) => {
    const harNaeringsdrivendeSoknad = Array.from(arbeidsgiver.sykmeldinger.values()).some((sykmelding) =>
        Array.from(sykmelding.soknader.values()).some(
            (soknad) => soknad.soknad.arbeidssituasjon === 'NAERINGSDRIVENDE',
        ),
    )

    if (harNaeringsdrivendeSoknad) {
        return 'Næringsdrivende'
    }

    const erGhostArbeidsgiver = arbeidsgiverId.includes('_GHOST')
    const skalViseKlippetOrgnummer = erGhostArbeidsgiver && harKlippstatusSoknadStarterForSlutterEtter(arbeidsgiver)

    if (skalViseKlippetOrgnummer) {
        const sykmeldingIder = sykmeldingIderUtenGhostSuffix(arbeidsgiver)
        const orgnummer = sykmeldingIder
            .map((sykmeldingId) => finnOrgnummerForSykmeldingId(sykmeldingId, soknaderGruppertPaArbeidsgiver))
            .find((verdi): verdi is string => Boolean(verdi))

        if (orgnummer) {
            return `${orgnummer} ✂️`
        }
    }

    return erGhostArbeidsgiver ? 'Arbeidsgiver 👻' : arbeidsgiverId
}
