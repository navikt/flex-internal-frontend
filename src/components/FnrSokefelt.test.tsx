import React from 'react'
import { vi, describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import FnrSokefelt from './FnrSokefelt'

vi.mock('../utils/useValgtFnr', () => ({
    useValgtFnr: () => ({
        fnr: '12345678901',
        settFnr: vi.fn(),
        nullstillFnr: vi.fn(),
        valgtPeriodeId: null,
        valgtDrawerKildeId: null,
        settValgtPeriode: vi.fn(),
        nullstillValgtPeriode: vi.fn(),
    }),
}))

describe('FnrSokefelt', () => {
    it('viser hentet fnr i input-feltet når context har fnr', () => {
        const qc = new QueryClient()
        render(
            <QueryClientProvider client={qc}>
                <FnrSokefelt label="Fødselsnummer" />
            </QueryClientProvider>,
        )
        const input = screen.getByLabelText('Fødselsnummer') as HTMLInputElement
        expect(input.value).toBe('12345678901')
    })
})
