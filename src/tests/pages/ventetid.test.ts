import { describe, expect, it } from 'vitest'

import { beregnAntallKalenderdager } from '../../pages/ventetid'

describe('ventetid', () => {
    describe('beregnAntallKalenderdager', () => {
        it('returnerer null når periode mangler', () => {
            expect(beregnAntallKalenderdager(undefined)).toBeNull()
        })

        it('teller en dags periode inklusivt', () => {
            expect(beregnAntallKalenderdager({ fom: '2026-03-28', tom: '2026-03-28' })).toBe(1)
        })

        it('teller over høstovergangen uten å miste dager', () => {
            expect(beregnAntallKalenderdager({ fom: '2026-10-24', tom: '2026-10-25' })).toBe(2)
        })
    })
})
