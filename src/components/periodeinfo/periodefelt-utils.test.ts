import { describe, it, expect } from 'vitest'

import { hentStatusFarge } from './periodefelt-utils'

describe('hentStatusFarge', () => {
    it('returnerer warning for AVBRUTT', () => {
        expect(hentStatusFarge('AVBRUTT')).toBe('warning')
    })

    it('returnerer warning for SLETTET', () => {
        expect(hentStatusFarge('SLETTET')).toBe('warning')
    })

    it('returnerer warning for UTGAATT', () => {
        expect(hentStatusFarge('UTGAATT')).toBe('warning')
    })

    it('returnerer success for SENDT', () => {
        expect(hentStatusFarge('SENDT')).toBe('success')
    })

    it('returnerer success for KORRIGERT', () => {
        expect(hentStatusFarge('KORRIGERT')).toBe('success')
    })

    it('returnerer info for NY', () => {
        expect(hentStatusFarge('NY')).toBe('info')
    })

    it('returnerer info for ukjent status', () => {
        expect(hentStatusFarge('UKJENT_STATUS')).toBe('info')
    })

    it('er case-insensitiv', () => {
        expect(hentStatusFarge('sendt')).toBe('success')
        expect(hentStatusFarge('Avbrutt')).toBe('warning')
        expect(hentStatusFarge('ny')).toBe('info')
    })
})
