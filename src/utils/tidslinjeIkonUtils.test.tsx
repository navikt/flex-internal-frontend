import { describe, it, expect } from 'vitest'
import {
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
    SectorChartIcon,
    SplitHorizontalIcon,
} from '@navikt/aksel-icons'

import { ikonForPeriodetype, ikonerForSoknad, ikonForSykmeldingPerioder } from './tidslinjeIkonUtils'

describe('ikonForPeriodetype', () => {
    it('returnerer BandageFillIcon for AKTIVITET_IKKE_MULIG', () => {
        expect(ikonForPeriodetype('AKTIVITET_IKKE_MULIG').type).toBe(BandageFillIcon)
    })

    it('returnerer SectorChartIcon for GRADERT', () => {
        expect(ikonForPeriodetype('GRADERT').type).toBe(SectorChartIcon)
    })

    it('returnerer HospitalIcon for BEHANDLINGSDAGER', () => {
        expect(ikonForPeriodetype('BEHANDLINGSDAGER').type).toBe(HospitalIcon)
    })

    it('returnerer HourglassIcon for AVVENTENDE', () => {
        expect(ikonForPeriodetype('AVVENTENDE').type).toBe(HourglassIcon)
    })
})

describe('ikonerForSoknad — enkelt ikon (ingen modifikator)', () => {
    it('returnerer BriefcaseIcon for ARBEIDSTAKER', () => {
        expect(ikonerForSoknad({ arbeidssituasjon: 'ARBEIDSTAKER', soknadstype: 'ARBEIDSTAKERE' }).type).toBe(
            BriefcaseIcon,
        )
    })

    it('returnerer ImageIcon for NAERINGSDRIVENDE', () => {
        expect(
            ikonerForSoknad({ arbeidssituasjon: 'NAERINGSDRIVENDE', soknadstype: 'SELVSTENDIGE_OG_FRILANSERE' }).type,
        ).toBe(ImageIcon)
    })

    it('returnerer NewspaperIcon for FRILANSER', () => {
        expect(ikonerForSoknad({ arbeidssituasjon: 'FRILANSER', soknadstype: 'SELVSTENDIGE_OG_FRILANSERE' }).type).toBe(
            NewspaperIcon,
        )
    })

    it('returnerer DoorOpenIcon for ARBEIDSLEDIG', () => {
        expect(ikonerForSoknad({ arbeidssituasjon: 'ARBEIDSLEDIG', soknadstype: 'ARBEIDSLEDIG' }).type).toBe(
            DoorOpenIcon,
        )
    })

    it('returnerer PlantIcon for JORDBRUKER', () => {
        expect(
            ikonerForSoknad({ arbeidssituasjon: 'JORDBRUKER', soknadstype: 'SELVSTENDIGE_OG_FRILANSERE' }).type,
        ).toBe(PlantIcon)
    })

    it('returnerer CompassIcon for ANNET_ARBEIDSFORHOLD soknadstype', () => {
        expect(ikonerForSoknad({ soknadstype: 'ANNET_ARBEIDSFORHOLD' }).type).toBe(CompassIcon)
    })

    it('returnerer CompassIcon for ANNET arbeidssituasjon', () => {
        expect(ikonerForSoknad({ arbeidssituasjon: 'ANNET', soknadstype: 'ARBEIDSTAKERE' }).type).toBe(CompassIcon)
    })

    it('returnerer GlobeIcon for OPPHOLD_UTLAND', () => {
        expect(ikonerForSoknad({ soknadstype: 'OPPHOLD_UTLAND' }).type).toBe(GlobeIcon)
    })

    it('returnerer BriefcaseClockIcon for FRISKMELDT_TIL_ARBEIDSFORMIDLING', () => {
        expect(ikonerForSoknad({ soknadstype: 'FRISKMELDT_TIL_ARBEIDSFORMIDLING' }).type).toBe(BriefcaseClockIcon)
    })
})

describe('ikonerForSoknad — med modifikatorikon', () => {
    it('returnerer flex-wrapper med BriefcaseIcon og HospitalIcon for BEHANDLINGSDAGER', () => {
        const result = ikonerForSoknad({ arbeidssituasjon: 'ARBEIDSTAKER', soknadstype: 'BEHANDLINGSDAGER' })
        expect(result.type).toBe('span')
        expect(result.props.children[1][0].props.children.type).toBe(HospitalIcon)
    })

    it('returnerer flex-wrapper med CarIcon for REISETILSKUDD', () => {
        const result = ikonerForSoknad({ arbeidssituasjon: 'ARBEIDSTAKER', soknadstype: 'REISETILSKUDD' })
        expect(result.type).toBe('span')
        expect(result.props.children[1][0].props.children.type).toBe(CarIcon)
    })

    it('returnerer flex-wrapper med PercentIcon og CarIcon for GRADERT_REISETILSKUDD', () => {
        const result = ikonerForSoknad({ arbeidssituasjon: 'ARBEIDSTAKER', soknadstype: 'GRADERT_REISETILSKUDD' })
        expect(result.type).toBe('span')
        expect(result.props.children[1][0].props.children.type).toBe(PercentIcon)
        expect(result.props.children[1][1].props.children.type).toBe(CarIcon)
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
