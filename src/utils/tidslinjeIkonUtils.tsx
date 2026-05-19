import React from 'react'
import {
    AirplaneIcon,
    BandageFillIcon,
    BriefcaseClockIcon,
    BriefcaseIcon,
    CarIcon,
    CompassIcon,
    DoorOpenIcon,
    GlobeIcon,
    HospitalIcon,
    HourglassIcon,
    ImageIcon,
    NewspaperIcon,
    PercentIcon,
    PlantIcon,
    ScissorsIcon,
    SectorChartIcon,
    SplitHorizontalIcon,
} from '@navikt/aksel-icons'

import type { Periodetype } from '../queryhooks/useSykmeldinger'
import type { Soknadstype } from '../queryhooks/useSoknader'

export function ikonForPeriodetype(type: Periodetype): React.ReactElement {
    switch (type) {
        case 'AKTIVITET_IKKE_MULIG':
            return <BandageFillIcon aria-hidden />
        case 'GRADERT':
            return <SectorChartIcon aria-hidden />
        case 'BEHANDLINGSDAGER':
            return <HospitalIcon aria-hidden />
        case 'AVVENTENDE':
            return <HourglassIcon aria-hidden />
        case 'REISETILSKUDD':
            return <AirplaneIcon aria-hidden />
    }
}

export function beskrivelseForPeriodetype(type: Periodetype): string {
    switch (type) {
        case 'AKTIVITET_IKKE_MULIG':
            return '100% sykmeldt'
        case 'GRADERT':
            return 'Gradert sykmeldt'
        case 'BEHANDLINGSDAGER':
            return 'Behandlingsdager'
        case 'AVVENTENDE':
            return 'Avventende sykmelding'
        case 'REISETILSKUDD':
            return 'Reisetilskudd'
    }
}

function primærIkonForSoknad(arbeidssituasjon: string | undefined, soknadstype: Soknadstype): React.ReactElement {
    if (soknadstype === 'OPPHOLD_UTLAND') return <GlobeIcon aria-hidden />
    if (soknadstype === 'FRISKMELDT_TIL_ARBEIDSFORMIDLING') return <BriefcaseClockIcon aria-hidden />
    if (soknadstype === 'ANNET_ARBEIDSFORHOLD') return <CompassIcon aria-hidden />

    return ikonForArbeidssituasjon(arbeidssituasjon ?? '')
}

export function ikonParForSoknad(soknad: {
    arbeidssituasjon?: string
    soknadstype: Soknadstype
}): Array<{ ikon: React.ReactElement; tekst: string }> {
    if (soknad.soknadstype === 'OPPHOLD_UTLAND') return [{ ikon: <GlobeIcon aria-hidden />, tekst: 'Opphold utland' }]
    if (soknad.soknadstype === 'FRISKMELDT_TIL_ARBEIDSFORMIDLING')
        return [{ ikon: <BriefcaseClockIcon aria-hidden />, tekst: 'Friskmeldt til arbeidsformidling' }]
    if (soknad.soknadstype === 'ANNET_ARBEIDSFORHOLD')
        return [{ ikon: <CompassIcon aria-hidden />, tekst: 'Annet arbeidsforhold' }]

    const primærTekst =
        arbeidssituasjonTekst[soknad.arbeidssituasjon ?? ''] ?? beskrivelseForSoknadstype(soknad.soknadstype)
    const par: Array<{ ikon: React.ReactElement; tekst: string }> = [
        { ikon: primærIkonForSoknad(soknad.arbeidssituasjon, soknad.soknadstype), tekst: primærTekst },
    ]

    switch (soknad.soknadstype) {
        case 'BEHANDLINGSDAGER':
            par.push({ ikon: <HospitalIcon aria-hidden />, tekst: 'Behandlingsdager' })
            break
        case 'REISETILSKUDD':
            par.push({ ikon: <CarIcon aria-hidden />, tekst: 'Reisetilskudd' })
            break
        case 'GRADERT_REISETILSKUDD':
            par.push({ ikon: <PercentIcon aria-hidden />, tekst: 'Gradert' })
            par.push({ ikon: <CarIcon aria-hidden />, tekst: 'Reisetilskudd' })
            break
    }

    return par
}

export function ikonParForSykmeldingPerioder(
    antallPerioder: number,
    forstePeriodetype: Periodetype | undefined,
    arbeidssituasjon?: string | null,
): Array<{ ikon: React.ReactElement; tekst: string }> {
    const periodePar: { ikon: React.ReactElement; tekst: string } =
        antallPerioder > 1
            ? { ikon: <SplitHorizontalIcon aria-hidden />, tekst: `Sykmelding med ${antallPerioder} perioder` }
            : forstePeriodetype
              ? { ikon: ikonForPeriodetype(forstePeriodetype), tekst: beskrivelseForPeriodetype(forstePeriodetype) }
              : { ikon: <BandageFillIcon aria-hidden />, tekst: '100% sykmeldt' }

    if (!arbeidssituasjon) return [periodePar]

    return [
        { ikon: ikonForArbeidssituasjon(arbeidssituasjon), tekst: arbeidssituasjonTilTekst(arbeidssituasjon) },
        periodePar,
    ]
}

