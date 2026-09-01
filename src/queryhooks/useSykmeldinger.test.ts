import { describe, expect, it } from 'vitest'

import { sykmeldingerTestdata } from '../testdata/sykmeldingerTestdata'
import { formaterDato } from '../utils/dato-utils'

import { BackendSykmelding, mapTilSykmelding } from './useSykmeldinger'

const datoStr = (dato: Date): string => formaterDato(dato, 'yyyy-MM-dd')

const baseSykmelding: BackendSykmelding = {
    id: 'sm-1',
    arbeidsgiver: { navn: null, stillingsprosent: null },
    behandletTidspunkt: '2026-03-02T10:00:00Z',
    behandlingsutfall: { status: 'OK', ruleHits: [], erUnderBehandling: false },
    egenmeldt: false,
    kontaktMedPasient: { kontaktDato: null, begrunnelseIkkeKontakt: null },
    merknader: null,
    mottattTidspunkt: '2026-03-01T10:00:00Z',
    papirsykmelding: false,
    pasient: { fnr: null, overSyttiAar: null },
    signaturDato: null,
    skjermesForPasient: false,
    syketilfelleStartDato: null,
    sykmeldingStatus: {
        statusEvent: 'SENDT',
        timestamp: '2026-03-01T10:00:00Z',
        arbeidsgiver: null,
        brukerSvar: null,
    },
    sykmeldingsperioder: [
        {
            fom: '2026-03-01',
            tom: '2026-03-15',
            gradert: null,
            behandlingsdager: null,
            innspillTilArbeidsgiver: null,
            type: 'AKTIVITET_IKKE_MULIG',
            aktivitetIkkeMulig: null,
            reisetilskudd: false,
        },
    ],
    hendelser: [],
    utenlandskSykmelding: null,
}

describe('mapTilSykmelding hendelser', () => {
    it('tar med hendelser og konverterer tidspunkt til Date', () => {
        const backendSykmelding = sykmeldingerTestdata[0]

        const sykmelding = mapTilSykmelding(backendSykmelding)

        expect(sykmelding.hendelser.length).toBe(backendSykmelding.hendelser.length)
        expect(sykmelding.hendelser[0].hendelseOpprettet).toBeInstanceOf(Date)
        expect(sykmelding.hendelser[0].lokaltOpprettet).toBeInstanceOf(Date)
    })
})

describe('sykmeldingerTestdata hendelser', () => {
    it('gir hver sykmelding minst én hendelse med APEN først', () => {
        expect(sykmeldingerTestdata.length).toBeGreaterThan(0)

        sykmeldingerTestdata.forEach((sykmelding) => {
            expect(sykmelding.hendelser.length).toBeGreaterThanOrEqual(1)
            expect(sykmelding.hendelser[0].status).toBe('APEN')
        })
    })
})

describe('mapTilSykmelding optional datofelter', () => {
    it('gir undefined for signaturDato, syketilfelleStartDato og kontaktDato uten verdi', () => {
        const sykmelding = mapTilSykmelding(baseSykmelding)

        expect(sykmelding.signaturDato).toBeUndefined()
        expect(sykmelding.syketilfelleStartDato).toBeUndefined()
        expect(sykmelding.kontaktMedPasient.kontaktDato).toBeUndefined()
    })
})

describe('mapTilSykmelding date-only felt', () => {
    it('tolker sykmeldingsperiode-dato uten tidssone som Oslo-kalenderdag', () => {
        const sykmelding = mapTilSykmelding({
            ...baseSykmelding,
            sykmeldingsperioder: [{ ...baseSykmelding.sykmeldingsperioder[0], fom: '2026-03-29', tom: '2026-03-30' }],
        })

        expect(datoStr(sykmelding.sykmeldingsperioder[0].fom)).toBe('2026-03-29')
        expect(datoStr(sykmelding.sykmeldingsperioder[0].tom)).toBe('2026-03-30')
    })

    it('tolker kontaktDato uten tidssone som Oslo-kalenderdag', () => {
        const sykmelding = mapTilSykmelding({
            ...baseSykmelding,
            kontaktMedPasient: { kontaktDato: '2026-03-29', begrunnelseIkkeKontakt: null },
        })

        expect(sykmelding.kontaktMedPasient.kontaktDato).toBeDefined()
        expect(datoStr(sykmelding.kontaktMedPasient.kontaktDato as Date)).toBe('2026-03-29')
    })
})

