import { describe, expect, it } from 'vitest'

import { sykmeldingerTestdata } from '../testdata/sykmeldingerTestdata'
import { BackendSykmelding, mapTilSykmelding, Sykmelding } from '../queryhooks/useSykmeldinger'

import { toDate } from './dato-utils'
import { finnUgyldigPeriodeArsak, hentDatospenn, validerSykmeldingsDatoer } from './sykmeldingValidering'

const kopierRaSykmeldinger = (): BackendSykmelding[] => structuredClone(sykmeldingerTestdata)

const mapTilDomene = (sykmeldinger: BackendSykmelding[]): Sykmelding[] => sykmeldinger.map(mapTilSykmelding)

describe('finnUgyldigPeriodeArsak', () => {
    it('returnerer null for gyldig periode', () => {
        const periode = { fom: '2026-03-01', tom: '2026-03-31' }

        expect(finnUgyldigPeriodeArsak({ fom: toDate(periode.fom), tom: toDate(periode.tom) })).toBeNull()
    })

    it('returnerer mangler-fom-eller-tom når periode eller felt mangler', () => {
        expect(finnUgyldigPeriodeArsak(undefined)).toBe('mangler-fom-eller-tom')
        expect(finnUgyldigPeriodeArsak({ fom: undefined, tom: toDate('2026-03-31') })).toBe('mangler-fom-eller-tom')
        expect(finnUgyldigPeriodeArsak({ fom: toDate('2026-03-01'), tom: undefined })).toBe('mangler-fom-eller-tom')
    })

    it('returnerer ugyldig-datoformat for ugyldig dato (Invalid Date)', () => {
        const periode = { fom: '2026-02-30', tom: '2026-03-31' }

        expect(finnUgyldigPeriodeArsak({ fom: toDate(periode.fom), tom: toDate(periode.tom) })).toBe(
            'ugyldig-datoformat',
        )
    })

    it('returnerer ugyldig-datoformat for en direkte konstruert Invalid Date', () => {
        expect(finnUgyldigPeriodeArsak({ fom: new Date('ikke-en-dato'), tom: toDate('2026-03-31') })).toBe(
            'ugyldig-datoformat',
        )
    })

    it('returnerer aar-utenfor-grenser for år utenfor intervallet', () => {
        const periode = { fom: '1800-01-01', tom: '1800-01-10' }

        expect(finnUgyldigPeriodeArsak({ fom: toDate(periode.fom), tom: toDate(periode.tom) })).toBe(
            'aar-utenfor-grenser',
        )
    })

    it('returnerer for-lang-eller-negativ-periode for tom før fom', () => {
        const periode = { fom: '2026-03-10', tom: '2026-03-01' }

        expect(finnUgyldigPeriodeArsak({ fom: toDate(periode.fom), tom: toDate(periode.tom) })).toBe(
            'for-lang-eller-negativ-periode',
        )
    })

    it('returnerer for-lang-eller-negativ-periode for ekstrem varighet', () => {
        const periode = { fom: '2026-01-01', tom: '2040-01-01' }

        expect(finnUgyldigPeriodeArsak({ fom: toDate(periode.fom), tom: toDate(periode.tom) })).toBe(
            'for-lang-eller-negativ-periode',
        )
    })

    it('godtar ett-dags periode der fom er lik tom (inklusiv range)', () => {
        const periode = { fom: '2026-05-01', tom: '2026-05-01' }

        expect(finnUgyldigPeriodeArsak({ fom: toDate(periode.fom), tom: toDate(periode.tom) })).toBeNull()
    })

    it('gir riktig kalenderdag-antall over sommertid-start i mars (23-timers døgn) og godtar perioden', () => {
        // 2026-03-29 er DST-start i Oslo. Skal fortsatt regnes som en gyldig, kort periode.
        const periode = { fom: '2026-03-28', tom: '2026-03-30' }

        expect(finnUgyldigPeriodeArsak({ fom: toDate(periode.fom), tom: toDate(periode.tom) })).toBeNull()
    })

    it('gir riktig kalenderdag-antall over sommertid-slutt i oktober (25-timers døgn) og godtar perioden', () => {
        const periode = { fom: '2026-10-24', tom: '2026-10-26' }

        expect(finnUgyldigPeriodeArsak({ fom: toDate(periode.fom), tom: toDate(periode.tom) })).toBeNull()
    })

    it('godtar periode som krysser skuddårsdagen 29. februar', () => {
        const periode = { fom: '2024-02-28', tom: '2024-03-01' }

        expect(finnUgyldigPeriodeArsak({ fom: toDate(periode.fom), tom: toDate(periode.tom) })).toBeNull()
    })
})

