import { describe, it, expect } from 'vitest'

import type { Sykmelding } from '../../queryhooks/useSykmeldinger'
import { toDate } from '../../utils/dato-utils'

import {
    antallKalenderdager,
    grupperSykmeldingerPaArbeidsgiver,
    perioderMedDatoer,
    sorterPerioder,
    sykmeldingStatus,
} from './sykmeldingTidslinjeUtils'

describe('sykmeldingStatus', () => {
    it.each([
        ['SENDT', 'success'],
        ['BEKREFTET', 'success'],
        ['AVVIST', 'warning'],
        ['UTGATT', 'warning'],
        ['AVBRUTT', 'warning'],
        ['APEN', 'info'],
        ['NY', 'info'],
    ] as const)('returnerer %s → %s', (statusEvent, forventetStatus) => {
        expect(sykmeldingStatus(statusEvent)).toBe(forventetStatus)
    })

    it('returnerer info for undefined status', () => {
        expect(sykmeldingStatus(undefined)).toBe('info')
    })
})

describe('antallKalenderdager', () => {
    it('returnerer 1 for samme dag', () => {
        const dato = new Date('2024-01-01')
        expect(antallKalenderdager(dato, dato)).toBe(1)
    })

    it('returnerer 2 for to påfølgende dager', () => {
        expect(antallKalenderdager(new Date('2024-01-01'), new Date('2024-01-02'))).toBe(2)
    })

    it('returnerer 31 for hele januar', () => {
        expect(antallKalenderdager(new Date('2024-01-01'), new Date('2024-01-31'))).toBe(31)
    })

    it('teller kalenderdager riktig over DST-start i Oslo', () => {
        expect(antallKalenderdager(new Date('2026-03-28T00:00:00+01:00'), new Date('2026-03-30T00:00:00+02:00'))).toBe(
            3,
        )
    })
})

describe('sorterPerioder', () => {
    it('sorterer perioder etter startDato stigende', () => {
        const perioder = [
            {
                fom: '2024-03-01',
                tom: '2024-03-31',
                startDato: new Date('2024-03-01'),
                sluttDato: new Date('2024-03-31'),
            },
            {
                fom: '2024-01-01',
                tom: '2024-01-31',
                startDato: new Date('2024-01-01'),
                sluttDato: new Date('2024-01-31'),
            },
            {
                fom: '2024-02-01',
                tom: '2024-02-29',
                startDato: new Date('2024-02-01'),
                sluttDato: new Date('2024-02-29'),
            },
        ]

        const sortert = sorterPerioder(perioder)
        expect(sortert[0].fom).toBe('2024-01-01')
        expect(sortert[1].fom).toBe('2024-02-01')
        expect(sortert[2].fom).toBe('2024-03-01')
    })

    it('muterer ikke original array', () => {
        const perioder = [
            {
                fom: '2024-02-01',
                tom: '2024-02-29',
                startDato: new Date('2024-02-01'),
                sluttDato: new Date('2024-02-29'),
            },
            {
                fom: '2024-01-01',
                tom: '2024-01-31',
                startDato: new Date('2024-01-01'),
                sluttDato: new Date('2024-01-31'),
            },
        ]
        sorterPerioder(perioder)
        expect(perioder[0].fom).toBe('2024-02-01')
    })

    it('returnerer tom array for tom input', () => {
        expect(sorterPerioder([])).toEqual([])
    })
})