describe('mapTilSykmelding offset/Z tidspunkt', () => {
    it('beholder instant for mottattTidspunkt med Z', () => {
        const sykmelding = mapTilSykmelding({ ...baseSykmelding, mottattTidspunkt: '2026-03-29T12:00:00Z' })

        expect(sykmelding.mottattTidspunkt.toISOString()).toBe('2026-03-29T12:00:00.000Z')
    })

    it('beholder instant for behandletTidspunkt med offset', () => {
        const sykmelding = mapTilSykmelding({ ...baseSykmelding, behandletTidspunkt: '2026-03-29T12:00:00+02:00' })

        expect(sykmelding.behandletTidspunkt.toISOString()).toBe('2026-03-29T10:00:00.000Z')
    })
})

describe('mapTilSykmelding periodefelter', () => {
    it('konverterer sykmeldingsperioder.fom/tom til Date', () => {
        const sykmelding = mapTilSykmelding(baseSykmelding)

        expect(sykmelding.sykmeldingsperioder[0].fom).toBeInstanceOf(Date)
        expect(sykmelding.sykmeldingsperioder[0].tom).toBeInstanceOf(Date)
    })
})

describe('mapTilSykmelding påkrevde datofelter kaster ved ugyldig verdi', () => {
    it('kaster for mottattTidspunkt', () => {
        expect(() => mapTilSykmelding({ ...baseSykmelding, mottattTidspunkt: '2026-13-01' })).toThrow(
            'Ugyldig datoverdi i mottattTidspunkt: 2026-13-01',
        )
    })

    it('kaster for behandletTidspunkt', () => {
        expect(() => mapTilSykmelding({ ...baseSykmelding, behandletTidspunkt: '2026-13-01' })).toThrow(
            'Ugyldig datoverdi i behandletTidspunkt: 2026-13-01',
        )
    })

    it('kaster for sykmeldingStatus.timestamp', () => {
        expect(() =>
            mapTilSykmelding({
                ...baseSykmelding,
                sykmeldingStatus: { ...baseSykmelding.sykmeldingStatus, timestamp: '2026-13-01' },
            }),
        ).toThrow('Ugyldig datoverdi i sykmeldingStatus.timestamp: 2026-13-01')
    })

    it('kaster for sykmeldingsperioder.fom', () => {
        expect(() =>
            mapTilSykmelding({
                ...baseSykmelding,
                sykmeldingsperioder: [{ ...baseSykmelding.sykmeldingsperioder[0], fom: '2026-13-01' }],
            }),
        ).toThrow('Ugyldig datoverdi i sykmeldingsperioder.fom: 2026-13-01')
    })

    it('kaster for sykmeldingsperioder.tom', () => {
        expect(() =>
            mapTilSykmelding({
                ...baseSykmelding,
                sykmeldingsperioder: [{ ...baseSykmelding.sykmeldingsperioder[0], tom: '2026-13-01' }],
            }),
        ).toThrow('Ugyldig datoverdi i sykmeldingsperioder.tom: 2026-13-01')
    })

    it('kaster for hendelser.hendelseOpprettet', () => {
        expect(() =>
            mapTilSykmelding({
                ...baseSykmelding,
                hendelser: [
                    {
                        status: 'APEN',
                        brukerSvar: null,
                        tilleggsinfo: null,
                        source: null,
                        hendelseOpprettet: '2026-13-01',
                        lokaltOpprettet: '2026-03-01T10:00:00Z',
                    },
                ],
            }),
        ).toThrow('Ugyldig datoverdi i hendelser.hendelseOpprettet: 2026-13-01')
    })

    it('kaster for hendelser.lokaltOpprettet', () => {
        expect(() =>
            mapTilSykmelding({
                ...baseSykmelding,
                hendelser: [
                    {
                        status: 'APEN',
                        brukerSvar: null,
                        tilleggsinfo: null,
                        source: null,
                        hendelseOpprettet: '2026-03-01T10:00:00Z',
                        lokaltOpprettet: '2026-13-01',
                    },
                ],
            }),
        ).toThrow('Ugyldig datoverdi i hendelser.lokaltOpprettet: 2026-13-01')
    })
})
