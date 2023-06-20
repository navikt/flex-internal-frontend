import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

interface IdentData {
    gruppe: string
    ident: string
}

export function useIdenter(fnr: string | undefined, enabled = true): UseQueryResult<IdentData[], Error> {
    return useQuery<IdentData[], Error>({
        queryKey: ['ident', fnr],
        enabled: enabled,
        queryFn: () => {
            if (fnr === undefined) {
                return []
            }
            return fetchJsonMedRequestId('/api/sykepengesoknad-backend/api/v1/flex/identer', {
                method: 'GET',
                credentials: 'include',
                headers: {
                    fnr: fnr,
                },
            })
        },
    })
}
