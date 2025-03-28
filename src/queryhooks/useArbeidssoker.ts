import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

export function useArbeidssoker(fnr: string | undefined, enabled: boolean): UseQueryResult<object | null, Error> {
    return useQuery<object | null, Error>({
        queryKey: ['arbeidssoker', fnr],
        enabled: enabled,
        queryFn: () => {
            if (fnr === undefined) {
                return null
            }
            return fetchJsonMedRequestId('/api/sykepengesoknad-backend/api/v1/flex/arbeidssokerregister', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fnr: fnr }),
            })
        },
    })
}
