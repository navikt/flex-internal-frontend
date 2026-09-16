import React from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import { useVedtakForSoknad } from './useVedtakForSoknad'

const fetchJsonMedRequestIdMock = vi.fn()

vi.mock('../utils/fetch', () => ({
    fetchJsonMedRequestId: (...args: unknown[]) => fetchJsonMedRequestIdMock(...args),
}))

function wrapper({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })

    return React.createElement(QueryClientProvider, { client: queryClient }, children)
}

describe('useVedtakForSoknad', () => {
    const fnr = '12345678901'
    const soknadId = '11111111-1111-1111-1111-111111111111'

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('henter ikke data før refetch', async () => {
        fetchJsonMedRequestIdMock.mockResolvedValue([])
        renderHook(() => useVedtakForSoknad(fnr, soknadId), { wrapper })

        await new Promise((resolve) => setTimeout(resolve, 10))

        expect(fetchJsonMedRequestIdMock).not.toHaveBeenCalled()
    })

    it('sender POST med korrekt body ved refetch', async () => {
        fetchJsonMedRequestIdMock.mockResolvedValue([{ id: 'vedtak-1', vedtak: { dokumenter: [], utbetaling: {} } }])
        const { result } = renderHook(() => useVedtakForSoknad(fnr, soknadId), { wrapper })

        let refetchResult: Awaited<ReturnType<typeof result.current.refetch>> | undefined
        await act(async () => {
            refetchResult = await result.current.refetch()
        })

        expect(fetchJsonMedRequestIdMock).toHaveBeenCalledWith('/api/spinnsyn-backend/api/v4/veileder/vedtak/soknad', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fnr, soknadId }),
        })

        expect(refetchResult?.data).toHaveLength(1)
    })

    it('gjør nytt backendkall for hvert refetch', async () => {
        fetchJsonMedRequestIdMock.mockResolvedValue([{ id: 'vedtak-1', vedtak: { dokumenter: [], utbetaling: {} } }])
        const { result } = renderHook(() => useVedtakForSoknad(fnr, soknadId), { wrapper })

        await act(async () => {
            await result.current.refetch()
            await result.current.refetch()
        })

        expect(fetchJsonMedRequestIdMock).toHaveBeenCalledTimes(2)
    })

    it('eksponerer feil fra backend', async () => {
        fetchJsonMedRequestIdMock.mockRejectedValue(new Error('Backendfeil'))
        const { result } = renderHook(() => useVedtakForSoknad(fnr, soknadId), { wrapper })

        let refetchResult: Awaited<ReturnType<typeof result.current.refetch>> | undefined
        await act(async () => {
            refetchResult = await result.current.refetch()
        })

        expect(refetchResult?.isError).toBe(true)
    })

    it('isolerer cache mellom query keys', async () => {
        fetchJsonMedRequestIdMock
            .mockResolvedValueOnce([{ id: 'vedtak-A', vedtak: { dokumenter: [], utbetaling: {} } }])
            .mockResolvedValueOnce([{ id: 'vedtak-B', vedtak: { dokumenter: [], utbetaling: {} } }])

        const { result: første } = renderHook(
            () => useVedtakForSoknad('12345678901', '11111111-1111-1111-1111-111111111111'),
            { wrapper },
        )

        let førsteRefetch: Awaited<ReturnType<typeof første.current.refetch>> | undefined
        await act(async () => {
            førsteRefetch = await første.current.refetch()
        })

        expect(førsteRefetch?.data?.[0]?.id).toBe('vedtak-A')

        const { result: andre } = renderHook(
            () => useVedtakForSoknad('10987654321', '22222222-2222-2222-2222-222222222222'),
            { wrapper },
        )

        let andreRefetch: Awaited<ReturnType<typeof andre.current.refetch>> | undefined
        await act(async () => {
            andreRefetch = await andre.current.refetch()
        })

        expect(andreRefetch?.data?.[0]?.id).toBe('vedtak-B')
    })
})
