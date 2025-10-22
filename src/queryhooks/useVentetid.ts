import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

export interface FomTomPeriode {
    fom: string
    tom: string
}

export interface VentetidResponse {
    erUtenforVentetid: boolean
    ventetid: FomTomPeriode | null
    sykmeldingsperiode: FomTomPeriode | null
}

export function useVentetid(
    sykmeldingId: string | undefined,
    enabled = true,
): UseQueryResult<VentetidResponse | null, Error> {
    return useQuery<VentetidResponse | null, Error>({
        queryKey: ['ventetid', sykmeldingId],
        enabled: enabled,
        queryFn: () => {
            if (sykmeldingId === undefined) {
                return null
            }
            return fetchJsonMedRequestId(`/api/flex-syketilfelle/api/v1/internal/ventetid/${sykmeldingId}`, {
                method: 'GET',
                credentials: 'include',
            })
        },
    })
}
