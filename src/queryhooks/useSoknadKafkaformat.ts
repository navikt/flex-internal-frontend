import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

export function useSoknadKafkaformat(
    soknadId: string | undefined,
    enabled = true,
): UseQueryResult<object | null, Error> {
    return useQuery<object | null, Error>({
        queryKey: ['soknadid-kafkaformat', soknadId],
        enabled: enabled,
        queryFn: () => {
            if (soknadId === undefined) {
                return null
            }
            return fetchJsonMedRequestId(`/api/sykepengesoknad-backend/api/v3/soknader/${soknadId}/kafkaformat`, {
                method: 'GET',
                credentials: 'include',
            })
        },
    })
}
