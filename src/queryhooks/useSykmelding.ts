import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

import type { Sykmelding } from './useSykmeldinger'

export interface SykmeldingResponse {
    sykmelding: Sykmelding
    fnr?: string | null
}
export function useSykmelding(
    sykmeldingId: string | undefined,
    enabled = true,
): UseQueryResult<SykmeldingResponse | null, Error> {
    return useQuery<SykmeldingResponse | null, Error>({
        queryKey: ['sykmeldingid', sykmeldingId],
        enabled: enabled,
        queryFn: () => {
            if (sykmeldingId === undefined) {
                return null
            }
            return fetchJsonMedRequestId<SykmeldingResponse>(
                `/api/flex-sykmeldinger-backend/api/v1/flex/sykmeldinger/${sykmeldingId}`,
                {
                    method: 'GET',
                    credentials: 'include',
                },
            )
        },
    })
}
