import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

interface Metadata {
    tidspunkt: string
    kilde: string
    aarsak: string
}

export interface ArbeidssokerDetaljer {
    startet: Metadata
    avsluttet?: Metadata
}

export function useArbeidssoker(
    fnr: string | undefined,
    enabled: boolean,
): UseQueryResult<ArbeidssokerDetaljer[] | undefined, Error> {
    return useQuery<ArbeidssokerDetaljer[] | undefined, Error>({
        queryKey: ['arbeidssoker', fnr],
        enabled: enabled,
        queryFn: () => {
            if (fnr === undefined) {
                return undefined
            }
            return fetchJsonMedRequestId('/api/sykepengesoknad-backend/api/v1/flex/arbeidssokerregister', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fnr: fnr }),
            })
        },
    })
}
