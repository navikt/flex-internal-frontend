import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

export function useAareg(fnr: string | undefined, enabled = true): UseQueryResult<object | null, Error> {
    return useQuery<object | null, Error>({
        queryKey: ['aareg', fnr],
        enabled: enabled,
        queryFn: () => {
            if (fnr === undefined) {
                return null
            }
            return fetchJsonMedRequestId('/api/sykepengesoknad-backend/api/v1/flex/aareg', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fnr: fnr }),
            })
        },
    })
}
