import { renderHook, act, waitFor } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'

import { useAktorIdOppslag } from './useAktorIdOppslag'

const mockUseIdenter = vi.fn()

vi.mock('../queryhooks/useIdenter', () => ({
    useIdenter: (...args: unknown[]) => mockUseIdenter(...args),
}))

function wrapper({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useAktorIdOppslag', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockUseIdenter.mockReturnValue({ data: undefined, isLoading: false, isError: false })
    })

    it('starter med status inaktiv', () => {
        const { result } = renderHook(() => useAktorIdOppslag(vi.fn()), { wrapper })
        expect(result.current.resultat.status).toBe('inaktiv')
    })

    it('setter status laster under oppslag', async () => {
        mockUseIdenter.mockReturnValue({ data: undefined, isLoading: true, isError: false })

        const { result } = renderHook(() => useAktorIdOppslag(vi.fn()), { wrapper })
        act(() => result.current.settAktorId('1234567890123'))

        await waitFor(() => expect(result.current.resultat.status).toBe('laster'))
    })

    it('kaller onFunnet med fnr når FOLKEREGISTERIDENT finnes', async () => {
        const onFunnet = vi.fn()
        mockUseIdenter.mockReturnValue({
            data: [
                { gruppe: 'AKTORID', ident: '1234567890123' },
                { gruppe: 'FOLKEREGISTERIDENT', ident: '12345678901' },
            ],
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useAktorIdOppslag(onFunnet), { wrapper })
        act(() => result.current.settAktorId('1234567890123'))

        await waitFor(() => expect(onFunnet).toHaveBeenCalledWith('12345678901'))
        expect(result.current.resultat.status).toBe('funnet')
    })

    it('setter status feil når ingen FOLKEREGISTERIDENT finnes', async () => {
        const onFunnet = vi.fn()
        mockUseIdenter.mockReturnValue({
            data: [{ gruppe: 'AKTORID', ident: '1234567890123' }],
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useAktorIdOppslag(onFunnet), { wrapper })
        act(() => result.current.settAktorId('1234567890123'))

        await waitFor(() => expect(result.current.resultat.status).toBe('feil'))
        expect(onFunnet).not.toHaveBeenCalled()
        if (result.current.resultat.status === 'feil') {
            expect(result.current.resultat.melding).toBe('Fant ikke fødselsnummer for oppgitt aktørId')
        }
    })

    it('setter status feil ved API-feil', async () => {
        mockUseIdenter.mockReturnValue({ data: undefined, isLoading: false, isError: true })

        const { result } = renderHook(() => useAktorIdOppslag(vi.fn()), { wrapper })
        act(() => result.current.settAktorId('1234567890123'))

        await waitFor(() => expect(result.current.resultat.status).toBe('feil'))
        if (result.current.resultat.status === 'feil') {
            expect(result.current.resultat.melding).toBe('Feil ved oppslag av aktørId')
        }
    })

    it('resetter til inaktiv når settAktorId kalles med undefined', async () => {
        const onFunnet = vi.fn()
        mockUseIdenter.mockReturnValue({
            data: [{ gruppe: 'FOLKEREGISTERIDENT', ident: '12345678901' }],
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useAktorIdOppslag(onFunnet), { wrapper })
        act(() => result.current.settAktorId('1234567890123'))
        await waitFor(() => expect(result.current.resultat.status).toBe('funnet'))

        act(() => result.current.settAktorId(undefined))
        expect(result.current.resultat.status).toBe('inaktiv')
    })
})