describe('perioderMedDatoer', () => {
    const lagSykmelding = (perioder: { fom: string; tom: string }[]): Sykmelding =>
        ({
            sykmeldingsperioder: perioder.map((p) => ({
                fom: toDate(p.fom),
                tom: toDate(p.tom),
                gradert: null,
                behandlingsdager: null,
                innspillTilArbeidsgiver: null,
                type: 'AKTIVITET_IKKE_MULIG',
                reisetilskudd: false,
                aktivitetIkkeMulig: null,
            })),
        }) as unknown as Sykmelding

    it('returnerer periode med korrekte fom/tom-strenger', () => {
        const sykmelding = lagSykmelding([{ fom: '2024-01-01', tom: '2024-01-31' }])
        const perioder = perioderMedDatoer(sykmelding)

        expect(perioder).toHaveLength(1)
        expect(perioder[0].fom).toBe('2024-01-01')
        expect(perioder[0].tom).toBe('2024-01-31')
    })

    it('returnerer korrekte Date-objekter', () => {
        const sykmelding = lagSykmelding([{ fom: '2024-06-15', tom: '2024-06-30' }])
        const perioder = perioderMedDatoer(sykmelding)

        expect(perioder[0].startDato.getUTCFullYear()).toBe(2024)
        expect(perioder[0].startDato.getUTCMonth()).toBe(5) // juni = 5
        expect(perioder[0].startDato.getUTCDate()).toBe(15)
    })

    it('filtrerer ut perioder med ugyldig dato', () => {
        const sykmelding = {
            sykmeldingsperioder: [
                { fom: new Date('invalid'), tom: toDate('2024-01-31') },
                { fom: toDate('2024-01-01'), tom: toDate('2024-01-31') },
            ],
        } as unknown as Sykmelding

        const perioder = perioderMedDatoer(sykmelding)
        expect(perioder).toHaveLength(1)
    })

    it('returnerer tom array for sykmelding uten perioder', () => {
        const sykmelding = lagSykmelding([])
        expect(perioderMedDatoer(sykmelding)).toHaveLength(0)
    })
})

describe('perioderMedDatoer - DST', () => {
    const lagSykmelding = (perioder: { fom: string; tom: string }[]): Sykmelding =>
        ({
            sykmeldingsperioder: perioder.map((p) => ({
                fom: toDate(p.fom),
                tom: toDate(p.tom),
                gradert: null,
                behandlingsdager: null,
                innspillTilArbeidsgiver: null,
                type: 'AKTIVITET_IKKE_MULIG',
                reisetilskudd: false,
                aktivitetIkkeMulig: null,
            })),
        }) as unknown as Sykmelding

    it('holder start- og sluttdato som egne kalenderdager over DST-overgangen i mars', () => {
        const sykmelding = lagSykmelding([{ fom: '2026-03-27', tom: '2026-03-30' }])
        const perioder = perioderMedDatoer(sykmelding)

        expect(perioder[0].fom).toBe('2026-03-27')
        expect(perioder[0].tom).toBe('2026-03-30')
        expect(perioder[0].startDato.toISOString()).toBe('2026-03-27T00:00:00.000Z')
        expect(perioder[0].sluttDato.toISOString()).toBe('2026-03-30T00:00:00.000Z')
    })
})

describe('sorterPerioder - DST', () => {
    it('sorterer perioder korrekt selv når periodene krysser DST-overgangen i mars', () => {
        const perioder = [
            {
                fom: '2026-03-29',
                tom: '2026-04-05',
                startDato: toDate('2026-03-29'),
                sluttDato: toDate('2026-04-05'),
            },
            {
                fom: '2026-03-20',
                tom: '2026-03-26',
                startDato: toDate('2026-03-20'),
                sluttDato: toDate('2026-03-26'),
            },
        ]

        const sortert = sorterPerioder(perioder)
        expect(sortert[0].fom).toBe('2026-03-20')
        expect(sortert[1].fom).toBe('2026-03-29')
    })
})

describe('grupperSykmeldingerPaArbeidsgiver - DST', () => {
    const lagFullSykmelding = (perioder: { fom: string; tom: string }[]): Sykmelding =>
        ({
            mottattTidspunkt: toDate('2026-03-01'),
            arbeidsgiver: { navn: null, stillingsprosent: null },
            sykmeldingStatus: { arbeidsgiver: { orgnummer: '999999999' }, brukerSvar: null },
            sykmeldingsperioder: perioder.map((p) => ({
                fom: toDate(p.fom),
                tom: toDate(p.tom),
                gradert: null,
                behandlingsdager: null,
                innspillTilArbeidsgiver: null,
                type: 'AKTIVITET_IKKE_MULIG',
                reisetilskudd: false,
                aktivitetIkkeMulig: null,
            })),
        }) as unknown as Sykmelding

    it('genererer én dagnøkkel per kalenderdag over DST-overgangen uten å hoppe over eller duplisere en dag', () => {
        const sykmelding = lagFullSykmelding([{ fom: '2026-03-27', tom: '2026-03-30' }])

        const gruppert = grupperSykmeldingerPaArbeidsgiver([sykmelding])
        const gruppe = gruppert.get('999999999__')

        expect(gruppe?.dagNokler).toEqual(new Set(['2026-03-27', '2026-03-28', '2026-03-29', '2026-03-30']))
    })
})
