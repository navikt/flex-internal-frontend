import React from 'react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { ValgtFnrProvider } from '../utils/useValgtFnr'

import IdOppslagSokefelt from './IdOppslagSokefelt'

const mockUseSoknad = vi.fn()
const mockUseSykmelding = vi.fn()

vi.mock('../queryhooks/useSoknad', () => ({
    useSoknad: (...args: unknown[]) => mockUseSoknad(...args),
}))

vi.mock('../queryhooks/useSykmelding', () => ({
    useSykmelding: (...args: unknown[]) => mockUseSykmelding(...args),
}))

const gyldigUuid1 = '11111111-1111-1111-1111-111111111111'
const gyldigUuid2 = '22222222-2222-2222-2222-222222222222'

function Wrapper({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return (
        <QueryClientProvider client={queryClient}>
            <ValgtFnrProvider>{children}</ValgtFnrProvider>
        </QueryClientProvider>
    )
}

describe('IdOppslagSokefelt – andre søk etter første', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseSoknad.mockReturnValue({ data: null, isFetching: false })
        mockUseSykmelding.mockReturnValue({ data: null, isFetching: false })
    })

    it('håndterer andre søk etter første søk uten å krasje', async () => {
        const { rerender } = render(<IdOppslagSokefelt />, { wrapper: Wrapper })
        const input = screen.getByLabelText('Søknad-ID eller sykmelding-ID')

        // Første søk: søknad funnet
        await userEvent.type(input, gyldigUuid1 + '{enter}')
        mockUseSoknad.mockReturnValue({
            data: { fnr: '12345678901', sykepengesoknad: { id: gyldigUuid1, sykmeldingId: null } },
            isFetching: false,
        })
        rerender(<IdOppslagSokefelt />)

        // Vent slik at setId(undefined)-timeren rekker å kjøre
        await new Promise((r) => setTimeout(r, 10))

        // Tilbakestill til ingen data (ny søk starter)
        mockUseSoknad.mockReturnValue({ data: null, isFetching: false })
        mockUseSykmelding.mockReturnValue({ data: null, isFetching: false })
        rerender(<IdOppslagSokefelt />)

        // Andre søk: sykmelding funnet
        await userEvent.clear(input)
        await userEvent.type(input, gyldigUuid2 + '{enter}')
        mockUseSykmelding.mockReturnValue({
            data: {
                sykmelding: {
                    id: gyldigUuid2,
                    sykmeldingsperioder: [],
                    pasient: { fnr: '98765432109', overSyttiAar: null },
                },
                fnr: '98765432109',
            },
            isFetching: false,
        })
        rerender(<IdOppslagSokefelt />)

        // Ingen feilmelding — komponenten krasjet ikke
        expect(screen.queryByText('Fant ikke fnr for oppgitt ID')).not.toBeInTheDocument()
    })
})
