import dayjs from 'dayjs'
import { describe, it, expect } from 'vitest'

import type { Sykmelding } from '../../queryhooks/useSykmeldinger'

import { antallKalenderdager, perioderMedDatoer, sorterPerioder, sykmeldingStatus } from './sykmeldingTidslinjeUtils'

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
                fom: dayjs(p.fom),
                tom: dayjs(p.tom),
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
                { fom: dayjs('invalid'), tom: dayjs('2024-01-31') },
                { fom: dayjs('2024-01-01'), tom: dayjs('2024-01-31') },
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
