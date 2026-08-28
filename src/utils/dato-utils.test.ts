import { format } from 'date-fns'
import { describe, expect, it } from 'vitest'

import { osloDate, tilOsloDatoFraDato, toDate } from './dato-utils'

const datoStr = (date: Date): string => format(date, 'yyyy-MM-dd')

describe('dato-utils', () => {
    it('toDate tolker dato uten tidssone som Oslo-dato på DST-overgangsdagen', () => {
        expect(datoStr(toDate('2026-03-29'))).toBe('2026-03-29')
    })

    it('toDate tolker dato med tidssone som UTC-tidspunkt', () => {
        expect(toDate('2026-03-29T12:00:00Z').toISOString()).toBe('2026-03-29T12:00:00.000Z')
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
