import { describe, expect, it } from 'vitest'

import { erGyldigDato, formaterDato, osloDate, tilOsloDatoFraDato, toDate, toDateEllerUndefined } from './dato-utils'

const datoStr = (date: Date): string => formaterDato(date, 'yyyy-MM-dd')

describe('dato-utils', () => {
    it('toDate tolker dato uten tidssone som Oslo-dato på DST-overgangsdagen', () => {
        expect(datoStr(toDate('2026-03-29'))).toBe('2026-03-29')
    })

    it('toDate tolker dato med tidssone som UTC-tidspunkt', () => {
        expect(toDate('2026-03-29T12:00:00Z').toISOString()).toBe('2026-03-29T12:00:00.000Z')
    })

    it('toDateEllerUndefined gir undefined for tomme verdier', () => {
        expect(toDateEllerUndefined(undefined)).toBeUndefined()
        expect(toDateEllerUndefined('')).toBeUndefined()
    })

    it('toDateEllerUndefined tolker datoer riktig', () => {
        expect(datoStr(toDateEllerUndefined('2026-03-29') as Date)).toBe('2026-03-29')
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
})
