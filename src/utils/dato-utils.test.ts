import { describe, expect, it } from 'vitest'

import {
    erGyldigDato,
    formaterDato,
    osloDate,
    tilOsloDatoFraDato,
    toDate,
    toDateEllerUndefined,
    toDatePaakrevd,
} from './dato-utils'

const datoStr = (date: Date): string => formaterDato(date, 'yyyy-MM-dd')

describe('dato-utils', () => {
    it.each([
        ['2026-03-28', '2026-03-28'],
        ['2026-03-29', '2026-03-29'],
        ['2026-03-30', '2026-03-30'],
        ['2026-10-25', '2026-10-25'],
    ])('toDate tolker dato uten tidssone som Oslo-dato for %s', (input, forventet) => {
        expect(datoStr(toDate(input))).toBe(forventet)
    })

    it('toDate tolker dato med tidssone som UTC-tidspunkt', () => {
        expect(toDate('2026-03-29T12:00:00Z').toISOString()).toBe('2026-03-29T12:00:00.000Z')
        expect(toDate('2026-03-29T12:00:00+02:00').toISOString()).toBe('2026-03-29T10:00:00.000Z')
    })

    it.each([undefined, null, ''])('toDateEllerUndefined gir undefined for tom eller manglende verdi', (input) => {
        expect(toDateEllerUndefined(input)).toBeUndefined()
    })

    it.each(['2026-02-30', '2026-13-01'])('toDateEllerUndefined gir undefined for ugyldig dato %s', (input) => {
        expect(toDateEllerUndefined(input)).toBeUndefined()
        expect(erGyldigDato(toDate(input))).toBe(false)
    })

    it.each(['2026-02-30', '2026-13-01'])('toDatePaakrevd kaster med feltnavn for ugyldig dato %s', (input) => {
        expect(() => toDatePaakrevd(input, 'mottattTidspunkt')).toThrow(
            `Ugyldig datoverdi i mottattTidspunkt: ${input}`,
        )
    })

    it('toDateEllerUndefined tolker datoer riktig', () => {
        const dato = toDateEllerUndefined('2026-03-29')
        if (!dato) {
            throw new Error('forventet dato')
        }

        expect(datoStr(dato)).toBe('2026-03-29')
    })

    it('erGyldigDato skiller gyldige og ugyldige datoer', () => {
        expect(erGyldigDato(new Date('2026-03-29'))).toBe(true)
        expect(erGyldigDato(new Date('tull'))).toBe(false)
        expect(erGyldigDato(null)).toBe(false)
        expect(erGyldigDato(undefined)).toBe(false)
        expect(erGyldigDato('2026-03-29')).toBe(false)
    })

    it('formaterDato bruker norsk månedsnavn', () => {
        expect(formaterDato(new Date(2026, 2, 29), 'd MMM yyyy')).toBe('29 mars 2026')
    })

    it('tilOsloDatoFraDato normaliserer til dagsnivå', () => {
        const dato = tilOsloDatoFraDato(new Date('2026-03-29T14:37:22Z'))

        expect(datoStr(dato)).toBe('2026-03-29')
    })

    it('osloDate bygger 29. mars 2026 riktig', () => {
        expect(datoStr(osloDate(2026, 3, 29))).toBe('2026-03-29')
    })

    it('tilOsloDatoFraDato gir riktig dag før, på og etter DST-overgangen', () => {
        expect(datoStr(tilOsloDatoFraDato(new Date('2026-03-28T23:30:00Z')))).toBe('2026-03-29')
        expect(datoStr(tilOsloDatoFraDato(new Date('2026-03-29T12:00:00Z')))).toBe('2026-03-29')
        expect(datoStr(tilOsloDatoFraDato(new Date('2026-03-30T00:30:00Z')))).toBe('2026-03-30')
    })

    it('tilOsloDatoFraDato holder 25. oktober som egen kalenderdag ved DST-slutt', () => {
        expect(datoStr(tilOsloDatoFraDato(new Date('2026-10-25T00:30:00Z')))).toBe('2026-10-25')
        expect(datoStr(tilOsloDatoFraDato(new Date('2026-10-25T22:30:00Z')))).toBe('2026-10-25')
    })
})
