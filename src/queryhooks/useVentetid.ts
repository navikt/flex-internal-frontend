import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

export interface Ventetid {
    fom: string
    tom: string
}

interface HentVentetidRequest {
    fnr: string
    sykmeldingId: string
}

export function useVentetid(
    fnr: string | undefined,
    sykmeldingId: string | undefined,
    enabled = true,
): UseQueryResult<Ventetid | null, Error> {
    return useQuery<Ventetid | null, Error>({
        queryKey: ['ventetid', fnr, sykmeldingId],
        enabled: enabled && !!fnr && !!sykmeldingId,
        queryFn: () => {
            if (!fnr || !sykmeldingId) {
                return null
            }
            const body: HentVentetidRequest = { fnr, sykmeldingId }
            return fetchJsonMedRequestId('/api/sykepengesoknad-backend/api/v1/flex/ventetid', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
        },
    })
}