describe('validerSykmeldingsDatoer', () => {
    it('beholder alle gyldige sykmeldinger fra testdata', () => {
        const sykmeldinger = mapTilDomene(kopierRaSykmeldinger())

        expect(validerSykmeldingsDatoer(sykmeldinger)).toHaveLength(sykmeldinger.length)
    })

    it('kaster feil ved ugyldig datoformat i sykmelding', () => {
        const sykmeldinger = kopierRaSykmeldinger()
        sykmeldinger[0].sykmeldingsperioder[0].fom = '2026-13-01'

        expect(() => mapTilDomene(sykmeldinger)).toThrow('Ugyldig datoverdi i sykmeldingsperioder.fom')
    })

    it('filtrerer bort sykmelding med tom før fom', () => {
        const sykmeldinger = kopierRaSykmeldinger()
        sykmeldinger[0].sykmeldingsperioder[0].fom = '2026-03-20'
        sykmeldinger[0].sykmeldingsperioder[0].tom = '2026-03-10'

        const resultat = validerSykmeldingsDatoer(mapTilDomene(sykmeldinger))

        expect(resultat.some((sykmelding) => sykmelding.id === sykmeldinger[0].id)).toBe(false)
    })

    it('filtrerer bort sykmelding med tom id', () => {
        const sykmeldinger = mapTilDomene(kopierRaSykmeldinger())
        sykmeldinger[0].id = ' '

        const resultat = validerSykmeldingsDatoer(sykmeldinger)

        expect(resultat).toHaveLength(sykmeldinger.length - 1)
    })

    it('beholder sykmelding med ett-dags periode (fom lik tom)', () => {
        const sykmeldinger = kopierRaSykmeldinger()
        sykmeldinger[0].sykmeldingsperioder[0].fom = '2026-05-01'
        sykmeldinger[0].sykmeldingsperioder[0].tom = '2026-05-01'

        const resultat = validerSykmeldingsDatoer(mapTilDomene(sykmeldinger))

        expect(resultat.some((sykmelding) => sykmelding.id === sykmeldinger[0].id)).toBe(true)
    })
})

describe('hentDatospenn', () => {
    it('finner minste fom og største tom fra gyldige sykmeldinger', () => {
        const sykmeldinger = mapTilDomene(kopierRaSykmeldinger())

        const datospenn = hentDatospenn(sykmeldinger)

        expect(datospenn?.startDato.toISOString().slice(0, 10)).toBe('2023-01-01')
        expect(datospenn?.sluttDato.toISOString().slice(0, 10)).toBe('2026-06-20')
    })

    it('kaster feil nr en periode har ugyldig dato', () => {
        const sykmeldinger = kopierRaSykmeldinger()
        sykmeldinger[0].sykmeldingsperioder[0].tom = 'ikke-en-dato'

        expect(() => mapTilDomene(sykmeldinger)).toThrow('Ugyldig datoverdi i sykmeldingsperioder.tom')
    })

    it('returnerer null når tidslinjen blir ekstremt lang', () => {
        const sykmeldinger = kopierRaSykmeldinger()
        sykmeldinger[0].sykmeldingsperioder[0].fom = '1900-01-01'
        sykmeldinger[0].sykmeldingsperioder[0].tom = '2099-12-31'

        expect(hentDatospenn(mapTilDomene(sykmeldinger))).toBeNull()
    })

    it('returnerer null når perioder-listen er tom', () => {
        expect(hentDatospenn([])).toBeNull()
    })

    it('gir riktig antall kalenderdager i spennet over en sommertid-overgang', () => {
        const sykmeldinger = kopierRaSykmeldinger()
        sykmeldinger[0].sykmeldingsperioder[0].fom = '2026-03-28'
        sykmeldinger[0].sykmeldingsperioder[0].tom = '2026-03-30'
        // Fjern øvrige perioder/sykmeldinger for et deterministisk, isolert spenn
        sykmeldinger[0].sykmeldingsperioder = [sykmeldinger[0].sykmeldingsperioder[0]]
        const enkeltSykmelding = [sykmeldinger[0]]

        const datospenn = hentDatospenn(mapTilDomene(enkeltSykmelding))

        expect(datospenn?.startDato.toISOString().slice(0, 10)).toBe('2026-03-28')
        expect(datospenn?.sluttDato.toISOString().slice(0, 10)).toBe('2026-03-30')
    })
})
