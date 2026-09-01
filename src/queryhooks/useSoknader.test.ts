import { describe, expect, it } from 'vitest'

import { formaterDato } from '../utils/dato-utils'

import { BackendKlippetSykepengesoknadRecord, BackendSoknad, KlippetSykepengesoknadRecord, Soknad } from './useSoknader'

const datoStr = (dato: Date): string => formaterDato(dato, 'yyyy-MM-dd')

const baseSoknad: BackendSoknad = {
    id: 'soknad-1',
    soknadstype: 'ARBEIDSTAKERE',
    status: 'SENDT',
    soknadPerioder: [{ fom: '2026-03-01', tom: '2026-03-15', grad: 100, sykmeldingstype: 'AKTIVITET_IKKE_MULIG' }],
}

const baseKlipp: BackendKlippetSykepengesoknadRecord = {
    id: 'klipp-1',
    sykepengesoknadUuid: 'soknad-uuid',
    sykmeldingUuid: 'sykmelding-uuid',
    klippVariant: 'SOKNAD_STARTER_INNI_SLUTTER_ETTER',
    periodeFor: [{ fom: '2026-03-01', tom: '2026-03-15', grad: 100, sykmeldingstype: 'AKTIVITET_IKKE_MULIG' }],
    periodeEtter: null,
}

describe('Soknad optional datofelter', () => {
    it('gir undefined for alle optional datofelter uten verdi', () => {
        const soknad = new Soknad(baseSoknad)

        expect(soknad.fom).toBeUndefined()
        expect(soknad.tom).toBeUndefined()
        expect(soknad.avbruttDato).toBeUndefined()
        expect(soknad.sykmeldingUtskrevet).toBeUndefined()
        expect(soknad.sykmeldingSignaturDato).toBeUndefined()
        expect(soknad.startSykeforlop).toBeUndefined()
        expect(soknad.opprettetDato).toBeUndefined()
        expect(soknad.sendtTilNAVDato).toBeUndefined()
        expect(soknad.sendtTilArbeidsgiverDato).toBeUndefined()
    })
})

describe('Soknad date-only felt', () => {
    it('tolker fom/tom uten tidssone som Oslo-kalenderdag', () => {
        const soknad = new Soknad({ ...baseSoknad, fom: '2026-03-29', tom: '2026-03-30' })

        expect(soknad.fom).toBeInstanceOf(Date)
        expect(soknad.tom).toBeInstanceOf(Date)
        expect(datoStr(soknad.fom as Date)).toBe('2026-03-29')
        expect(datoStr(soknad.tom as Date)).toBe('2026-03-30')
    })
})

describe('Soknad offset/Z tidspunkt', () => {
    it('beholder instant for opprettetDato med Z', () => {
        const soknad = new Soknad({ ...baseSoknad, opprettetDato: '2026-03-29T12:00:00Z' })

        expect(soknad.opprettetDato?.toISOString()).toBe('2026-03-29T12:00:00.000Z')
    })

    it('beholder instant for sendtTilNAVDato med offset', () => {
        const soknad = new Soknad({ ...baseSoknad, sendtTilNAVDato: '2026-03-29T14:00:00+02:00' })

        expect(soknad.sendtTilNAVDato?.toISOString()).toBe('2026-03-29T12:00:00.000Z')
    })
})

describe('Soknad periodefelter', () => {
    it('konverterer soknadPerioder.fom/tom til Date', () => {
        const soknad = new Soknad(baseSoknad)

        expect(soknad.soknadPerioder).toHaveLength(1)
        expect(soknad.soknadPerioder[0].fom).toBeInstanceOf(Date)
        expect(soknad.soknadPerioder[0].tom).toBeInstanceOf(Date)
    })

    it('dropper periode med ugyldig fom eller tom (bevarer eksisterende filtreringsoppførsel)', () => {
        const soknad = new Soknad({
            ...baseSoknad,
            soknadPerioder: [
                { fom: '2026-13-01', tom: '2026-03-15', grad: 100, sykmeldingstype: 'AKTIVITET_IKKE_MULIG' },
            ],
        })

        expect(soknad.soknadPerioder).toHaveLength(0)
    })

    it('dropper meldingTilNavDagerFraSykmelding-periode med ugyldig dato', () => {
        const soknad = new Soknad({
            ...baseSoknad,
            meldingTilNavDagerFraSykmelding: [{ fom: '2026-13-01', tom: '2026-03-15' }],
        })

        expect(soknad.meldingTilNavDagerFraSykmelding).toEqual([])
    })

    it('konverterer meldingTilNavDagerFraSykmelding til Date når gyldig', () => {
        const soknad = new Soknad({
            ...baseSoknad,
            meldingTilNavDagerFraSykmelding: [{ fom: '2026-03-01', tom: '2026-03-02' }],
        })

        expect(soknad.meldingTilNavDagerFraSykmelding).toHaveLength(1)
        expect(soknad.meldingTilNavDagerFraSykmelding?.[0].fom).toBeInstanceOf(Date)
        expect(soknad.meldingTilNavDagerFraSykmelding?.[0].tom).toBeInstanceOf(Date)
    })
})

describe('KlippetSykepengesoknadRecord timestamp', () => {
    it('gir undefined for timestamp uten verdi', () => {
        const klipp = new KlippetSykepengesoknadRecord(baseKlipp)

        expect(klipp.timestamp).toBeUndefined()
    })

    it('beholder instant for timestamp med Z', () => {
        const klipp = new KlippetSykepengesoknadRecord({ ...baseKlipp, timestamp: '2026-03-29T12:00:00Z' })

        expect(klipp.timestamp?.toISOString()).toBe('2026-03-29T12:00:00.000Z')
    })

    it('gir undefined for ugyldig timestamp', () => {
        const klipp = new KlippetSykepengesoknadRecord({ ...baseKlipp, timestamp: '2026-13-01' })

        expect(klipp.timestamp).toBeUndefined()
    })

    it('konverterer periodeFor/periodeEtter til Date', () => {
        const klipp = new KlippetSykepengesoknadRecord({
            ...baseKlipp,
            periodeEtter: [
                { fom: '2026-03-01', tom: '2026-03-10', grad: 100, sykmeldingstype: 'AKTIVITET_IKKE_MULIG' },
            ],
        })

        expect(klipp.periodeFor[0].fom).toBeInstanceOf(Date)
        expect(klipp.periodeEtter?.[0].fom).toBeInstanceOf(Date)
    })
})
