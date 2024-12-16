import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

export function useSigrun(
    fnr: string | undefined,
    inntektsaar: string | undefined,
    enabled: boolean,
): UseQueryResult<object | null, Error> {
    return useQuery<object | null, Error>({
        queryKey: ['aareg', fnr, inntektsaar],
        enabled: enabled,
        queryFn: () => {
            if (fnr === undefined) {
                return null
            }
            return fetchJsonMedRequestId('/api/sykepengesoknad-backend/api/v1/flex/sigrun', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fnr: fnr, inntektsaar: inntektsaar }),
            })
        },
    })
}
