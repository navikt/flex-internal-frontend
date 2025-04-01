import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

export interface FtaVedtak {
    id: string
    opprettet: string
    vedtakUuid: string
    fom: string
    tom: string
    fnr: string
    behandletStatus: string
    behandletTidspunkt?: string
    avsluttetTidspunkt?: string
}

export function useFtaVedtak(fnr: string): UseQueryResult<FtaVedtak[], Error> {
    return useQuery<FtaVedtak[], Error>({
        queryKey: ['fta-vedtak-for-person', fnr],
        queryFn: () => {
            return fetchJsonMedRequestId('/api/sykepengesoknad-backend/api/v1/flex/fta-vedtak-for-person', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fnr: fnr }),
            })
        },
    })
}
