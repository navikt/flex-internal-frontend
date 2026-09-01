import { describe, expect, it } from 'vitest'

import { formatterTimestamp } from './formatterDatoer'

describe('formatterTimestamp', () => {
    it('bruker norsk locale eksplisitt for månedsnavn', () => {
        expect(formatterTimestamp('2026-05-15T12:34:00Z')).toBe('15 mai 2026 14:34')
    })
})
