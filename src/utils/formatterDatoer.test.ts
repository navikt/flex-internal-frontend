import { describe, expect, it } from 'vitest'

import { formatterTimestamp } from './formatterDatoer'

describe('formatterTimestamp', () => {
    it('bruker norsk locale eksplisitt for månedsnavn', () => {
        expect(formatterTimestamp('2026-05-15T12:34:00Z')).toMatch(/^15 mai 2026 \d{2}:\d{2}$/)
    })
})
