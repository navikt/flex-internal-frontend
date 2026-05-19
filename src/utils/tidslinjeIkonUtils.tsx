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

function sekundaerIkonerForSoknadstype(soknadstype: Soknadstype): React.ReactElement[] {
    switch (soknadstype) {
        case 'BEHANDLINGSDAGER':
            return [<HospitalIcon key="behandling" aria-hidden />]
        case 'REISETILSKUDD':
            return [<CarIcon key="reise" aria-hidden />]
        case 'GRADERT_REISETILSKUDD':
            return [<PercentIcon key="gradert" aria-hidden />, <CarIcon key="reise" aria-hidden />]
        default:
            return []
    }
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
): Array<{ ikon: React.ReactElement; tekst: string }> {
    if (antallPerioder > 1) {
        return [{ ikon: <SplitHorizontalIcon aria-hidden />, tekst: `Sykmelding med ${antallPerioder} perioder` }]
    }
    if (forstePeriodetype) {
        return [{ ikon: ikonForPeriodetype(forstePeriodetype), tekst: beskrivelseForPeriodetype(forstePeriodetype) }]
    }
    return [{ ikon: <BandageFillIcon aria-hidden />, tekst: '100% sykmeldt' }]
}

export function ikonerForSoknad(soknad: { arbeidssituasjon?: string; soknadstype: Soknadstype }): React.ReactElement {
    const primær = primærIkonForSoknad(soknad.arbeidssituasjon, soknad.soknadstype)
    const sekundære = sekundaerIkonerForSoknadstype(soknad.soknadstype)

    if (sekundære.length === 0) return primær

    return (
        <span className="flex min-w-0 items-center overflow-hidden">
            <span className="shrink-0">{primær}</span>
            {sekundære.map((ikon) => (
                <span key={ikon.key as string} className="shrink-0 overflow-hidden">
                    {ikon}
                </span>
            ))}
        </span>
    )
}

const arbeidssituasjonTekst: Record<string, string> = {
    ARBEIDSTAKER: 'Arbeidstaker',
    NAERINGSDRIVENDE: 'Næringsdrivende',
    FRILANSER: 'Frilanser',
    ARBEIDSLEDIG: 'Arbeidsledig',
    JORDBRUKER: 'Jordbruker',
    ANNET: 'Annet arbeidsforhold',
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
): React.ReactElement {
    if (antallPerioder > 1) {
        return <SplitHorizontalIcon aria-hidden />
    }
    return forstePeriodetype ? ikonForPeriodetype(forstePeriodetype) : <BandageFillIcon aria-hidden />
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
