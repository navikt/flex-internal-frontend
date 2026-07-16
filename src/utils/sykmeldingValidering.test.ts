import { describe, expect, it } from 'vitest'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import { sykmeldingerTestdata } from '../testdata/sykmeldingerTestdata'
import { BackendSykmelding, mapTilSykmelding, Sykmelding } from '../queryhooks/useSykmeldinger'

import { finnUgyldigPeriodeArsak, hentDatospenn, validerSykmeldingsDatoer } from './sykmeldingValidering'

dayjs.extend(customParseFormat)

const kopierRaSykmeldinger = (): BackendSykmelding[] => structuredClone(sykmeldingerTestdata)

const mapTilDomene = (sykmeldinger: BackendSykmelding[]): Sykmelding[] => sykmeldinger.map(mapTilSykmelding)

describe('finnUgyldigPeriodeArsak', () => {
    it('returnerer null for gyldig periode', () => {
        const periode = { fom: '2026-03-01', tom: '2026-03-31' }

        expect(finnUgyldigPeriodeArsak({ fom: dayjs(periode.fom), tom: dayjs(periode.tom) })).toBeNull()
    })

    it('returnerer ugyldig-datoformat for ugyldig dato', () => {
        const periode = { fom: '2026-02-30', tom: '2026-03-31' }

        expect(finnUgyldigPeriodeArsak({ fom: dayjs(periode.fom, 'YYYY-MM-DD', true), tom: dayjs(periode.tom) })).toBe(
            'ugyldig-datoformat',
        )
    })

    it('returnerer aar-utenfor-grenser for år utenfor intervallet', () => {
        const periode = { fom: '1800-01-01', tom: '1800-01-10' }

        expect(finnUgyldigPeriodeArsak({ fom: dayjs(periode.fom), tom: dayjs(periode.tom) })).toBe(
            'aar-utenfor-grenser',
        )
    })

    it('returnerer for-lang-eller-negativ-periode for tom før fom', () => {
        const periode = { fom: '2026-03-10', tom: '2026-03-01' }

        expect(finnUgyldigPeriodeArsak({ fom: dayjs(periode.fom), tom: dayjs(periode.tom) })).toBe(
            'for-lang-eller-negativ-periode',
        )
    })

    it('returnerer for-lang-eller-negativ-periode for ekstrem varighet', () => {
        const periode = { fom: '2026-01-01', tom: '2040-01-01' }

        expect(finnUgyldigPeriodeArsak({ fom: dayjs(periode.fom), tom: dayjs(periode.tom) })).toBe(
            'for-lang-eller-negativ-periode',
        )
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
})

describe('hentDatospenn', () => {
    it('finner minste fom og største tom fra gyldige sykmeldinger', () => {
        const sykmeldinger = mapTilDomene(kopierRaSykmeldinger())

        const datospenn = hentDatospenn(sykmeldinger)

        expect(datospenn?.startDato.toISOString().slice(0, 10)).toBe('2023-06-01')
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
})
