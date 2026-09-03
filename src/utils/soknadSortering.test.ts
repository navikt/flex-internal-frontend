import { describe, expect, it } from 'vitest'

import { KlippetSykepengesoknadRecord, Soknad } from '../queryhooks/useSoknader'

import { SoknadGruppering, SykmeldingGruppering } from './gruppering'
import { Klipp } from './overlapp'
import { sortert } from './soknadSortering'

const lagSoknad = (
    id: string,
    felter: Partial<{ tom: string; opprettetDato: string; sykmeldingUtskrevet: string }> = {},
): Soknad =>
    new Soknad({
        id,
        sykmeldingId: `syk-${id}`,
        soknadstype: 'ARBEIDSTAKERE',
        status: 'SENDT',
        arbeidssituasjon: 'ARBEIDSTAKER',
        soknadPerioder: [],
        ...felter,
    })

const lagKlipp = (fom: string, tom: string, timestamp?: string): Klipp => ({
    ...new KlippetSykepengesoknadRecord({
        id: 'klipp',
        sykepengesoknadUuid: 'sok',
        sykmeldingUuid: 'syk',
        klippVariant: 'SOKNAD_STARTER_FOR_SLUTTER_INNI',
        periodeFor: [{ fom, tom, grad: 100, sykmeldingstype: 'AKTIVITET_IKKE_MULIG' }],
        periodeEtter: null,
        timestamp,
    }),
    fom,
    tom,
})

const lagSykmeldingGruppering = (soknader: Soknad[], klippingAvSykmelding: Klipp[] = []): SykmeldingGruppering => ({
    soknader: new Map(
        soknader.map((soknad): [string, SoknadGruppering] => [soknad.id, { soknad, klippingAvSoknad: [] }]),
    ),
    klippingAvSykmelding,
})

describe('sortert', () => {
    describe("sortering 'tom'", () => {
        it('sorterer synkende på tom - senest tom kommer først', () => {
            const tidlig: [string, SykmeldingGruppering] = [
                'syk-tidlig',
                lagSykmeldingGruppering([lagSoknad('a', { tom: '2026-01-10' })]),
            ]
            const sen: [string, SykmeldingGruppering] = [
                'syk-sen',
                lagSykmeldingGruppering([lagSoknad('b', { tom: '2026-01-20' })]),
            ]

            expect(sortert(sen, tidlig, 'tom')).toBe(-1)
            expect(sortert(tidlig, sen, 'tom')).toBe(1)
        })

        it('gir 1 i begge retninger ved lik tom (ikke-symmetrisk uavgjort, bevart atferd)', () => {
            const a: [string, SykmeldingGruppering] = [
                'syk-a',
                lagSykmeldingGruppering([lagSoknad('a', { tom: '2026-01-15' })]),
            ]
            const b: [string, SykmeldingGruppering] = [
                'syk-b',
                lagSykmeldingGruppering([lagSoknad('b', { tom: '2026-01-15' })]),
            ]

            expect(sortert(a, b, 'tom')).toBe(1)
            expect(sortert(b, a, 'tom')).toBe(1)
        })

        it('faller tilbake til epoke-verdi (år 0) når tom mangler - søknad med dato vinner alltid', () => {
            const utenTom: [string, SykmeldingGruppering] = ['syk-uten', lagSykmeldingGruppering([lagSoknad('a')])]
            const medTom: [string, SykmeldingGruppering] = [
                'syk-med',
                lagSykmeldingGruppering([lagSoknad('b', { tom: '2026-01-01' })]),
            ]

            expect(sortert(medTom, utenTom, 'tom')).toBe(-1)
            expect(sortert(utenTom, medTom, 'tom')).toBe(1)
        })

        it('faller tilbake til sentinel 2000-01-01 når sykmeldingen ikke har noen søknader', () => {
            const tom: [string, SykmeldingGruppering] = ['syk-tom', lagSykmeldingGruppering([])]
            const medTom: [string, SykmeldingGruppering] = [
                'syk-med',
                lagSykmeldingGruppering([lagSoknad('b', { tom: '2001-01-01' })]),
            ]

            // 2001 > sentinel 2000-01-01, så syk-med skal vinne
            expect(sortert(medTom, tom, 'tom')).toBe(-1)
        })

        it('bruker klipp-tom (streng, YYYY-MM-DD) for GHOST-sykmelding og sammenligner korrekt mot Date-baserte tom', () => {
            const ghost: [string, SykmeldingGruppering] = [
                'syk-ghost_GHOST',
                lagSykmeldingGruppering([], [lagKlipp('2026-03-01', '2026-03-31')]),
            ]
            const vanlig: [string, SykmeldingGruppering] = [
                'syk-vanlig',
                lagSykmeldingGruppering([lagSoknad('a', { tom: '2026-02-01' })]),
            ]

            expect(sortert(ghost, vanlig, 'tom')).toBe(-1)
            expect(sortert(vanlig, ghost, 'tom')).toBe(1)
        })
    })

    describe("sortering 'opprettet'", () => {
        it('sorterer synkende på opprettetDato for vanlig sykmelding', () => {
            const tidlig: [string, SykmeldingGruppering] = [
                'syk-tidlig',
                lagSykmeldingGruppering([lagSoknad('a', { opprettetDato: '2026-01-01' })]),
            ]
            const sen: [string, SykmeldingGruppering] = [
                'syk-sen',
                lagSykmeldingGruppering([lagSoknad('b', { opprettetDato: '2026-06-01' })]),
            ]

            expect(sortert(sen, tidlig, 'opprettet')).toBe(-1)
            expect(sortert(tidlig, sen, 'opprettet')).toBe(1)
        })

        it('bruker klipp-timestamp (offset-tidspunkt) for GHOST-sykmelding', () => {
            const ghostTidlig: [string, SykmeldingGruppering] = [
                'syk-a_GHOST',
                lagSykmeldingGruppering([], [lagKlipp('2026-01-01', '2026-01-05', '2026-01-01T08:00:00Z')]),
            ]
            const ghostSen: [string, SykmeldingGruppering] = [
                'syk-b_GHOST',
                lagSykmeldingGruppering([], [lagKlipp('2026-02-01', '2026-02-05', '2026-02-01T08:00:00Z')]),
            ]

            expect(sortert(ghostSen, ghostTidlig, 'opprettet')).toBe(-1)
        })
    })

    describe("sortering 'sykmelding skrevet'", () => {
        it('sorterer synkende på sykmeldingUtskrevet', () => {
            const tidlig: [string, SykmeldingGruppering] = [
                'syk-tidlig',
                lagSykmeldingGruppering([lagSoknad('a', { sykmeldingUtskrevet: '2026-01-01' })]),
            ]
            const sen: [string, SykmeldingGruppering] = [
                'syk-sen',
                lagSykmeldingGruppering([lagSoknad('b', { sykmeldingUtskrevet: '2026-06-01' })]),
            ]

            expect(sortert(sen, tidlig, 'sykmelding skrevet')).toBe(-1)
            expect(sortert(tidlig, sen, 'sykmelding skrevet')).toBe(1)
        })

        it('faller tilbake til epoke når feltet mangler for begge - ingen skal vinne (returnerer 1)', () => {
            const a: [string, SykmeldingGruppering] = ['syk-a', lagSykmeldingGruppering([lagSoknad('a')])]
            const b: [string, SykmeldingGruppering] = ['syk-b', lagSykmeldingGruppering([lagSoknad('b')])]

            expect(sortert(a, b, 'sykmelding skrevet')).toBe(1)
            expect(sortert(b, a, 'sykmelding skrevet')).toBe(1)
        })
    })
})
