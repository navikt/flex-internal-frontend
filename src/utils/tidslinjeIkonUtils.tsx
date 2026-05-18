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

import type { Periodetype } from '../types/backend/sykmelding'
import type { Soknadstype } from '../types/backend/soknad'

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
