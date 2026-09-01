import { describe, it, expect } from 'vitest'

import { KlippetSykepengesoknadRecord } from '../queryhooks/useSoknader'

import { toDate } from './dato-utils'
import { perioderSomMangler, minFom, maxTom, sykmeldingOverlappendeDager } from './overlapp'

function lagKlipp(
    id: string,
    periodeFor: { fom: string; tom: string }[],
    periodeEtter: { fom: string; tom: string }[] | null,
): KlippetSykepengesoknadRecord {
    return new KlippetSykepengesoknadRecord({
        id,
        sykepengesoknadUuid: `sok-${id}`,
        sykmeldingUuid: `syk-${id}`,
        klippVariant: 'SOKNAD_STARTER_FOR_SLUTTER_INNI',
        periodeFor: periodeFor.map((p) => ({ ...p, grad: 100, sykmeldingstype: 'AKTIVITET_IKKE_MULIG' })),
        periodeEtter: periodeEtter
            ? periodeEtter.map((p) => ({ ...p, grad: 100, sykmeldingstype: 'AKTIVITET_IKKE_MULIG' }))
            : null,
    })
}

describe('perioderSomMangler', () => {
    it('returnerer tom liste når periodeEtter dekker hele periodeFor', () => {
        const klipp = lagKlipp(
            '1',
            [{ fom: '2024-01-01', tom: '2024-01-31' }],
            [{ fom: '2024-01-01', tom: '2024-01-31' }],
        )
        expect(perioderSomMangler(klipp)).toHaveLength(0)
    })

    it('returnerer hele perioden som manglende når periodeEtter er null', () => {
        const klipp = lagKlipp('2', [{ fom: '2024-01-01', tom: '2024-01-05' }], null)
        const mangler = perioderSomMangler(klipp)
        expect(mangler).toHaveLength(1)
        expect(mangler[0].fom).toBe('2024-01-01')
        expect(mangler[0].tom).toBe('2024-01-05')
    })

    it('returnerer dager som er i periodeFor men ikke i periodeEtter', () => {
        const klipp = lagKlipp(
            '3',
            [{ fom: '2024-02-01', tom: '2024-02-10' }],
            [{ fom: '2024-02-06', tom: '2024-02-10' }],
        )
        const mangler = perioderSomMangler(klipp)
        expect(mangler).toHaveLength(1)
        expect(mangler[0].fom).toBe('2024-02-01')
        expect(mangler[0].tom).toBe('2024-02-05')
    })

    it('returnerer riktig klipp-metadata på hvert manglende periode-objekt', () => {
        const klipp = lagKlipp('meta-1', [{ fom: '2024-03-01', tom: '2024-03-03' }], null)
        const mangler = perioderSomMangler(klipp)
        expect(mangler[0].id).toBe('meta-1')
        expect(mangler[0].sykepengesoknadUuid).toBe('sok-meta-1')
    })

    it('returnerer to separate perioder ved hull i midten', () => {
        const klipp = lagKlipp(
            '4',
            [{ fom: '2024-04-01', tom: '2024-04-10' }],
            [{ fom: '2024-04-04', tom: '2024-04-07' }],
        )
        const mangler = perioderSomMangler(klipp)
        expect(mangler).toHaveLength(2)
        expect(mangler[0].fom).toBe('2024-04-01')
        expect(mangler[0].tom).toBe('2024-04-03')
        expect(mangler[1].fom).toBe('2024-04-08')
        expect(mangler[1].tom).toBe('2024-04-10')
    })

    it('returnerer ett-dags periode som én inklusiv dag (fom er lik tom)', () => {
        const klipp = lagKlipp('5', [{ fom: '2024-06-15', tom: '2024-06-15' }], null)
        const mangler = perioderSomMangler(klipp)
        expect(mangler).toHaveLength(1)
        expect(mangler[0].fom).toBe('2024-06-15')
        expect(mangler[0].tom).toBe('2024-06-15')
    })

    it('beholder riktig kalenderdag-antall over sommertid-overgangen i mars (23-timers døgn)', () => {
        // 2026-03-29 er DST-start i Oslo (klokken hopper fra 02:00 til 03:00). Perioden skal likevel telle
        // som 7 kalenderdager (27. mars t.o.m. 2. april), ikke 6 (som rå millisekund-diff ville gitt).
        const klipp = lagKlipp('dst-mars', [{ fom: '2026-03-27', tom: '2026-04-02' }], null)
        const mangler = perioderSomMangler(klipp)
        expect(mangler).toHaveLength(1)
        expect(mangler[0].fom).toBe('2026-03-27')
        expect(mangler[0].tom).toBe('2026-04-02')
    })

    it('beholder riktig kalenderdag-antall over sommertid-slutt i oktober (25-timers døgn)', () => {
        // 2026-10-25 er DST-slutt i Oslo (klokken går fra 03:00 tilbake til 02:00).
        const klipp = lagKlipp('dst-okt', [{ fom: '2026-10-24', tom: '2026-10-26' }], null)
        const mangler = perioderSomMangler(klipp)
        expect(mangler).toHaveLength(1)
        expect(mangler[0].fom).toBe('2026-10-24')
        expect(mangler[0].tom).toBe('2026-10-26')
    })

    it('inkluderer skuddårsdagen 29. februar som del av en sammenhengende periode', () => {
        const klipp = lagKlipp('leap', [{ fom: '2024-02-28', tom: '2024-03-01' }], null)
        const mangler = perioderSomMangler(klipp)
        expect(mangler).toHaveLength(1)
        expect(mangler[0].fom).toBe('2024-02-28')
        expect(mangler[0].tom).toBe('2024-03-01')
    })

    it('returnerer tom liste uten å kaste når periodeFor er tom (omvendt/ugyldig spenn)', () => {
        const klipp = lagKlipp('empty', [], null)
        expect(() => perioderSomMangler(klipp)).not.toThrow()
        expect(perioderSomMangler(klipp)).toHaveLength(0)
    })
})

