import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { fetchJsonMedRequestId } from '../utils/fetch'

interface VedtakDokument {
    dokumentId: string
    type: string
}

interface VedtakUtbetaling {
    utbetalingId?: string | null
    utbetalingType?: string
    [key: string]: unknown
}

interface VedtakData {
    dokumenter: VedtakDokument[]
    utbetaling: VedtakUtbetaling
    [key: string]: unknown
}

export interface RSVedtakWrapper {
    id: string
    vedtak: VedtakData
    [key: string]: unknown
}

interface HentVedtakRequest {
    fnr: string
    soknadId: string
}

export function useVedtakForSoknad(
    fnr: string | undefined,
    soknadId: string,
): UseQueryResult<RSVedtakWrapper[], Error> {
    return useQuery<RSVedtakWrapper[], Error>({
        queryKey: ['vedtak-for-soknad', fnr, soknadId],
        enabled: false,
        staleTime: 0,
        queryFn: () => {
            if (!fnr) {
                throw new Error('Mangler fnr for vedtaksoppslag')
            }

            const requestBody: HentVedtakRequest = { fnr, soknadId }
            return fetchJsonMedRequestId<RSVedtakWrapper[]>('/api/spinnsyn-backend/api/v4/veileder/vedtak/soknad', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            })
        },
    })
}
