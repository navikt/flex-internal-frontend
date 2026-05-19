import React from 'react'
import {
    AirplaneIcon,
    BandageFillIcon,
    BriefcaseIcon,
    GlobeIcon,
    HandshakeIcon,
    HourglassIcon,
    MedicalThermometerIcon,
    PersonCheckmarkIcon,
    PersonIcon,
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
            return <MedicalThermometerIcon aria-hidden />
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

export function ikonForSoknadstype(soknadstype: Soknadstype): React.ReactElement {
    switch (soknadstype) {
        case 'ARBEIDSTAKERE':
        case 'ANNET_ARBEIDSFORHOLD':
            return <BriefcaseIcon aria-hidden />
        case 'SELVSTENDIGE_OG_FRILANSERE':
            return <HandshakeIcon aria-hidden />
        case 'ARBEIDSLEDIG':
            return <PersonIcon aria-hidden />
        case 'BEHANDLINGSDAGER':
            return <MedicalThermometerIcon aria-hidden />
        case 'REISETILSKUDD':
        case 'GRADERT_REISETILSKUDD':
            return <AirplaneIcon aria-hidden />
        case 'OPPHOLD_UTLAND':
            return <GlobeIcon aria-hidden />
        case 'FRISKMELDT_TIL_ARBEIDSFORMIDLING':
            return <PersonCheckmarkIcon aria-hidden />
    }
}

export function beskrivelseForSoknadstype(soknadstype: Soknadstype): string {
    switch (soknadstype) {
        case 'ARBEIDSTAKERE':
            return 'Arbeidstaker'
        case 'ANNET_ARBEIDSFORHOLD':
            return 'Annet arbeidsforhold'
        case 'SELVSTENDIGE_OG_FRILANSERE':
            return 'Selvstendig næringsdrivende / frilanser'
        case 'ARBEIDSLEDIG':
            return 'Arbeidsledig'
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
