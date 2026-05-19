import { describe, it, expect } from 'vitest'

import { beregnAktivTidsvindu, erPeriodeInnenforTidsvindu } from './tidslinjeUtils'

const dato = (isoString: string) => new Date(isoString)

describe('beregnAktivTidsvindu', () => {
    it('returnerer null når alle argumenter er null', () => {
        expect(beregnAktivTidsvindu(null, null, null, null)).toBeNull()
    })

    it('returnerer null når kun default-verdier er null', () => {
        expect(beregnAktivTidsvindu(null, null, null, null)).toBeNull()
    })

    it('bruker eksplisitte visningsdatoer når begge er satt', () => {
        const fra = dato('2024-01-01')
        const til = dato('2024-06-30')
        const result = beregnAktivTidsvindu(fra, til, null, null)
        expect(result).toEqual({ fra, til })
    })

    it('bruker default-datoer når eksplisitte datoer er null', () => {
        const defaultFra = dato('2024-02-01')
        const defaultTil = dato('2024-12-31')
        const result = beregnAktivTidsvindu(null, null, defaultFra, defaultTil)
        expect(result).toEqual({ fra: defaultFra, til: defaultTil })
    })

    it('foretrekker eksplisitte datoer over default-datoer', () => {
        const eksplisittFra = dato('2024-03-01')
        const eksplisittTil = dato('2024-09-30')
        const defaultFra = dato('2024-01-01')
        const defaultTil = dato('2024-12-31')
        const result = beregnAktivTidsvindu(eksplisittFra, eksplisittTil, defaultFra, defaultTil)
        expect(result).toEqual({ fra: eksplisittFra, til: eksplisittTil })
    })

    it('returnerer null når kun én av eksplisitte datoer er satt', () => {
        expect(beregnAktivTidsvindu(dato('2024-01-01'), null, null, null)).toBeNull()
        expect(beregnAktivTidsvindu(null, dato('2024-12-31'), null, null)).toBeNull()
    })

    it('returnerer null når kun én av default-datoer er satt', () => {
        expect(beregnAktivTidsvindu(null, null, dato('2024-01-01'), null)).toBeNull()
        expect(beregnAktivTidsvindu(null, null, null, dato('2024-12-31'))).toBeNull()
    })
})

describe('erPeriodeInnenforTidsvindu', () => {
    it('returnerer true når perioden er helt innenfor tidsvinduet', () => {
        expect(
            erPeriodeInnenforTidsvindu(dato('2024-03-01'), dato('2024-03-31'), dato('2024-01-01'), dato('2024-12-31')),
        ).toBe(true)
    })

    it('returnerer true når perioden overlapper starten av tidsvinduet', () => {
        expect(
            erPeriodeInnenforTidsvindu(dato('2023-12-01'), dato('2024-01-15'), dato('2024-01-01'), dato('2024-12-31')),
        ).toBe(true)
    })

    it('returnerer true når perioden overlapper slutten av tidsvinduet', () => {
        expect(
            erPeriodeInnenforTidsvindu(dato('2024-12-15'), dato('2025-01-15'), dato('2024-01-01'), dato('2024-12-31')),
        ).toBe(true)
    })

    it('returnerer true når perioden dekker hele tidsvinduet', () => {
        expect(
            erPeriodeInnenforTidsvindu(dato('2023-01-01'), dato('2025-12-31'), dato('2024-01-01'), dato('2024-12-31')),
        ).toBe(true)
    })

    it('returnerer false når perioden er helt før tidsvinduet', () => {
        expect(
            erPeriodeInnenforTidsvindu(dato('2023-01-01'), dato('2023-12-31'), dato('2024-01-01'), dato('2024-12-31')),
        ).toBe(false)
    })

    it('returnerer false når perioden er helt etter tidsvinduet', () => {
        expect(
            erPeriodeInnenforTidsvindu(dato('2025-01-01'), dato('2025-12-31'), dato('2024-01-01'), dato('2024-12-31')),
        ).toBe(false)
    })

    it('returnerer true for en periode som treffer nøyaktig grensen for tidsvinduet', () => {
        expect(
            erPeriodeInnenforTidsvindu(dato('2024-12-31'), dato('2025-01-31'), dato('2024-01-01'), dato('2024-12-31')),
        ).toBe(true)
    })
})
