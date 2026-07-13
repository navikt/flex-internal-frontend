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

    it('kaller onFunnet med fnr når én aktiv FOLKEREGISTERIDENT finnes', async () => {
        const onFunnet = vi.fn()
        mockUseIdenter.mockReturnValue({
            data: [
                { gruppe: 'AKTORID', ident: '1234567890123', historisk: false },
                { gruppe: 'FOLKEREGISTERIDENT', ident: '12345678901', historisk: false },
            ],
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useAktorIdOppslag(onFunnet), { wrapper })
        act(() => result.current.settAktorId('1234567890123'))

        await waitFor(() => expect(onFunnet).toHaveBeenCalledWith('12345678901'))
        // Etter oppslag resetter hooken seg til inaktiv
        await waitFor(() => expect(result.current.resultat.status).toBe('inaktiv'))
    })

    it('bruker aktiv ident og ignorerer historisk når begge finnes', async () => {
        const onFunnet = vi.fn()
        mockUseIdenter.mockReturnValue({
            data: [
                { gruppe: 'FOLKEREGISTERIDENT', ident: '12345678901', historisk: false },
                { gruppe: 'FOLKEREGISTERIDENT', ident: '98765432109', historisk: true },
            ],
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useAktorIdOppslag(onFunnet), { wrapper })
        act(() => result.current.settAktorId('1234567890123'))

        await waitFor(() => expect(onFunnet).toHaveBeenCalledWith('12345678901'))
    })

    it('returnerer flereFunnet når to aktive FOLKEREGISTERIDENT finnes', async () => {
        mockUseIdenter.mockReturnValue({
            data: [
                { gruppe: 'FOLKEREGISTERIDENT', ident: '12345678901', historisk: false },
                { gruppe: 'FOLKEREGISTERIDENT', ident: '11111111111', historisk: false },
            ],
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useAktorIdOppslag(vi.fn()), { wrapper })
        act(() => result.current.settAktorId('1234567890123'))

        await waitFor(() => expect(result.current.resultat.status).toBe('flereFunnet'))
        if (result.current.resultat.status === 'flereFunnet') {
            expect(result.current.resultat.fnrListe).toEqual(['12345678901', '11111111111'])
        }
    })

    it('returnerer flereFunnet for alle historiske når ingen aktive finnes', async () => {
        mockUseIdenter.mockReturnValue({
            data: [
                { gruppe: 'FOLKEREGISTERIDENT', ident: '12345678901', historisk: true },
                { gruppe: 'FOLKEREGISTERIDENT', ident: '11111111111', historisk: true },
            ],
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useAktorIdOppslag(vi.fn()), { wrapper })
        act(() => result.current.settAktorId('1234567890123'))

        await waitFor(() => expect(result.current.resultat.status).toBe('flereFunnet'))
        if (result.current.resultat.status === 'flereFunnet') {
            expect(result.current.resultat.fnrListe).toHaveLength(2)
        }
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

    it('resetter til inaktiv etter vellykket oppslag', async () => {
        const onFunnet = vi.fn()
        mockUseIdenter.mockReturnValue({
            data: [{ gruppe: 'FOLKEREGISTERIDENT', ident: '12345678901', historisk: false }],
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useAktorIdOppslag(onFunnet), { wrapper })
        act(() => result.current.settAktorId('1234567890123'))
        await waitFor(() => expect(onFunnet).toHaveBeenCalledWith('12345678901'))

        // Etter timeout resettes aktorId → status inaktiv
        await waitFor(() => expect(result.current.resultat.status).toBe('inaktiv'))
    })

    it('forblir flereFunnet til bruker manuelt resetter med settAktorId(undefined)', async () => {
        mockUseIdenter.mockReturnValue({
            data: [
                { gruppe: 'FOLKEREGISTERIDENT', ident: '12345678901', historisk: false },
                { gruppe: 'FOLKEREGISTERIDENT', ident: '11111111111', historisk: false },
            ],
            isLoading: false,
            isError: false,
        })

        const { result } = renderHook(() => useAktorIdOppslag(vi.fn()), { wrapper })
        act(() => result.current.settAktorId('1234567890123'))
        await waitFor(() => expect(result.current.resultat.status).toBe('flereFunnet'))

        act(() => result.current.settAktorId(undefined))
        expect(result.current.resultat.status).toBe('inaktiv')
    })
})
