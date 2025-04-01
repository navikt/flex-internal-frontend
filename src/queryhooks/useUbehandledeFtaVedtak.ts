import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

import { FtaVedtak } from './useFtaVedtak'

export function useUbehandledeFtaVedtak(): UseQueryResult<FtaVedtak[], Error> {
    return useQuery<FtaVedtak[], Error>({
        queryKey: ['ubehandlede-fta-vedtak'],
        queryFn: () => {
            return fetchJsonMedRequestId('/api/sykepengesoknad-backend/api/v1/flex/fta-vedtak/ubehandlede', {
                method: 'GET',
            })
        },
    })
}