describe('minFom', () => {
    it('finner den tidligste fom-datoen', () => {
        const perioder = [
            { fom: '2024-03-01', tom: '2024-03-31' },
            { fom: '2024-01-01', tom: '2024-01-31' },
            { fom: '2024-02-01', tom: '2024-02-28' },
        ]
        expect(minFom(perioder)).toBe('2024-01-01')
    })

    it('fungerer med én periode', () => {
        expect(minFom([{ fom: '2024-06-15' }])).toBe('2024-06-15')
    })

    it('returnerer sentinel-verdi for tom liste', () => {
        expect(minFom([])).toBe('9999-12-31')
    })

    it('fungerer med Date-objekter', () => {
        const perioder = [{ fom: toDate('2024-05-10'), tom: '2024-05-20' }]
        expect(minFom(perioder)).toBe('2024-05-10')
    })
})

describe('maxTom', () => {
    it('finner den seneste tom-datoen', () => {
        const perioder = [
            { fom: '2024-01-01', tom: '2024-01-31' },
            { fom: '2024-03-01', tom: '2024-04-30' },
            { fom: '2024-02-01', tom: '2024-02-28' },
        ]
        expect(maxTom(perioder)).toBe('2024-04-30')
    })

    it('fungerer med én periode', () => {
        expect(maxTom([{ tom: '2024-06-30' }])).toBe('2024-06-30')
    })

    it('returnerer sentinel-verdi for tom liste', () => {
        expect(maxTom([])).toBe('1111-01-01')
    })

    it('fungerer med Date-objekter', () => {
        const perioder = [{ fom: '2024-05-01', tom: toDate('2024-05-20') }]
        expect(maxTom(perioder)).toBe('2024-05-20')
    })
})

describe('sykmeldingOverlappendeDager', () => {
    it('returnerer tom liste når ingen dager er duplikater', () => {
        const dager = ['2024-01-01', '2024-01-02', '2024-01-03']
        expect(sykmeldingOverlappendeDager(dager)).toHaveLength(0)
    })

    it('returnerer duplikerte dager', () => {
        const dager = ['2024-01-01', '2024-01-02', '2024-01-01']
        const overlapp = sykmeldingOverlappendeDager(dager)
        expect(overlapp).toContain('2024-01-01')
        expect(overlapp).toHaveLength(1)
    })

    it('returnerer alle forekomster av dager som overlapper', () => {
        const dager = ['2024-02-01', '2024-02-01', '2024-02-02', '2024-02-02', '2024-02-03']
        const overlapp = sykmeldingOverlappendeDager(dager)
        expect(overlapp).toHaveLength(2)
        expect(overlapp).toContain('2024-02-01')
        expect(overlapp).toContain('2024-02-02')
    })
})
