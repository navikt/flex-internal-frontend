import { describe, expect, it } from 'vitest'

import { sykmeldingerTestdata } from '../testdata/sykmeldingerTestdata'
import type { Sykmelding } from '../queryhooks/useSykmeldinger'

import { finnUgyldigPeriodeArsak, hentDatospenn, validerSykmeldingsDatoer } from './sykmeldingValidering'

const kopierSykmeldinger = (): Sykmelding[] => structuredClone(sykmeldingerTestdata)

describe('finnUgyldigPeriodeArsak', () => {
    it('returnerer null for gyldig periode', () => {
        const periode = { fom: '2026-03-01', tom: '2026-03-31' }

        expect(finnUgyldigPeriodeArsak(periode)).toBeNull()
    })

    it('returnerer ugyldig-datoformat for ugyldig dato', () => {
        const periode = { fom: '2026-02-30', tom: '2026-03-31' }

        expect(finnUgyldigPeriodeArsak(periode)).toBe('ugyldig-datoformat')
    })

    it('returnerer aar-utenfor-grenser for år utenfor intervallet', () => {
        const periode = { fom: '1800-01-01', tom: '1800-01-10' }

        expect(finnUgyldigPeriodeArsak(periode)).toBe('aar-utenfor-grenser')
    })

    it('returnerer for-lang-eller-negativ-periode for tom før fom', () => {
        const periode = { fom: '2026-03-10', tom: '2026-03-01' }

        expect(finnUgyldigPeriodeArsak(periode)).toBe('for-lang-eller-negativ-periode')
    })

    it('returnerer for-lang-eller-negativ-periode for ekstrem varighet', () => {
        const periode = { fom: '2026-01-01', tom: '2040-01-01' }

        expect(finnUgyldigPeriodeArsak(periode)).toBe('for-lang-eller-negativ-periode')
    })
})

describe('validerSykmeldingsDatoer', () => {
    it('beholder alle gyldige sykmeldinger fra testdata', () => {
        const sykmeldinger = kopierSykmeldinger()

        expect(validerSykmeldingsDatoer(sykmeldinger)).toHaveLength(sykmeldinger.length)
    })

    it('filtrerer bort sykmelding med ugyldig datoformat', () => {
        const sykmeldinger = kopierSykmeldinger()
        sykmeldinger[0].sykmeldingsperioder[0].fom = '2026-13-01'

        const resultat = validerSykmeldingsDatoer(sykmeldinger)

        expect(resultat).toHaveLength(sykmeldinger.length - 1)
        expect(resultat.some((sykmelding) => sykmelding.id === sykmeldinger[0].id)).toBe(false)
    })

    it('filtrerer bort sykmelding med tom før fom', () => {
        const sykmeldinger = kopierSykmeldinger()
        sykmeldinger[0].sykmeldingsperioder[0].fom = '2026-03-20'
        sykmeldinger[0].sykmeldingsperioder[0].tom = '2026-03-10'

        const resultat = validerSykmeldingsDatoer(sykmeldinger)

        expect(resultat.some((sykmelding) => sykmelding.id === sykmeldinger[0].id)).toBe(false)
    })

    it('filtrerer bort sykmelding med tom id', () => {
        const sykmeldinger = kopierSykmeldinger()
        sykmeldinger[0].id = ' '

        const resultat = validerSykmeldingsDatoer(sykmeldinger)

        expect(resultat).toHaveLength(sykmeldinger.length - 1)
    })
})

describe('hentDatospenn', () => {
    it('finner minste fom og største tom fra gyldige sykmeldinger', () => {
        const sykmeldinger = kopierSykmeldinger()

        const datospenn = hentDatospenn(sykmeldinger)

        expect(datospenn?.startDato.toISOString().slice(0, 10)).toBe('2026-03-01')
        expect(datospenn?.sluttDato.toISOString().slice(0, 10)).toBe('2026-05-20')
    })

    it('returnerer null når en periode har ugyldig dato', () => {
        const sykmeldinger = kopierSykmeldinger()
        sykmeldinger[0].sykmeldingsperioder[0].tom = 'ikke-en-dato'

        expect(hentDatospenn(sykmeldinger)).toBeNull()
    })

    it('returnerer null når tidslinjen blir ekstremt lang', () => {
        const sykmeldinger = kopierSykmeldinger()
        sykmeldinger[0].sykmeldingsperioder[0].fom = '1900-01-01'
        sykmeldinger[0].sykmeldingsperioder[0].tom = '2099-12-31'

        expect(hentDatospenn(sykmeldinger)).toBeNull()
    })
})
