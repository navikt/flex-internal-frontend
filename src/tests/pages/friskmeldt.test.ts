import { describe, expect, it } from 'vitest'

import { beregnUkerMellomDatoer } from '../../pages/friskmeldt'

describe('friskmeldt', () => {
    describe('beregnUkerMellomDatoer', () => {
        it('returnerer undefined når en dato mangler', () => {
            expect(beregnUkerMellomDatoer(undefined, new Date('2026-04-04T00:00:00.000Z'))).toBeUndefined()
        })

        it('teller kalenderdager over sommertid riktig', () => {
            expect(
                beregnUkerMellomDatoer(new Date('2026-03-28T00:00:00.000Z'), new Date('2026-04-11T00:00:00.000Z')),
            ).toBe(2)
        })
    })
})
