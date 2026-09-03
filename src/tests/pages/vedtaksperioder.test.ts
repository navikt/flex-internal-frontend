import { describe, expect, it } from 'vitest'

import { cronJobTidspunktFraDager } from '../../pages/vedtaksperioder'

describe('vedtaksperioder', () => {
    describe('cronJobTidspunktFraDager', () => {
        it('flytter base dato med ønsket antall dager', () => {
            const baseDato = new Date('2026-01-01T12:00:00.000Z')

            expect(cronJobTidspunktFraDager(baseDato, 14).toISOString()).toBe('2026-01-15T12:00:00.000Z')
        })
    })
})
