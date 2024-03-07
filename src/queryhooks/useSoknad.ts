import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

interface SoknadResponse {
    sykepengesoknad: object
    fnr: string
}

export function useSoknad(soknadId: string | undefined, enabled = true): UseQueryResult<SoknadResponse | null, Error> {
    return useQuery<SoknadResponse | null, Error>({
        queryKey: ['soknadid', soknadId],
        enabled: enabled,
        queryFn: () => {
            if (soknadId === undefined) {
                return null
            }
            return fetchJsonMedRequestId(`/api/sykepengesoknad-backend/api/v1/flex/sykepengesoknader/${soknadId}`, {
                method: 'GET',
                credentials: 'include',
            })
        },
    })
}
