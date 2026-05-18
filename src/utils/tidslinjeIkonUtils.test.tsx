import { describe, it, expect } from 'vitest'
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
    SectorChartIcon,
    SplitHorizontalIcon,
} from '@navikt/aksel-icons'

import { ikonForPeriodetype, ikonForSoknadstype, ikonForSykmeldingPerioder } from './tidslinjeIkonUtils'

describe('ikonForPeriodetype', () => {
    it('returnerer BandageFillIcon for AKTIVITET_IKKE_MULIG', () => {
        expect(ikonForPeriodetype('AKTIVITET_IKKE_MULIG').type).toBe(BandageFillIcon)
    })

    it('returnerer SectorChartIcon for GRADERT', () => {
        expect(ikonForPeriodetype('GRADERT').type).toBe(SectorChartIcon)
    })

    it('returnerer MedicalThermometerIcon for BEHANDLINGSDAGER', () => {
        expect(ikonForPeriodetype('BEHANDLINGSDAGER').type).toBe(MedicalThermometerIcon)
    })

    it('returnerer HourglassIcon for AVVENTENDE', () => {
        expect(ikonForPeriodetype('AVVENTENDE').type).toBe(HourglassIcon)
    })

    it('returnerer AirplaneIcon for REISETILSKUDD', () => {
        expect(ikonForPeriodetype('REISETILSKUDD').type).toBe(AirplaneIcon)
    })
})

describe('ikonForSoknadstype', () => {
    it('returnerer BriefcaseIcon for ARBEIDSTAKERE', () => {
        expect(ikonForSoknadstype('ARBEIDSTAKERE').type).toBe(BriefcaseIcon)
    })

    it('returnerer BriefcaseIcon for ANNET_ARBEIDSFORHOLD', () => {
        expect(ikonForSoknadstype('ANNET_ARBEIDSFORHOLD').type).toBe(BriefcaseIcon)
    })

    it('returnerer HandshakeIcon for SELVSTENDIGE_OG_FRILANSERE', () => {
        expect(ikonForSoknadstype('SELVSTENDIGE_OG_FRILANSERE').type).toBe(HandshakeIcon)
    })

    it('returnerer PersonIcon for ARBEIDSLEDIG', () => {
        expect(ikonForSoknadstype('ARBEIDSLEDIG').type).toBe(PersonIcon)
    })

    it('returnerer MedicalThermometerIcon for BEHANDLINGSDAGER', () => {
        expect(ikonForSoknadstype('BEHANDLINGSDAGER').type).toBe(MedicalThermometerIcon)
    })

    it('returnerer AirplaneIcon for REISETILSKUDD', () => {
        expect(ikonForSoknadstype('REISETILSKUDD').type).toBe(AirplaneIcon)
    })

    it('returnerer AirplaneIcon for GRADERT_REISETILSKUDD', () => {
        expect(ikonForSoknadstype('GRADERT_REISETILSKUDD').type).toBe(AirplaneIcon)
    })

    it('returnerer GlobeIcon for OPPHOLD_UTLAND', () => {
        expect(ikonForSoknadstype('OPPHOLD_UTLAND').type).toBe(GlobeIcon)
    })

    it('returnerer PersonCheckmarkIcon for FRISKMELDT_TIL_ARBEIDSFORMIDLING', () => {
        expect(ikonForSoknadstype('FRISKMELDT_TIL_ARBEIDSFORMIDLING').type).toBe(PersonCheckmarkIcon)
    })
})

describe('ikonForSykmeldingPerioder', () => {
    it('returnerer SplitHorizontalIcon når det er flere enn én periode', () => {
        expect(ikonForSykmeldingPerioder(3, 'AKTIVITET_IKKE_MULIG').type).toBe(SplitHorizontalIcon)
    })

    it('returnerer periodetype-ikon for én periode', () => {
        expect(ikonForSykmeldingPerioder(1, 'GRADERT').type).toBe(SectorChartIcon)
    })

    it('returnerer BandageFillIcon som fallback når periodetype er undefined', () => {
        expect(ikonForSykmeldingPerioder(1, undefined).type).toBe(BandageFillIcon)
    })
})