export function ikonerFraIkonPar(par: Array<{ ikon: React.ReactElement; tekst: string }>): React.ReactElement {
    if (par.length === 1) return par[0].ikon

    return (
        <span className="flex min-w-0 items-center overflow-hidden">
            {par.map(({ ikon }, i) => (
                <span key={i} className="shrink-0 overflow-hidden">
                    {ikon}
                </span>
            ))}
        </span>
    )
}

export function ikonerForSoknad(soknad: { arbeidssituasjon?: string; soknadstype: Soknadstype }): React.ReactElement {
    return ikonerFraIkonPar(ikonParForSoknad(soknad))
}

export const arbeidssituasjonTekst: Record<string, string> = {
    ARBEIDSTAKER: 'Arbeidstaker',
    NAERINGSDRIVENDE: 'Næringsdrivende',
    FRILANSER: 'Frilanser',
    ARBEIDSLEDIG: 'Arbeidsledig',
    JORDBRUKER: 'Jordbruker',
    ANNET: 'Annet arbeidsforhold',
}

export function ikonForArbeidssituasjon(arbeidssituasjon: string): React.ReactElement {
    switch (arbeidssituasjon) {
        case 'ARBEIDSTAKER':
            return <BriefcaseIcon aria-hidden />
        case 'NAERINGSDRIVENDE':
            return <ImageIcon aria-hidden />
        case 'FRILANSER':
            return <NewspaperIcon aria-hidden />
        case 'ARBEIDSLEDIG':
            return <DoorOpenIcon aria-hidden />
        case 'JORDBRUKER':
            return <PlantIcon aria-hidden />
        case 'ANNET':
            return <CompassIcon aria-hidden />
        default:
            return <BriefcaseIcon aria-hidden />
    }
}

export function arbeidssituasjonTilTekst(arbeidssituasjon: string): string {
    return (
        arbeidssituasjonTekst[arbeidssituasjon] ??
        arbeidssituasjon.charAt(0).toUpperCase() + arbeidssituasjon.slice(1).toLowerCase()
    )
}

const soknadsmodifikatorTekst: Partial<Record<Soknadstype, string>> = {
    BEHANDLINGSDAGER: 'behandlingsdager',
    REISETILSKUDD: 'reisetilskudd',
    GRADERT_REISETILSKUDD: 'gradert reisetilskudd',
}

export function beskrivelseForSoknad(soknad: { arbeidssituasjon?: string; soknadstype: Soknadstype }): string {
    if (soknad.soknadstype === 'OPPHOLD_UTLAND') return 'Opphold utland'
    if (soknad.soknadstype === 'FRISKMELDT_TIL_ARBEIDSFORMIDLING') return 'Friskmeldt til arbeidsformidling'
    if (soknad.soknadstype === 'ANNET_ARBEIDSFORHOLD') return 'Annet arbeidsforhold'

    const primær = arbeidssituasjonTekst[soknad.arbeidssituasjon ?? ''] ?? beskrivelseForSoknadstype(soknad.soknadstype)
    const modifikator = soknadsmodifikatorTekst[soknad.soknadstype]

    return modifikator ? `${primær} · ${modifikator}` : primær
}

export function beskrivelseForSoknadstype(soknadstype: Soknadstype): string {
    switch (soknadstype) {
        case 'ARBEIDSTAKERE':
            return 'Arbeidstaker'
        case 'SELVSTENDIGE_OG_FRILANSERE':
            return 'Selvstendig næringsdrivende / frilanser'
        case 'ARBEIDSLEDIG':
            return 'Arbeidsledig'
        case 'ANNET_ARBEIDSFORHOLD':
            return 'Annet arbeidsforhold'
        case 'BEHANDLINGSDAGER':
            return 'Behandlingsdager'
        case 'REISETILSKUDD':
            return 'Reisetilskudd'
        case 'GRADERT_REISETILSKUDD':
            return 'Gradert reisetilskudd'
        case 'OPPHOLD_UTLAND':
            return 'Opphold utland'
        case 'FRISKMELDT_TIL_ARBEIDSFORMIDLING':
            return 'Friskmeldt til arbeidsformidling'
    }
}

export const klippIkon = <ScissorsIcon aria-hidden />

export function ikonForSykmeldingPerioder(
    antallPerioder: number,
    forstePeriodetype: Periodetype | undefined,
    arbeidssituasjon?: string | null,
): React.ReactElement {
    return ikonerFraIkonPar(ikonParForSykmeldingPerioder(antallPerioder, forstePeriodetype, arbeidssituasjon))
}

export function beskrivelseForSykmeldingPerioder(
    antallPerioder: number,
    forstePeriodetype: Periodetype | undefined,
): string {
    if (antallPerioder > 1) {
        return `Sykmelding med ${antallPerioder} perioder`
    }
    return forstePeriodetype ? beskrivelseForPeriodetype(forstePeriodetype) : '100% sykmeldt'
}
